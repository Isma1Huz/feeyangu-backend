<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\SchoolPaymentConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    /**
     * Display the payment methods configuration page.
     */
    public function index(): Response
    {
        $school = auth()->user()->school;

        if (!$school) {
            abort(403, 'No school assigned to user');
        }

        // Fetch payment configurations from database
        $paymentConfigs = $school->schoolPaymentConfigs()
            ->orderBy('sort_order')
            ->get()
            ->map(function ($config) {
                return [
                    'id' => (string) $config->id,
                    'provider' => $config->provider,
                    'enabled' => $config->enabled,
                    'accountNumber' => $config->account_number,
                    'accountName' => $config->account_name,
                    'paybillNumber' => $config->paybill_number,
                    'order' => $config->sort_order,
                ];
            })
            ->values()
            ->toArray();

        return Inertia::render('school/PaymentMethods', [
            'paymentConfigs' => $paymentConfigs,
        ]);
    }

    /**
     * Store a new payment configuration.
     */
    public function store(Request $request): JsonResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            return response()->json(['message' => 'No school assigned to user'], 403);
        }

        $validator = Validator::make($request->all(), [
            'provider' => 'required|string|in:mpesa,kcb,equity,ncba,coop,absa,stanbic,dtb,im_bank,family_bank',
            'accountNumber' => 'required|string|max:255',
            'accountName' => 'required|string|max:255',
            'paybillNumber' => 'nullable|string|max:255',
            'enabled' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        // Check if provider already exists for this school
        $existing = $school->schoolPaymentConfigs()
            ->where('provider', $request->provider)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'This payment provider is already configured'], 409);
        }

        // Get next sort order
        $maxOrder = $school->schoolPaymentConfigs()->max('sort_order') ?? 0;

        $config = $school->schoolPaymentConfigs()->create([
            'provider' => $request->provider,
            'account_number' => $request->accountNumber,
            'account_name' => $request->accountName,
            'paybill_number' => $request->paybillNumber,
            'enabled' => $request->enabled ?? true,
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json([
            'message' => 'Payment method added successfully',
            'config' => [
                'id' => (string) $config->id,
                'provider' => $config->provider,
                'enabled' => $config->enabled,
                'accountNumber' => $config->account_number,
                'accountName' => $config->account_name,
                'paybillNumber' => $config->paybill_number,
                'order' => $config->sort_order,
            ],
        ], 201);
    }

    /**
     * Update an existing payment configuration.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            return response()->json(['message' => 'No school assigned to user'], 403);
        }

        $config = $school->schoolPaymentConfigs()->find($id);

        if (!$config) {
            return response()->json(['message' => 'Payment configuration not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'accountNumber' => 'sometimes|required|string|max:255',
            'accountName' => 'sometimes|required|string|max:255',
            'paybillNumber' => 'nullable|string|max:255',
            'enabled' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $updateData = [];
        if ($request->has('accountNumber')) {
            $updateData['account_number'] = $request->accountNumber;
        }
        if ($request->has('accountName')) {
            $updateData['account_name'] = $request->accountName;
        }
        if ($request->has('paybillNumber')) {
            $updateData['paybill_number'] = $request->paybillNumber;
        }
        if ($request->has('enabled')) {
            $updateData['enabled'] = $request->enabled;
        }

        $config->update($updateData);

        return response()->json([
            'message' => 'Payment method updated successfully',
            'config' => [
                'id' => (string) $config->id,
                'provider' => $config->provider,
                'enabled' => $config->enabled,
                'accountNumber' => $config->account_number,
                'accountName' => $config->account_name,
                'paybillNumber' => $config->paybill_number,
                'order' => $config->sort_order,
            ],
        ]);
    }

    /**
     * Delete a payment configuration.
     */
    public function destroy(string $id): JsonResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            return response()->json(['message' => 'No school assigned to user'], 403);
        }

        $config = $school->schoolPaymentConfigs()->find($id);

        if (!$config) {
            return response()->json(['message' => 'Payment configuration not found'], 404);
        }

        $config->delete();

        return response()->json([
            'message' => 'Payment method deleted successfully',
        ]);
    }
}
