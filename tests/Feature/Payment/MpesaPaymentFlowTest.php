<?php

namespace Tests\Feature\Payment;

use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Models\School;
use App\Models\SchoolApiCredential;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MpesaPaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // Fixtures
    // -------------------------------------------------------------------------

    private School $school;
    private User $parent;
    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->school = School::create([
            'name'       => 'Nakuru Girls High School',
            'owner_name' => 'Ministry of Education',
            'status'     => 'active',
            'location'   => 'Nakuru',
        ]);

        $this->parent = User::create([
            'name'              => 'Test Parent',
            'email'             => 'parent@test.com',
            'password'          => bcrypt('password'),
            'email_verified_at' => now(),
            'school_id'         => $this->school->id,
        ]);

        // Grade and class are required by the students table
        $grade = \App\Models\Grade::create([
            'school_id' => $this->school->id,
            'name'      => 'Form 1',
        ]);

        $gradeClass = \App\Models\GradeClass::create([
            'grade_id'     => $grade->id,
            'name'         => 'Form 1A',
            'teacher_name' => 'Mr. Test',
            'capacity'     => 40,
        ]);

        $this->student = Student::create([
            'school_id'        => $this->school->id,
            'admission_number' => '995',
            'first_name'       => 'Jane',
            'last_name'        => 'Doe',
            'grade_id'         => $grade->id,
            'class_id'         => $gradeClass->id,
            'status'           => 'active',
        ]);

        // Link parent to student
        $this->parent->students()->attach($this->student->id);
    }

    /**
     * Create per-school M-Pesa credentials in the DB.
     */
    private function seedMpesaCredentials(array $overrides = []): SchoolApiCredential
    {
        return SchoolApiCredential::create([
            'school_id'   => $this->school->id,
            'provider'    => 'mpesa',
            'environment' => 'sandbox',
            'enabled'     => true,
            'credentials' => array_merge([
                'consumer_key'    => 'test_consumer_key',
                'consumer_secret' => 'test_consumer_secret',
                'passkey'         => 'test_passkey',
                'shortcode'       => '174379',
            ], $overrides),
        ]);
    }

    /**
     * Build a pending PaymentTransaction for the test student.
     */
    private function makeTransaction(array $overrides = []): PaymentTransaction
    {
        return PaymentTransaction::create(array_merge([
            'school_id'    => $this->school->id,
            'student_id'   => $this->student->id,
            'parent_id'    => $this->parent->id,
            'amount'       => 500000, // 5,000 KES in cents
            'provider'     => 'mpesa',
            'status'       => 'pending',
            'reference'    => '995-' . $this->school->id . '-TESTCD',
            'phone_number' => '0712345678',
        ], $overrides));
    }

    // -------------------------------------------------------------------------
    // Reference format tests
    // -------------------------------------------------------------------------

    public function test_reference_uses_school_id_not_initials(): void
    {
        $transaction = $this->makeTransaction();

        // Reference must contain the numeric school ID
        $this->assertStringContainsString((string) $this->school->id, $transaction->reference);

        // Must follow {ADMISSION}-{SCHOOL_ID}-{CODE} pattern
        $this->assertMatchesRegularExpression('/^\d+-\d+-[A-Z0-9]+$/', $transaction->reference);
    }

    // -------------------------------------------------------------------------
    // STK Push initiation
    // -------------------------------------------------------------------------

    public function test_stk_push_uses_per_school_credentials(): void
    {
        $this->seedMpesaCredentials();
        $transaction = $this->makeTransaction();

        Http::fake([
            // OAuth token endpoint
            '*/oauth/v1/generate*' => Http::response([
                'access_token' => 'test_token_xyz',
                'expires_in'   => '3599',
            ], 200),

            // STK Push endpoint
            '*/mpesa/stkpush/v1/processrequest' => Http::response([
                'MerchantRequestID'  => 'MR-001',
                'CheckoutRequestID'  => 'CR-001',
                'ResponseCode'       => '0',
                'ResponseDescription' => 'Success',
                'CustomerMessage'    => 'Please check your phone.',
            ], 200),
        ]);

        $provider = app(\App\Services\Payment\Providers\MpesaPaymentProvider::class);
        $result   = $provider->initiatePayment($transaction);

        $this->assertTrue($result->success);
        $this->assertSame('CR-001', $result->checkoutRequestId);

        // Verify the STK push used the correct shortcode from DB credentials
        Http::assertSent(function ($request) use ($transaction) {
            return str_contains($request->url(), 'stkpush')
                && $request['BusinessShortCode'] === '174379'
                && $request['AccountReference'] === $transaction->reference;
        });

        // Transaction should be updated to processing with metadata
        $transaction->refresh();
        $this->assertSame('processing', $transaction->status);
        $this->assertSame('CR-001', $transaction->provider_reference);
        $this->assertSame('CR-001', $transaction->metadata['CheckoutRequestID']);
        $this->assertSame('MR-001', $transaction->metadata['MerchantRequestID']);
    }

    public function test_stk_push_callback_url_includes_school_id(): void
    {
        $this->seedMpesaCredentials();
        $transaction = $this->makeTransaction();

        Http::fake([
            '*/oauth/v1/generate*' => Http::response(['access_token' => 'tok'], 200),
            '*/mpesa/stkpush/v1/processrequest' => Http::response([
                'ResponseCode'      => '0',
                'CheckoutRequestID' => 'CR-002',
            ], 200),
        ]);

        $provider = app(\App\Services\Payment\Providers\MpesaPaymentProvider::class);
        $provider->initiatePayment($transaction);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'stkpush')
                && str_contains($request['CallBackURL'], (string) $this->school->id);
        });
    }

    public function test_stk_push_fails_gracefully_when_not_configured(): void
    {
        // No SchoolApiCredential and no global config – should fail cleanly
        $transaction = $this->makeTransaction();

        Http::fake(); // No HTTP calls should be made

        $provider = app(\App\Services\Payment\Providers\MpesaPaymentProvider::class);
        $result   = $provider->initiatePayment($transaction);

        $this->assertFalse($result->success);
        $this->assertSame('NOT_CONFIGURED', $result->errorCode);
    }

    // -------------------------------------------------------------------------
    // STK Push callback (idempotency)
    // -------------------------------------------------------------------------

    public function test_stk_callback_completes_transaction_and_creates_receipt(): void
    {
        $transaction = $this->makeTransaction([
            'status'             => 'processing',
            'provider_reference' => 'CR-999',
        ]);

        $callbackPayload = [
            'Body' => [
                'stkCallback' => [
                    'MerchantRequestID'  => 'MR-999',
                    'CheckoutRequestID'  => 'CR-999',
                    'ResultCode'         => 0,
                    'ResultDesc'         => 'The service request is processed successfully.',
                    'CallbackMetadata'   => [
                        'Item' => [
                            ['Name' => 'Amount', 'Value' => 5000.00],
                            ['Name' => 'MpesaReceiptNumber', 'Value' => 'LK451H35EA'],
                            ['Name' => 'TransactionDate', 'Value' => 20241201120000],
                            ['Name' => 'PhoneNumber', 'Value' => 254712345678],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->postJson(
            "/api/payments/callback/mpesa/{$this->school->id}",
            $callbackPayload
        );

        $response->assertOk();
        $response->assertJson(['ResultCode' => 0]);

        $transaction->refresh();
        $this->assertSame('completed', $transaction->status);
        $this->assertNotNull($transaction->completed_at);
        $this->assertSame('LK451H35EA', $transaction->provider_reference);
        $this->assertSame('LK451H35EA', $transaction->metadata['MpesaReceiptNumber']);

        // Receipt should exist
        $receipt = Receipt::where('payment_transaction_id', $transaction->id)->first();
        $this->assertNotNull($receipt);
        $this->assertSame($transaction->amount, $receipt->amount);
        $this->assertSame('LK451H35EA', $receipt->payment_reference);
    }

    public function test_stk_callback_is_idempotent(): void
    {
        $transaction = $this->makeTransaction([
            'status'             => 'processing',
            'provider_reference' => 'CR-IDEM',
        ]);

        $callbackPayload = [
            'Body' => [
                'stkCallback' => [
                    'CheckoutRequestID' => 'CR-IDEM',
                    'ResultCode'        => 0,
                    'ResultDesc'        => 'Success',
                    'CallbackMetadata'  => [
                        'Item' => [
                            ['Name' => 'MpesaReceiptNumber', 'Value' => 'RCPT001'],
                        ],
                    ],
                ],
            ],
        ];

        // Send the callback twice
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", $callbackPayload)->assertOk();
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", $callbackPayload)->assertOk();

        // Exactly one receipt should be created
        $receiptCount = Receipt::where('payment_transaction_id', $transaction->id)->count();
        $this->assertSame(1, $receiptCount, 'Duplicate callback must not create duplicate receipts');
    }

    // -------------------------------------------------------------------------
    // C2B PayBill callback
    // -------------------------------------------------------------------------

    public function test_c2b_callback_completes_transaction_by_bill_ref_number(): void
    {
        $transaction = $this->makeTransaction([
            'status'    => 'pending',
            'reference' => '995-' . $this->school->id . '-PAYBIL',
        ]);

        $c2bPayload = [
            'TransactionType' => 'Pay Bill',
            'TransID'         => 'RKTQDM7W6S',
            'TransTime'       => '20241201063845',
            'TransAmount'     => '5000.00',
            'BusinessShortCode' => '600638',
            'BillRefNumber'   => $transaction->reference, // Must match our reference
            'MSISDN'          => '254712345678',
            'FirstName'       => 'Jane',
            'LastName'        => 'Doe',
        ];

        $response = $this->postJson(
            "/api/payments/callback/mpesa/{$this->school->id}",
            $c2bPayload
        );

        $response->assertOk();

        $transaction->refresh();
        $this->assertSame('completed', $transaction->status);
        $this->assertNotNull($transaction->completed_at);
        $this->assertSame('RKTQDM7W6S', $transaction->provider_reference);

        $receipt = Receipt::where('payment_transaction_id', $transaction->id)->first();
        $this->assertNotNull($receipt);
        $this->assertSame('RKTQDM7W6S', $receipt->payment_reference);
    }

    public function test_c2b_callback_is_idempotent(): void
    {
        $transaction = $this->makeTransaction([
            'status'    => 'pending',
            'reference' => '995-' . $this->school->id . '-C2BIDEM',
        ]);

        $c2bPayload = [
            'TransID'       => 'IDEMPOTENT1',
            'TransAmount'   => '5000.00',
            'BillRefNumber' => $transaction->reference,
            'MSISDN'        => '254712345678',
        ];

        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", $c2bPayload)->assertOk();
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", $c2bPayload)->assertOk();

        $receiptCount = Receipt::where('payment_transaction_id', $transaction->id)->count();
        $this->assertSame(1, $receiptCount, 'Duplicate C2B callback must not create duplicate receipts');
    }

    // -------------------------------------------------------------------------
    // KCB bank provider – initiation + callback
    // -------------------------------------------------------------------------

    public function test_kcb_initiation_uses_per_school_credentials(): void
    {
        SchoolApiCredential::create([
            'school_id'   => $this->school->id,
            'provider'    => 'kcb',
            'environment' => 'sandbox',
            'enabled'     => true,
            'credentials' => [
                'api_key'        => 'kcb_test_key',
                'api_secret'     => 'kcb_test_secret',
                'account_number' => 'KCB123456',
            ],
        ]);

        $transaction = $this->makeTransaction(['provider' => 'kcb']);

        Http::fake([
            // OAuth
            '*/oauth/token' => Http::response(['access_token' => 'kcb_token'], 200),

            // KCB payment initiation
            '*/payments/initiate' => Http::response([
                'status'         => 'success',
                'transaction_id' => 'KCB-TXN-001',
                'message'        => 'Payment initiated',
            ], 200),
        ]);

        $provider = app(\App\Services\Payment\Providers\KcbPaymentProvider::class);
        $result   = $provider->initiatePayment($transaction);

        $this->assertTrue($result->success);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'payments/initiate')
                && $request['account_number'] === 'KCB123456';
        });
    }

    public function test_kcb_callback_completes_transaction(): void
    {
        $transaction = $this->makeTransaction([
            'provider'           => 'kcb',
            'status'             => 'processing',
            'provider_reference' => 'KCB-TXN-555',
        ]);

        $callbackPayload = [
            'transaction_id' => 'KCB-TXN-555',
            'status'         => 'completed',
            'amount'         => 5000,
            'reference'      => $transaction->reference,
        ];

        $response = $this->postJson(
            "/api/payments/callback/kcb/{$this->school->id}",
            $callbackPayload
        );

        $response->assertOk();

        $transaction->refresh();
        $this->assertSame('completed', $transaction->status);

        $receipt = Receipt::where('payment_transaction_id', $transaction->id)->first();
        $this->assertNotNull($receipt);
    }
}
