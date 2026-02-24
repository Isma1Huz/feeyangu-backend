<?php

namespace App\Notifications;

use App\Models\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public PaymentTransaction $payment,
        public string $failureReason = 'Payment processing failed'
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
        $retryUrl = route('parent.children.pay', $student->id);

        return (new MailMessage)
            ->subject('Payment Failed - FeeYangu')
            ->error()
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("Your payment of KES {$amount} for {$student->first_name} {$student->last_name} could not be processed.")
            ->line('Reason: ' . $this->failureReason)
            ->line('Payment Reference: ' . $this->payment->reference)
            ->action('Try Again', $retryUrl)
            ->line('If the problem persists, please contact support.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'error',
            'title' => 'Payment Failed',
            'message' => 'Your payment of KES ' . number_format($this->payment->amount / 100, 2) . ' failed. ' . $this->failureReason,
            'payment_id' => $this->payment->id,
            'student_id' => $this->payment->student_id,
            'amount' => $this->payment->amount,
            'reference' => $this->payment->reference,
            'failure_reason' => $this->failureReason,
        ];
    }
}
