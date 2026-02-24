<?php

namespace App\Services\Payment\DTOs;

/**
 * Payment Status Result DTO
 * 
 * Contains the current status of a payment transaction.
 */
class PaymentStatusResult
{
    public function __construct(
        public string $status, // 'completed', 'processing', 'failed', 'cancelled'
        public ?string $transactionId = null,
        public ?string $providerReference = null,
        public ?float $amount = null,
        public ?string $message = null,
        public ?string $resultCode = null,
        public ?string $resultDescription = null,
        public ?\DateTime $completedAt = null,
        public ?array $metadata = null,
    ) {}

    /**
     * Create a completed status result.
     */
    public static function completed(
        string $transactionId,
        string $providerReference,
        float $amount,
        \DateTime $completedAt,
        string $message = 'Payment completed successfully',
        ?array $metadata = null
    ): self {
        return new self(
            status: 'completed',
            transactionId: $transactionId,
            providerReference: $providerReference,
            amount: $amount,
            message: $message,
            completedAt: $completedAt,
            metadata: $metadata
        );
    }

    /**
     * Create a processing status result.
     */
    public static function processing(
        string $transactionId,
        string $message = 'Payment is being processed',
        ?array $metadata = null
    ): self {
        return new self(
            status: 'processing',
            transactionId: $transactionId,
            message: $message,
            metadata: $metadata
        );
    }

    /**
     * Create a failed status result.
     */
    public static function failed(
        string $transactionId,
        string $message,
        ?string $resultCode = null,
        ?array $metadata = null
    ): self {
        return new self(
            status: 'failed',
            transactionId: $transactionId,
            message: $message,
            resultCode: $resultCode,
            resultDescription: $message,
            metadata: $metadata
        );
    }

    /**
     * Convert to array representation.
     */
    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'transaction_id' => $this->transactionId,
            'provider_reference' => $this->providerReference,
            'amount' => $this->amount,
            'message' => $this->message,
            'result_code' => $this->resultCode,
            'result_description' => $this->resultDescription,
            'completed_at' => $this->completedAt?->format('Y-m-d H:i:s'),
            'metadata' => $this->metadata,
        ];
    }
}
