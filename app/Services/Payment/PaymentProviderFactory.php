<?php

namespace App\Services\Payment;

use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\Providers\MpesaPaymentProvider;
use App\Services\Payment\Providers\KcbPaymentProvider;
use App\Services\Payment\Providers\EquityPaymentProvider;
use App\Services\Payment\Providers\NcbaPaymentProvider;
use App\Services\Payment\Providers\CooperativePaymentProvider;
use InvalidArgumentException;

/**
 * Payment Provider Factory
 * 
 * Creates the appropriate payment provider instance based on provider name.
 */
class PaymentProviderFactory
{
    /**
     * Create a payment provider instance.
     *
     * @param string $provider The provider name (e.g., 'mpesa', 'kcb')
     * @return PaymentProviderInterface
     * @throws InvalidArgumentException If provider is not supported
     */
    public function make(string $provider): PaymentProviderInterface
    {
        return match ($provider) {
            'mpesa' => app(MpesaPaymentProvider::class),
            'kcb' => app(KcbPaymentProvider::class),
            'equity' => app(EquityPaymentProvider::class),
            'ncba' => app(NcbaPaymentProvider::class),
            'cooperative', 'coop' => app(CooperativePaymentProvider::class),
            'absa' => throw new InvalidArgumentException("Absa payment provider not yet implemented"),
            'stanbic' => throw new InvalidArgumentException("Stanbic payment provider not yet implemented"),
            'dtb' => throw new InvalidArgumentException("DTB payment provider not yet implemented"),
            'im_bank' => throw new InvalidArgumentException("I&M Bank payment provider not yet implemented"),
            'family_bank' => throw new InvalidArgumentException("Family Bank payment provider not yet implemented"),
            default => throw new InvalidArgumentException("Unsupported payment provider: {$provider}"),
        };
    }

    /**
     * Get list of supported providers.
     *
     * @return array
     */
    public function getSupportedProviders(): array
    {
        return [
            'mpesa' => 'M-Pesa (Safaricom)',
            'kcb' => 'KCB Bank',
            'equity' => 'Equity Bank',
            'ncba' => 'NCBA Bank',
            'cooperative' => 'Co-operative Bank',
            'absa' => 'Absa Bank (Coming Soon)',
            'stanbic' => 'Stanbic Bank (Coming Soon)',
            'dtb' => 'DTB Bank (Coming Soon)',
            'im_bank' => 'I&M Bank (Coming Soon)',
            'family_bank' => 'Family Bank (Coming Soon)',
        ];
    }

    /**
     * Check if a provider is fully implemented.
     *
     * @param string $provider
     * @return bool
     */
    public function isProviderImplemented(string $provider): bool
    {
        return in_array($provider, ['mpesa', 'kcb', 'equity']);
    }

    /**
     * Check if a provider is available (implemented or stub).
     *
     * @param string $provider
     * @return bool
     */
    public function isProviderAvailable(string $provider): bool
    {
        return in_array($provider, ['mpesa', 'kcb', 'equity', 'ncba', 'cooperative']);
    }
}
