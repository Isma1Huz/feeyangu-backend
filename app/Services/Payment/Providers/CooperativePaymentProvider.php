<?php

namespace App\Services\Payment\Providers;

use App\Models\PaymentTransaction;
use App\Models\SchoolApiCredential;
use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\DTOs\PaymentInitResult;
use App\Services\Payment\DTOs\PaymentStatusResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Co-operative Bank Payment Provider (Connect API)
 *
 * Credentials are loaded per-school from SchoolApiCredential, with a
 * fallback to global config() values for backwards compatibility.
 */
class CooperativePaymentProvider implements PaymentProviderInterface
{
    private string $apiKey;
    private string $accountNumber;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey        = config('services.cooperative.api_key')        ?? '';
        $this->accountNumber = config('services.cooperative.account_number') ?? '';
        $this->baseUrl       = config('services.cooperative.base_url')       ?? 'https://api.co-opbank.co.ke';
    }

    /**
     * Load per-school Co-op credentials, overriding any global config defaults.
     * The DB stores this provider as 'coop' (matching the enum value in school_api_credentials).
     */
    private function loadCredentialsForSchool(int $schoolId): void
    {
        $cred = SchoolApiCredential::where('school_id', $schoolId)
            ->whereIn('provider', ['coop', 'cooperative'])
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
