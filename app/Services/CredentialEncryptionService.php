<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class CredentialEncryptionService
{
    /**
     * Encrypt API credentials for storage.
     *
     * @param array $credentials
     * @return string
     */
    public function encrypt(array $credentials): string
    {
        try {
            return Crypt::encryptString(json_encode($credentials));
        } catch (\Exception $e) {
            Log::error('Failed to encrypt credentials: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Decrypt API credentials from storage.
     *
     * @param string $encryptedCredentials
     * @return array
     */
    public function decrypt(string $encryptedCredentials): array
    {
        try {
            $decrypted = Crypt::decryptString($encryptedCredentials);
            return json_decode($decrypted, true);
        } catch (\Exception $e) {
            Log::error('Failed to decrypt credentials: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Store encrypted credentials for a school payment provider.
     *
     * @param int $schoolId
     * @param string $provider
     * @param array $credentials
     * @return string
     */
    public function storeProviderCredentials(int $schoolId, string $provider, array $credentials): string
    {
        $key = "school_{$schoolId}_provider_{$provider}";
        $encrypted = $this->encrypt($credentials);
        
        // Store in cache or database as needed
        // For now, return the encrypted string
        return $encrypted;
    }

    /**
     * Retrieve decrypted credentials for a school payment provider.
     *
     * @param int $schoolId
     * @param string $provider
     * @param string $encryptedCredentials
     * @return array
     */
    public function getProviderCredentials(int $schoolId, string $provider, string $encryptedCredentials): array
    {
        return $this->decrypt($encryptedCredentials);
    }

    /**
     * Validate that credentials can be encrypted and decrypted.
     *
     * @param array $credentials
     * @return bool
     */
    public function validate(array $credentials): bool
    {
        try {
            $encrypted = $this->encrypt($credentials);
            $decrypted = $this->decrypt($encrypted);
            return $decrypted === $credentials;
        } catch (\Exception $e) {
            return false;
        }
    }
}
