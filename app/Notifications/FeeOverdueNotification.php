<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FeeOverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Invoice $invoice
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
        $balance = number_format($this->invoice->balance / 100, 2);
        $student = $this->invoice->student;
        $daysOverdue = now()->diffInDays($this->invoice->due_date);
        $payUrl = route('parent.children.pay', $student->id);

        return (new MailMessage)
            ->subject('Fee Payment Overdue - FeeYangu')
            ->warning()
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("The fee payment for {$student->first_name} {$student->last_name} is overdue by {$daysOverdue} days.")
            ->line('Invoice Number: ' . $this->invoice->invoice_number)
            ->line('Outstanding Balance: KES ' . $balance)
            ->line('Due Date: ' . $this->invoice->due_date->format('F d, Y'))
            ->action('Pay Now', $payUrl)
            ->line('Please make payment at your earliest convenience.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'warning',
            'title' => 'Fee Payment Overdue',
            'message' => 'Fee payment for ' . $this->invoice->student->first_name . ' is overdue. Balance: KES ' . number_format($this->invoice->balance / 100, 2),
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'student_id' => $this->invoice->student_id,
            'balance' => $this->invoice->balance,
            'due_date' => $this->invoice->due_date->toDateTimeString(),
        ];
    }
}
