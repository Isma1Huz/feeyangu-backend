<?php

namespace App\Services\Payment\Contracts;

use App\Models\PaymentTransaction;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use Illuminate\Http\Request;

/**
 * Payment Provider Interface
 * 
 * All payment providers must implement this interface to ensure
 * consistent behavior across different payment gateways.
 */
interface PaymentProviderInterface
{
    /**
     * Initiate a payment transaction.
     *
     * @param PaymentTransaction $transaction The transaction to initiate
     * @return PaymentInitResult The result of the payment initiation
     */
    public function initiatePayment(PaymentTransaction $transaction): PaymentInitResult;

    /**
     * Check the status of a payment transaction.
     *
     * @param string $reference The payment reference/transaction ID
     * @return PaymentStatusResult The current status of the payment
     */
    public function checkStatus(string $reference): PaymentStatusResult;

    /**
     * Handle incoming callback/webhook from the payment provider.
     *
     * @param Request $request The incoming HTTP request
     * @return void
     */
    public function handleCallback(Request $request): void;

    /**
     * Reverse/refund a completed payment.
     *
     * @param string $reference The payment reference to reverse
     * @param string $reason The reason for reversal
     * @return bool True if reversal was successful
     */
    public function reversePayment(string $reference, string $reason = ''): bool;

    /**
     * Get the provider name.
     *
     * @return string The provider name (e.g., 'mpesa', 'kcb')
     */
    public function getProviderName(): string;

    /**
     * Validate provider configuration.
     *
     * @return bool True if configuration is valid
     */
    public function validateConfiguration(): bool;
}
