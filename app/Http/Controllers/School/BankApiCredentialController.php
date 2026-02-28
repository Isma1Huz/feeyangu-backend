<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\SchoolApiCredential;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class BankApiCredentialController extends Controller
{
    /**
     * Save (create or update) API credentials for a payment provider.
     */
    public function store(Request $request): JsonResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            return response()->json(['message' => 'No school assigned to user'], 403);
        }

        $validator = Validator::make($request->all(), [
            'provider'    => 'required|string|in:mpesa,kcb,equity,ncba,coop,absa,stanbic,dtb,im_bank,family_bank',
            'environment' => 'required|in:sandbox,production',
            'enabled'     => 'boolean',
            'values'      => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $credential = $school->apiCredentials()->updateOrCreate(
            ['provider' => $request->provider],
            [
                'environment' => $request->environment,
                'enabled'     => $request->boolean('enabled', false),
                'credentials' => $request->values,
            ]
        );

        return response()->json([
            'message'  => 'Credentials saved successfully',
            'provider' => $credential->provider,
            'enabled'  => $credential->enabled,
        ]);
    }

    /**
     * Test API credentials by making a lightweight call to the provider.
     */
    public function test(Request $request): JsonResponse
    {
        $school = auth()->user()->school;

        if (!$school) {
            return response()->json(['message' => 'No school assigned to user'], 403);
        }

        $validator = Validator::make($request->all(), [
            'provider'    => 'required|string|in:mpesa,kcb,equity,ncba,coop,absa,stanbic,dtb,im_bank,family_bank',
            'environment' => 'required|in:sandbox,production',
            'values'      => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $provider    = $request->provider;
        $environment = $request->environment;
        $values      = $request->values;

        try {
            $result = $this->testProviderConnection($provider, $environment, $values);

            if ($result['success']) {
                return response()->json(['message' => $result['message']]);
            }

            return response()->json(['message' => $result['message']], 400);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Connection test failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Attempt a lightweight authentication call for each provider.
     */
    private function testProviderConnection(string $provider, string $environment, array $values): array
    {
        $isSandbox = $environment === 'sandbox';

        switch ($provider) {
            case 'mpesa':
                return $this->testMpesa($isSandbox, $values);

            case 'equity':
                return $this->testEquity($isSandbox, $values);

            case 'kcb':
                return $this->testKcb($isSandbox, $values);

            case 'coop':
                return $this->testCoop($isSandbox, $values);

            default:
                // For other providers, accept the credentials without a live test
                return ['success' => true, 'message' => 'Credentials accepted (live test not available for this provider yet)'];
        }
    }

    private function testMpesa(bool $isSandbox, array $values): array
    {
        $consumerKey    = $values['consumer_key'] ?? '';
        $consumerSecret = $values['consumer_secret'] ?? '';
        $baseUrl        = $isSandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke';

        if (empty($consumerKey) || empty($consumerSecret)) {
            return ['success' => false, 'message' => 'Consumer key and secret are required'];
        }

        $response = Http::timeout(10)
            ->withBasicAuth($consumerKey, $consumerSecret)
            ->get("{$baseUrl}/oauth/v1/generate?grant_type=client_credentials");

        if ($response->successful() && isset($response->json()['access_token'])) {
            return ['success' => true, 'message' => 'M-Pesa API connection successful'];
        }

        return ['success' => false, 'message' => 'M-Pesa authentication failed: ' . ($response->json()['errorMessage'] ?? 'Invalid credentials')];
    }

    private function testEquity(bool $isSandbox, array $values): array
    {
        $apiKey       = $values['api_key'] ?? '';
        $merchantCode = $values['merchant_code'] ?? '';
        $baseUrl      = $isSandbox ? 'https://uat.jengahq.io' : 'https://api.jengahq.io';

        if (empty($apiKey) || empty($merchantCode)) {
            return ['success' => false, 'message' => 'API key and merchant code are required'];
        }

        $response = Http::timeout(10)
            ->withHeaders(['Api-Key' => $apiKey])
            ->post("{$baseUrl}/identity/v2/token", ['merchantCode' => $merchantCode]);

        if ($response->successful()) {
            return ['success' => true, 'message' => 'Equity Bank (Jenga) API connection successful'];
        }

        return ['success' => false, 'message' => 'Equity Bank authentication failed'];
    }

    private function testKcb(bool $isSandbox, array $values): array
    {
        $consumerKey    = $values['consumer_key'] ?? '';
        $consumerSecret = $values['consumer_secret'] ?? '';
        $baseUrl        = $isSandbox ? 'https://uat.buni.kcbgroup.com' : 'https://api.buni.kcbgroup.com';

        if (empty($consumerKey) || empty($consumerSecret)) {
            return ['success' => false, 'message' => 'Consumer key and secret are required'];
        }

        $response = Http::timeout(10)
            ->withBasicAuth($consumerKey, $consumerSecret)
            ->post("{$baseUrl}/token", ['grant_type' => 'client_credentials']);

        if ($response->successful() && isset($response->json()['access_token'])) {
            return ['success' => true, 'message' => 'KCB API connection successful'];
        }

        return ['success' => false, 'message' => 'KCB authentication failed'];
    }

    private function testCoop(bool $isSandbox, array $values): array
    {
        $consumerKey    = $values['consumer_key'] ?? '';
        $consumerSecret = $values['consumer_secret'] ?? '';
        $baseUrl        = $isSandbox ? 'https://developer.co-opbank.co.ke:8280' : 'https://api.co-opbank.co.ke';

        if (empty($consumerKey) || empty($consumerSecret)) {
            return ['success' => false, 'message' => 'Consumer key and secret are required'];
        }

        $response = Http::timeout(10)
            ->withBasicAuth($consumerKey, $consumerSecret)
            ->post("{$baseUrl}/token", [
                'grant_type' => 'client_credentials',
                'scope'      => 'accounts',
            ]);

        if ($response->successful() && isset($response->json()['access_token'])) {
            return ['success' => true, 'message' => 'Co-operative Bank API connection successful'];
        }

        return ['success' => false, 'message' => 'Co-op Bank authentication failed'];
    }
}
