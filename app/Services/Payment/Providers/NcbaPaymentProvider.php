<?php

namespace App\Services\Payment\Providers;

use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Models\SchoolApiCredential;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * NCBA Bank Payment Provider (Loop API)
 *
 * Credentials are loaded per-school from SchoolApiCredential, with a
 * fallback to global config() values for backwards compatibility.
 */
class NcbaPaymentProvider implements PaymentProviderInterface
{
    private string $apiKey;
    private string $accountNumber;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey        = config('services.ncba.api_key')        ?? '';
        $this->accountNumber = config('services.ncba.account_number') ?? '';
        $this->baseUrl       = config('services.ncba.base_url')       ?? 'https://api.ncbagroup.com';
    }

    /**
     * Load per-school NCBA credentials, overriding any global config defaults.
     */
    private function loadCredentialsForSchool(int $schoolId): void
    {
        $cred = SchoolApiCredential::where('school_id', $schoolId)
            ->where('provider', 'ncba')
            ->where('enabled', true)
            ->first();

        if ($cred) {
            $this->apiKey        = $cred->credentials['api_key']        ?? $this->apiKey;
            $this->accountNumber = $cred->credentials['account_number'] ?? $this->accountNumber;
            $this->baseUrl       = $cred->credentials['base_url']       ?? $this->baseUrl;
        }
    }

    public function initiatePayment(PaymentTransaction $transaction): PaymentInitResult
    {
        $this->loadCredentialsForSchool($transaction->school_id);

        if (!$this->validateConfiguration()) {
            return PaymentInitResult::failure('NCBA Bank not configured');
        }

        return PaymentInitResult::failure('NCBA Loop API integration in progress');
    }

    public function checkStatus(string $reference): PaymentStatusResult
    {
        return PaymentStatusResult::processing($reference, 'NCBA status check in progress');
    }

    public function handleCallback(Request $request): void
    {
        Log::info('NCBA callback received', $request->all());
    }

    public function reversePayment(string $reference, string $reason = ''): bool
    {
        return false;
    }

    public function getProviderName(): string
    {
        return 'ncba';
    }

    public function validateConfiguration(): bool
    {
        return !empty($this->apiKey) && !empty($this->accountNumber);
    }
}
