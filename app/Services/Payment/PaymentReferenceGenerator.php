<?php

namespace App\Services\Payment;

/**
 * Payment Reference Generator
 *
 * Generates short, unique payment references in the format:
 *   {NORMALIZED_ADMISSION}-{SCHOOL_ID}-{RANDOM_CODE}
 *
 * Example: 995-5-DKAKJD
 *
 * The reference is designed to be:
 * - Short enough to be typed by users for PayBill payments
 * - Unique enough to prevent collisions
 * - Parseable to identify the school and student for reconciliation
 */
class PaymentReferenceGenerator
{
    /**
     * Base-36 character set (digits + uppercase letters).
     */
    private const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    /**
     * Generate a unique payment reference.
     *
     * @param  string  $admissionNumber  Student admission number
     * @param  int     $schoolId         School's unique ID
     * @param  int     $codeLength       Length of the random suffix (default 6)
     * @return string  Reference in format: {ADMISSION}-{SCHOOL_ID}-{CODE}
     */
    public function generate(string $admissionNumber, int $schoolId, int $codeLength = 6): string
    {
        $normalized = $this->normalize($admissionNumber);
        $code = $this->randomCode($codeLength);

        return "{$normalized}-{$schoolId}-{$code}";
    }

    /**
     * Normalize an admission number to A-Z0-9 only (uppercase).
     */
    public function normalize(string $admissionNumber): string
    {
        return preg_replace('/[^A-Z0-9]/', '', strtoupper($admissionNumber));
    }

    /**
     * Generate a random base-36 code of the given length.
     */
    public function randomCode(int $length = 6): string
    {
        $code = '';
        $max = strlen(self::CHARS) - 1;

        for ($i = 0; $i < $length; $i++) {
            $code .= self::CHARS[random_int(0, $max)];
        }

        return $code;
    }

    /**
     * Return the maximum possible length for a reference given the admission number.
     *
     * Useful for validating database column lengths.
     */
    public function maxLength(string $admissionNumber, int $schoolId, int $codeLength = 6): int
    {
        $normalized = $this->normalize($admissionNumber);

        // {normalized}-{schoolId}-{code}
        return strlen($normalized) + 1 + strlen((string) $schoolId) + 1 + $codeLength;
    }

    /**
     * Parse a reference into its components.
     *
     * Returns ['admission' => ..., 'school_id' => ..., 'code' => ...] or null if invalid.
     *
     * @return array{admission: string, school_id: int, code: string}|null
     */
    public function parse(string $reference): ?array
    {
        $parts = explode('-', $reference);

        if (count($parts) < 3) {
            return null;
        }

        // Last part is the random code, second-to-last is school_id, rest is admission
        $code = array_pop($parts);
        $schoolId = array_pop($parts);
        $admission = implode('-', $parts); // Handle admission numbers that may contain dashes

        if (!ctype_digit($schoolId)) {
            return null;
        }

        return [
            'admission' => $admission,
            'school_id' => (int) $schoolId,
            'code' => $code,
        ];
    }
}
