<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MpesaTransaction;
use App\Models\PaymentWebhookLog;
use App\Services\Payment\PaymentProviderFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * MpesaController
 *
 * Dedicated controller for M-Pesa STK Push initiations and callbacks.
 * Delegates to the MpesaPaymentProvider via the PaymentProviderFactory.
 */
class MpesaController extends Controller
{
    public function __construct(
        private readonly PaymentProviderFactory $factory
    ) {}

    /**
     * Initiate an M-Pesa STK Push payment.
     *
     * POST /api/mpesa/stk-push
     */
    public function stkPush(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone'     => 'required|string',
            'amount'    => 'required|numeric|min:1',
            'reference' => 'required|string',
        ]);

        try {
            $provider = $this->factory->make('mpesa');
            $result   = $provider->initiate($validated['amount'], $validated['reference'], [
                'phone' => $validated['phone'],
            ]);

            return response()->json([
                'success' => $result->success,
                'message' => $result->message,
                'data'    => $result->data,
            ], $result->success ? 200 : 422);
        } catch (\Throwable $e) {
            Log::error('MpesaController stkPush error', ['error' => $e->getMessage()]);

            return response()->json(['success' => false, 'message' => 'M-Pesa request failed.'], 500);
        }
    }

    /**
     * Handle M-Pesa callback (webhook).
     *
     * POST /api/mpesa/callback
     */
    public function callback(Request $request): JsonResponse
    {
        $payload = $request->all();

        PaymentWebhookLog::create([
            'provider'   => 'mpesa',
            'payload'    => $payload,
            'headers'    => $request->headers->all(),
            'ip_address' => $request->ip(),
            'status'     => 'received',
        ]);

        try {
            $provider = $this->factory->make('mpesa');
            $result   = $provider->handleCallback($payload);

            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Success']);
        } catch (\Throwable $e) {
            Log::error('MpesaController callback error', ['error' => $e->getMessage()]);

            return response()->json(['ResultCode' => 1, 'ResultDesc' => 'Error processing callback'], 500);
        }
    }

    /**
     * Query the status of an M-Pesa transaction.
     *
     * GET /api/mpesa/status/{transactionId}
     */
    public function queryStatus(Request $request, string $transactionId): JsonResponse
    {
        try {
            $provider = $this->factory->make('mpesa');
            $result   = $provider->checkStatus($transactionId);

            return response()->json([
                'success' => $result->success,
                'status'  => $result->status,
                'data'    => $result->data,
            ]);
        } catch (\Throwable $e) {
            Log::error('MpesaController queryStatus error', ['error' => $e->getMessage(), 'id' => $transactionId]);

            return response()->json(['success' => false, 'message' => 'Status query failed.'], 500);
        }
    }

    /**
     * List recent M-Pesa transactions (admin use).
     *
     * GET /api/mpesa/transactions
     */
    public function transactions(Request $request): JsonResponse
    {
        $transactions = MpesaTransaction::latest()
            ->limit(50)
            ->get(['id', 'mpesa_receipt', 'phone_number', 'amount', 'result_code', 'transaction_date', 'created_at']);

        return response()->json(['data' => $transactions]);
    }
}
