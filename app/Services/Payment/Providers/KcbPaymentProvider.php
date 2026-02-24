<?php

namespace App\Services\Payment\Providers;

use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use Illuminate\Http\Request;

/**
 * KCB Bank Payment Provider
 * 
 * TODO: Implement KCB Bank API integration
 */
class KcbPaymentProvider implements PaymentProviderInterface
{
    public function initiatePayment(PaymentTransaction $transaction): PaymentInitResult
    {
        // TODO: Implement KCB Bank payment initiation
        return PaymentInitResult::failure('KCB Bank integration not yet implemented');
    }

    public function checkStatus(string $reference): PaymentStatusResult
    {
        // TODO: Implement KCB Bank status check
        return PaymentStatusResult::processing($reference, 'KCB Bank status check not implemented');
    }

    public function handleCallback(Request $request): void
    {
        // TODO: Implement KCB Bank callback handling
    }

    public function reversePayment(string $reference, string $reason = ''): bool
    {
        // TODO: Implement KCB Bank payment reversal
        return false;
    }

    public function getProviderName(): string
    {
        return 'kcb';
    }

    public function validateConfiguration(): bool
    {
        return false; // Not configured yet
    }
}
