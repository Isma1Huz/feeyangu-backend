<?php

namespace App\Services\Payment\Providers;

use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use Illuminate\Http\Request;

/**
 * Equity Bank Payment Provider (Jenga API)
 * 
 * TODO: Implement Equity Bank Jenga API integration
 */
class EquityPaymentProvider implements PaymentProviderInterface
{
    public function initiatePayment(PaymentTransaction $transaction): PaymentInitResult
    {
        // TODO: Implement Equity Bank Jenga API payment initiation
        return PaymentInitResult::failure('Equity Bank integration not yet implemented');
    }

    public function checkStatus(string $reference): PaymentStatusResult
    {
        // TODO: Implement Equity Bank status check
        return PaymentStatusResult::processing($reference, 'Equity Bank status check not implemented');
    }

    public function handleCallback(Request $request): void
    {
        // TODO: Implement Equity Bank callback handling
    }

    public function reversePayment(string $reference, string $reason = ''): bool
    {
        // TODO: Implement Equity Bank payment reversal
        return false;
    }

    public function getProviderName(): string
    {
        return 'equity';
    }

    public function validateConfiguration(): bool
    {
        return false; // Not configured yet
    }
}
