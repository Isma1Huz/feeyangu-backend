<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceSentNotification extends Notification implements ShouldQueue
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
        $student  = $this->invoice->student;
        $total    = number_format($this->invoice->total_amount / 100, 2);
        $balance  = number_format($this->invoice->balance / 100, 2);
        $dueDate  = $this->invoice->due_date->format('F d, Y');

        $mail = (new MailMessage)
            ->subject("Invoice {$this->invoice->invoice_number} - FeeYangu")
            ->greeting('Hello ' . $notifiable->name . ',');

        if ($student) {
            $mail->line("A fee invoice has been issued for {$student->first_name} {$student->last_name}.")
                 ->action('View & Pay', route('parent.children.show', $student->id));
        } else {
            $mail->line('A fee invoice has been issued.');
        }

        return $mail
            ->line('Invoice Number: ' . $this->invoice->invoice_number)
            ->line('Total Amount: KES ' . $total)
            ->line('Outstanding Balance: KES ' . $balance)
            ->line('Due Date: ' . $dueDate)
            ->line('Please make payment before the due date to avoid late penalties.');
    }

    /**
     * Get the array representation of the notification (for database storage).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'info',
            'title' => 'Invoice Issued',
            'message' => "Invoice {$this->invoice->invoice_number} for KES " . number_format($this->invoice->total_amount / 100, 2) . ' is due on ' . $this->invoice->due_date->format('M d, Y') . '.',
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'student_id' => $this->invoice->student_id,
            'total_amount' => $this->invoice->total_amount,
            'due_date' => $this->invoice->due_date->toDateString(),
        ];
    }
}
