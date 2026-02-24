<?php

namespace App\Services\Payment;

use App\Services\Payment\Contracts\PaymentProviderInterface;
use App\Services\Payment\Providers\MpesaPaymentProvider;
use App\Services\Payment\Providers\KcbPaymentProvider;
use App\Services\Payment\Providers\EquityPaymentProvider;
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
            'ncba' => throw new InvalidArgumentException("NCBA payment provider not yet implemented"),
            'cooperative' => throw new InvalidArgumentException("Co-operative Bank payment provider not yet implemented"),
            'absa' => throw new InvalidArgumentException("Absa payment provider not yet implemented"),
            'stanbic' => throw new InvalidArgumentException("Stanbic payment provider not yet implemented"),
            'dtb' => throw new InvalidArgumentException("DTB payment provider not yet implemented"),
            'family' => throw new InvalidArgumentException("Family Bank payment provider not yet implemented"),
            'standard_chartered' => throw new InvalidArgumentException("Standard Chartered payment provider not yet implemented"),
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
            'ncba' => 'NCBA Bank (Coming Soon)',
            'cooperative' => 'Co-operative Bank (Coming Soon)',
            'absa' => 'Absa Bank (Coming Soon)',
            'stanbic' => 'Stanbic Bank (Coming Soon)',
            'dtb' => 'DTB Bank (Coming Soon)',
            'family' => 'Family Bank (Coming Soon)',
            'standard_chartered' => 'Standard Chartered (Coming Soon)',
        ];
    }

    /**
     * Check if a provider is implemented.
     *
     * @param string $provider
     * @return bool
     */
    public function isProviderImplemented(string $provider): bool
    {
        return in_array($provider, ['mpesa', 'kcb', 'equity']);
    }
}
