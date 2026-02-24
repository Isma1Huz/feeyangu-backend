<?php

namespace App\Services\Payment\DTOs;

/**
 * Payment Initialization Result DTO
 * 
 * Contains the result of a payment initiation request.
 */
class PaymentInitResult
{
    public function __construct(
        public bool $success,
        public ?string $transactionId = null,
        public ?string $providerReference = null,
        public ?string $message = null,
        public ?string $checkoutRequestId = null, // For M-Pesa STK Push
        public ?array $metadata = null,
        public ?string $errorCode = null,
        public ?string $errorMessage = null,
    ) {}

    /**
     * Create a successful result.
     */
    public static function success(
        string $transactionId,
        string $providerReference,
        string $message = 'Payment initiated successfully',
        ?string $checkoutRequestId = null,
        ?array $metadata = null
    ): self {
        return new self(
            success: true,
            transactionId: $transactionId,
            providerReference: $providerReference,
            message: $message,
            checkoutRequestId: $checkoutRequestId,
            metadata: $metadata
        );
    }

    /**
     * Create a failed result.
     */
    public static function failure(
        string $errorMessage,
        ?string $errorCode = null,
        ?array $metadata = null
    ): self {
        return new self(
            success: false,
            message: $errorMessage,
            errorCode: $errorCode,
            errorMessage: $errorMessage,
            metadata: $metadata
        );
    }

    /**
     * Convert to array representation.
     */
    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'transaction_id' => $this->transactionId,
            'provider_reference' => $this->providerReference,
            'message' => $this->message,
            'checkout_request_id' => $this->checkoutRequestId,
            'metadata' => $this->metadata,
            'error_code' => $this->errorCode,
            'error_message' => $this->errorMessage,
        ];
    }
}
