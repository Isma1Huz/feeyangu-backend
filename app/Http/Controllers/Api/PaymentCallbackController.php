<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentWebhookLog;
use App\Services\Payment\PaymentProviderFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Payment Callback Controller
 * 
 * Handles webhooks/callbacks from payment providers (M-Pesa, Banks).
 * Logs all callbacks, verifies authenticity, and processes payment status updates.
 */
class PaymentCallbackController extends Controller
{
    public function __construct(
        private PaymentProviderFactory $factory
    ) {}

    /**
     * Handle payment callback from any provider.
     * 
     * Route: POST /api/payments/callback/{provider}
     *        POST /api/payments/callback/{provider}/{school}
     *
     * The {school} segment is the school ID and is used to route multi-tenant
     * webhooks without relying on subdomain routing.
     */
    public function handle(Request $request, string $provider, ?int $school = null): JsonResponse
    {
        $ipAddress = $request->ip();
        $headers = $request->headers->all();
        $payload = $request->all();

        // Log the webhook immediately
        $webhookLog = PaymentWebhookLog::create([
            'provider' => $provider,
            'payload' => $payload,
            'headers' => $headers,
            'ip_address' => $ipAddress,
            'status' => 'received',
        ]);

        try {
            Log::info("Payment callback received", [
                'provider' => $provider,
                'school_id' => $school,
                'ip' => $ipAddress,
                'webhook_id' => $webhookLog->id,
            ]);

            // Get the appropriate payment provider
            $paymentProvider = $this->factory->make($provider);

            // Handle the callback
            $paymentProvider->handleCallback($request);

            // Update webhook log
            $webhookLog->update([
                'status' => 'processed',
                'processed_at' => now(),
            ]);

            Log::info("Payment callback processed successfully", [
                'provider' => $provider,
                'webhook_id' => $webhookLog->id,
            ]);

            // Return appropriate response based on provider
            return $this->getProviderResponse($provider);

        } catch (\Exception $e) {
            Log::error("Payment callback processing failed", [
                'provider' => $provider,
                'webhook_id' => $webhookLog->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $webhookLog->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'processed_at' => now(),
            ]);

            // Return success to provider even on failure to prevent retries
            return $this->getProviderResponse($provider);
        }
    }

    /**
     * Get the appropriate response format for each provider.
     */
    private function getProviderResponse(string $provider): JsonResponse
    {
        return match($provider) {
            'mpesa' => response()->json([
                'ResultCode' => 0,
                'ResultDesc' => 'Success'
            ]),
            'kcb', 'equity', 'ncba', 'cooperative' => response()->json([
                'status' => 'success',
                'message' => 'Callback received'
            ]),
            default => response()->json(['success' => true])
        };
    }

    /**
     * Get payment status via API (for polling).
     * 
     * Route: GET /api/payments/{transactionId}/status
     */
    public function status(int $transactionId): JsonResponse
    {
        $transaction = \App\Models\PaymentTransaction::findOrFail($transactionId);

        return response()->json([
            'transaction_id' => $transaction->id,
            'reference' => $transaction->reference,
            'status' => $transaction->status,
            'amount' => $transaction->amount / 100, // Convert to KES
            'provider' => $transaction->provider,
            'created_at' => $transaction->created_at->toISOString(),
            'completed_at' => $transaction->completed_at?->toISOString(),
        ]);
    }

    /**
     * Manual payment confirmation endpoint.
     * 
     * Route: POST /api/payments/{transactionId}/confirm
     */
    public function confirmManual(Request $request, int $transactionId): JsonResponse
    {
        $validated = $request->validate([
            'provider_reference' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $transaction = \App\Models\PaymentTransaction::findOrFail($transactionId);

        if ($transaction->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Payment already completed'
            ], 400);
        }

        $transaction->update([
            'status' => 'manual_confirm',
            'provider_reference' => $validated['provider_reference'],
            'completed_at' => now(),
        ]);

        // Generate receipt
        $receiptNumber = 'RCT-' . date('Y') . '-' . str_pad($transaction->school_id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);

        \App\Models\Receipt::create([
            'school_id' => $transaction->school_id,
            'payment_transaction_id' => $transaction->id,
            'receipt_number' => $receiptNumber,
            'student_id' => $transaction->student_id,
            'amount' => $transaction->amount,
            'payment_method' => $transaction->provider,
            'payment_reference' => $validated['provider_reference'],
            'issued_at' => now(),
        ]);

        Log::info("Manual payment confirmation", [
            'transaction_id' => $transaction->id,
            'reference' => $validated['provider_reference'],
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment confirmed manually',
            'transaction' => $transaction
        ]);
    }
}
