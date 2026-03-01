<?php

namespace Tests\Feature\Payment;

use App\Services\Payment\PaymentReferenceGenerator;
use Tests\TestCase;

class PaymentReferenceGeneratorTest extends TestCase
{
    private PaymentReferenceGenerator $generator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->generator = new PaymentReferenceGenerator();
    }

    public function test_generates_reference_in_correct_format(): void
    {
        $ref = $this->generator->generate('995', 5);

        // Should match {ADMISSION}-{SCHOOL_ID}-{CODE}
        $this->assertMatchesRegularExpression('/^[A-Z0-9]+-\d+-[A-Z0-9]+$/', $ref);

        $parts = explode('-', $ref);
        $this->assertGreaterThanOrEqual(3, count($parts));
    }

    public function test_generates_reference_with_correct_school_id(): void
    {
        $ref = $this->generator->generate('ABC123', 42);

        $parsed = $this->generator->parse($ref);

        $this->assertNotNull($parsed);
        $this->assertSame(42, $parsed['school_id']);
    }

    public function test_normalizes_admission_number_to_alphanumeric(): void
    {
        // Admission numbers with slashes, spaces, dashes should be stripped
        $ref = $this->generator->generate('A/123/2024', 1);

        $this->assertStringStartsWith('A1232024-', $ref);
    }

    public function test_normalize_returns_uppercase_only(): void
    {
        $normalized = $this->generator->normalize('abc-123/xyz');

        $this->assertSame('ABC123XYZ', $normalized);
    }

    public function test_random_code_uses_only_base36_characters(): void
    {
        $code = $this->generator->randomCode(8);

        $this->assertMatchesRegularExpression('/^[A-Z0-9]{8}$/', $code);
    }

    public function test_random_code_has_correct_length(): void
    {
        foreach ([6, 8, 10] as $length) {
            $code = $this->generator->randomCode($length);
            $this->assertSame($length, strlen($code), "Code should be {$length} characters");
        }
    }

    public function test_generates_unique_references(): void
    {
        $references = [];

        for ($i = 0; $i < 100; $i++) {
            $references[] = $this->generator->generate('STU001', 1);
        }

        $unique = array_unique($references);

        // With 36^6 = ~2 billion possibilities, 100 generations should all be unique
        $this->assertCount(100, $unique, 'All generated references should be unique');
    }

    public function test_parse_returns_correct_components(): void
    {
        $parsed = $this->generator->parse('995-5-DKAKJD');

        $this->assertNotNull($parsed);
        $this->assertSame('995', $parsed['admission']);
        $this->assertSame(5, $parsed['school_id']);
        $this->assertSame('DKAKJD', $parsed['code']);
    }

    public function test_parse_returns_null_for_invalid_reference(): void
    {
        $this->assertNull($this->generator->parse('INVALID'));
        $this->assertNull($this->generator->parse(''));
        $this->assertNull($this->generator->parse('NO-SCHOOLID-HERE'));
    }

    public function test_max_length_calculation(): void
    {
        $maxLen = $this->generator->maxLength('STU001', 99, 6);

        // STU001 (6) + dash (1) + 99 (2) + dash (1) + code (6) = 16
        $this->assertSame(16, $maxLen);
    }

    public function test_generated_reference_fits_within_max_length(): void
    {
        $admissionNumber = 'STU001';
        $schoolId        = 5;
        $codeLength      = 6;

        $ref    = $this->generator->generate($admissionNumber, $schoolId, $codeLength);
        $maxLen = $this->generator->maxLength($admissionNumber, $schoolId, $codeLength);

        $this->assertLessThanOrEqual($maxLen, strlen($ref));
    }
}
