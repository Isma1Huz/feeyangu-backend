<?php

namespace App\Notifications;

use App\Models\PaymentTransaction;
use App\Models\Receipt;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public PaymentTransaction $payment,
        public ?Receipt $receipt = null
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $amount = number_format($this->payment->amount / 100, 2);
        $student = $this->payment->student;
        $receiptUrl = $this->receipt 
            ? route('parent.receipts.show', $this->receipt->id)
            : route('parent.dashboard');

        return (new MailMessage)
            ->subject('Payment Received - FeeYangu')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line("Your payment of KES {$amount} for {$student->first_name} {$student->last_name} has been received successfully.")
            ->line('Payment Reference: ' . $this->payment->reference)
            ->line('Provider Reference: ' . ($this->payment->provider_reference ?? 'N/A'))
            ->action('View Receipt', $receiptUrl)
            ->line('Thank you for your payment!');
    }

    /**
     * Get the array representation of the notification (for database storage).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'success',
            'title' => 'Payment Received',
            'message' => 'Your payment of KES ' . number_format($this->payment->amount / 100, 2) . ' has been received.',
            'payment_id' => $this->payment->id,
            'receipt_id' => $this->receipt?->id,
            'student_id' => $this->payment->student_id,
            'amount' => $this->payment->amount,
            'reference' => $this->payment->reference,
        ];
    }
}
