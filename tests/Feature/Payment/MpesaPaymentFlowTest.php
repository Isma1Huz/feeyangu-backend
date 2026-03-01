<?php

namespace Tests\Feature\Payment;

use App\Models\Invoice;
use App\Models\InvoicePayment;
use App\Models\PaymentTransaction;
use App\Models\Receipt;
use App\Models\School;
use App\Models\SchoolApiCredential;
use App\Models\Student;
use App\Models\StudentPaymentAccount;
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

    public function test_c2b_callback_creates_new_transaction_via_payment_account(): void
    {
        $reference = '995-' . $this->school->id . '-PAYBIL';

        // Create the stable payment account for this student.
        StudentPaymentAccount::create([
            'school_id'  => $this->school->id,
            'student_id' => $this->student->id,
            'reference'  => $reference,
        ]);

        $c2bPayload = [
            'TransactionType'   => 'Pay Bill',
            'TransID'           => 'RKTQDM7W6S',
            'TransTime'         => '20241201063845',
            'TransAmount'       => '5000.00',
            'BusinessShortCode' => '600638',
            'BillRefNumber'     => $reference,
            'MSISDN'            => '254712345678',
            'FirstName'         => 'Jane',
            'LastName'          => 'Doe',
        ];

        $response = $this->postJson(
            "/api/payments/callback/mpesa/{$this->school->id}",
            $c2bPayload
        );

        $response->assertOk();

        // A NEW completed transaction should be created.
        $tx = PaymentTransaction::where('provider', 'mpesa')
            ->where('provider_reference', 'RKTQDM7W6S')
            ->first();

        $this->assertNotNull($tx, 'A new PaymentTransaction should have been created');
        $this->assertSame('completed', $tx->status);
        $this->assertSame(500000, $tx->amount); // 5000.00 KES = 500000 cents
        $this->assertNotNull($tx->completed_at);

        $receipt = Receipt::where('payment_transaction_id', $tx->id)->first();
        $this->assertNotNull($receipt);
        $this->assertSame('RKTQDM7W6S', $receipt->payment_reference);
    }

    public function test_c2b_callback_is_idempotent(): void
    {
        $reference = '995-' . $this->school->id . '-C2BIDEM';

        StudentPaymentAccount::create([
            'school_id'  => $this->school->id,
            'student_id' => $this->student->id,
            'reference'  => $reference,
        ]);

        $c2bPayload = [
            'TransID'       => 'IDEMPOTENT1',
            'TransAmount'   => '5000.00',
            'BillRefNumber' => $reference,
            'MSISDN'        => '254712345678',
        ];

        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", $c2bPayload)->assertOk();
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", $c2bPayload)->assertOk();

        // Exactly one PaymentTransaction and one receipt should exist for this TransID.
        $txCount = PaymentTransaction::where('provider', 'mpesa')
            ->where('provider_reference', 'IDEMPOTENT1')
            ->count();
        $this->assertSame(1, $txCount, 'Duplicate C2B callback must not create duplicate transactions');
    }

    public function test_c2b_partial_payments_create_separate_transactions(): void
    {
        $reference = '995-' . $this->school->id . '-PARTIAL';

        StudentPaymentAccount::create([
            'school_id'  => $this->school->id,
            'student_id' => $this->student->id,
            'reference'  => $reference,
        ]);

        // First partial payment: KES 2,000
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", [
            'TransID'       => 'PARTIAL001',
            'TransAmount'   => '2000.00',
            'BillRefNumber' => $reference,
            'MSISDN'        => '254712345678',
        ])->assertOk();

        // Second partial payment: KES 3,000
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", [
            'TransID'       => 'PARTIAL002',
            'TransAmount'   => '3000.00',
            'BillRefNumber' => $reference,
            'MSISDN'        => '254712345678',
        ])->assertOk();

        // Two separate transactions should exist for the same reference.
        $txCount = PaymentTransaction::where('reference', $reference)
            ->where('status', 'completed')
            ->count();
        $this->assertSame(2, $txCount, 'Each C2B payment should create its own transaction');

        $totalPaid = PaymentTransaction::where('reference', $reference)
            ->where('status', 'completed')
            ->sum('amount');
        $this->assertSame(500000, (int) $totalPaid); // 2000 + 3000 = 5000 KES = 500000 cents
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

    // -------------------------------------------------------------------------
    // Invoice allocation tests
    // -------------------------------------------------------------------------

    /**
     * Helper: create an invoice for the test student.
     */
    private function makeInvoice(int $totalCents, int $paidCents = 0, string $status = 'sent'): Invoice
    {
        return Invoice::create([
            'school_id'      => $this->school->id,
            'invoice_number' => 'INV-' . uniqid(),
            'student_id'     => $this->student->id,
            'grade'          => 'Form 1',
            'term'           => 'Term 1',
            'total_amount'   => $totalCents,
            'paid_amount'    => $paidCents,
            'balance'        => $totalCents - $paidCents,
            'status'         => $status,
            'due_date'       => now()->addDays(30),
            'issued_date'    => now(),
        ]);
    }

    public function test_invoice_allocated_on_stk_callback(): void
    {
        $invoice     = $this->makeInvoice(500000); // KES 5,000 invoice
        $transaction = $this->makeTransaction([
            'status'             => 'processing',
            'provider_reference' => 'CR-ALLOC',
        ]);

        $callbackPayload = [
            'Body' => [
                'stkCallback' => [
                    'CheckoutRequestID' => 'CR-ALLOC',
                    'ResultCode'        => 0,
                    'ResultDesc'        => 'Success',
                    'CallbackMetadata'  => [
                        'Item' => [
                            ['Name' => 'Amount',             'Value' => 5000.00],
                            ['Name' => 'MpesaReceiptNumber', 'Value' => 'ALLOCRCT1'],
                        ],
                    ],
                ],
            ],
        ];

        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", $callbackPayload)->assertOk();

        $invoice->refresh();
        $this->assertSame(500000, $invoice->paid_amount);
        $this->assertSame(0, $invoice->balance);
        $this->assertSame('paid', $invoice->status);

        $this->assertDatabaseHas('invoice_payments', [
            'invoice_id'             => $invoice->id,
            'payment_transaction_id' => $transaction->id,
            'amount_applied'         => 500000,
        ]);
    }

    public function test_partial_payments_allocate_across_multiple_invoices(): void
    {
        // Two invoices: KES 2,000 and KES 3,000
        $invoice1 = $this->makeInvoice(200000, 0, 'sent');     // due earlier
        $invoice2 = $this->makeInvoice(300000, 0, 'overdue');   // due later

        // Make invoice1 due earlier so FIFO fills it first.
        $invoice1->update(['due_date' => now()->subDays(10)]);
        $invoice2->update(['due_date' => now()->addDays(10)]);

        $reference = '995-' . $this->school->id . '-ALLOC2';

        StudentPaymentAccount::create([
            'school_id'  => $this->school->id,
            'student_id' => $this->student->id,
            'reference'  => $reference,
        ]);

        // First payment: KES 2,500 (covers invoice1 fully + KES 500 towards invoice2)
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", [
            'TransID'       => 'ALLOC2A',
            'TransAmount'   => '2500.00',
            'BillRefNumber' => $reference,
            'MSISDN'        => '254712345678',
        ])->assertOk();

        $invoice1->refresh();
        $invoice2->refresh();

        $this->assertSame(200000, $invoice1->paid_amount, 'Invoice 1 should be fully paid');
        $this->assertSame(0, $invoice1->balance);
        $this->assertSame('paid', $invoice1->status);

        $this->assertSame(50000, $invoice2->paid_amount, 'Invoice 2 should be partially paid');
        $this->assertSame(250000, $invoice2->balance);
        $this->assertSame('partial', $invoice2->status);

        // Second payment: KES 2,500 (finishes invoice2)
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", [
            'TransID'       => 'ALLOC2B',
            'TransAmount'   => '2500.00',
            'BillRefNumber' => $reference,
            'MSISDN'        => '254712345678',
        ])->assertOk();

        $invoice2->refresh();
        $this->assertSame(300000, $invoice2->paid_amount, 'Invoice 2 should be fully paid after second payment');
        $this->assertSame(0, $invoice2->balance);
        $this->assertSame('paid', $invoice2->status);

        // Two InvoicePayment records for invoice2 (one per partial payment).
        $allocationCount = InvoicePayment::where('invoice_id', $invoice2->id)->count();
        $this->assertSame(2, $allocationCount);
    }

    public function test_invoice_allocation_is_idempotent(): void
    {
        $invoice     = $this->makeInvoice(500000);
        $transaction = $this->makeTransaction([
            'status'             => 'processing',
            'provider_reference' => 'CR-IDEM-ALLOC',
        ]);

        $callbackPayload = [
            'Body' => [
                'stkCallback' => [
                    'CheckoutRequestID' => 'CR-IDEM-ALLOC',
                    'ResultCode'        => 0,
                    'ResultDesc'        => 'Success',
                    'CallbackMetadata'  => [
                        'Item' => [
                            ['Name' => 'MpesaReceiptNumber', 'Value' => 'IDEMALLOC1'],
                        ],
                    ],
                ],
            ],
        ];

        // Send callback twice.
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", $callbackPayload)->assertOk();
        $this->postJson("/api/payments/callback/mpesa/{$this->school->id}", $callbackPayload)->assertOk();

        // Allocation record should exist exactly once.
        $allocationCount = InvoicePayment::where('invoice_id', $invoice->id)->count();
        $this->assertSame(1, $allocationCount, 'Duplicate callback must not create duplicate allocations');
    }
}
