<?php

namespace App\Services\Payment\Providers;

use App\Models\PaymentTransaction;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Co-operative Bank Payment Provider (Connect API)
 */
class CooperativePaymentProvider implements PaymentProviderInterface
{
    private string $apiKey;
    private string $accountNumber;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.cooperative.api_key', '');
        $this->accountNumber = config('services.cooperative.account_number', '');
        $this->baseUrl = config('services.cooperative.base_url', 'https://api.co-opbank.co.ke');
    }

    public function initiatePayment(PaymentTransaction $transaction): PaymentInitResult
    {
        if (!$this->validateConfiguration()) {
            return PaymentInitResult::failure('Co-operative Bank not configured');
        }

        return PaymentInitResult::failure('Co-operative Bank Connect API integration in progress');
    }

    public function checkStatus(string $reference): PaymentStatusResult
    {
        return PaymentStatusResult::processing($reference, 'Co-op status check in progress');
    }

    public function handleCallback(Request $request): void
    {
        Log::info('Co-operative Bank callback received', $request->all());
    }

    public function reversePayment(string $reference, string $reason = ''): bool
    {
        return false;
    }

    public function getProviderName(): string
    {
        return 'cooperative';
    }

    public function validateConfiguration(): bool
    {
        return !empty($this->apiKey) && !empty($this->accountNumber);
    }
}
