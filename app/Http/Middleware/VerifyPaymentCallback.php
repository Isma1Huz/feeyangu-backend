<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verify Payment Callback Middleware
 * 
 * Validates that payment callbacks are coming from trusted sources.
 * Includes IP whitelisting and basic security checks.
 */
class VerifyPaymentCallback
{
    /**
     * Allowed IP addresses for payment providers.
     * 
     * Note: Update these with actual provider IPs in production.
     */
    private array $allowedIps = [
        'mpesa' => [
            '196.201.214.200',  // Safaricom production IP (example)
            '196.201.214.206',  // Safaricom backup IP (example)
            '127.0.0.1',        // Local testing
            '::1',              // IPv6 local
        ],
        'kcb' => [
            '127.0.0.1',        // Update with actual KCB IPs
        ],
        'equity' => [
            '127.0.0.1',        // Update with actual Equity IPs
        ],
        'ncba' => [
            '127.0.0.1',        // Update with actual NCBA IPs
        ],
        'cooperative' => [
            '127.0.0.1',        // Update with actual Co-op IPs
        ],
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $provider): Response
    {
        // In development/testing, allow all IPs
        if (app()->environment(['local', 'testing'])) {
            return $next($request);
        }

        $clientIp = $request->ip();

        // Check if provider is configured
        if (!isset($this->allowedIps[$provider])) {
            \Log::warning("Payment callback from unknown provider", [
                'provider' => $provider,
                'ip' => $clientIp,
            ]);
            
            // Allow for now, but log
            return $next($request);
        }

        // Check if IP is whitelisted
        if (!in_array($clientIp, $this->allowedIps[$provider])) {
            \Log::error("Payment callback from unauthorized IP", [
                'provider' => $provider,
                'ip' => $clientIp,
                'allowed_ips' => $this->allowedIps[$provider],
            ]);

            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'IP address not authorized for payment callbacks'
            ], 403);
        }

        return $next($request);
    }
}
