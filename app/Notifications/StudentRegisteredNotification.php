<?php

namespace App\Notifications;

use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentRegisteredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Student $student
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
        $viewUrl = route('school.students.show', $this->student->id);

        return (new MailMessage)
            ->subject('New Student Registered - FeeYangu')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('A new student has been registered in your school.')
            ->line('Student Name: ' . $this->student->first_name . ' ' . $this->student->last_name)
            ->line('Admission Number: ' . $this->student->admission_number)
            ->line('Grade: ' . $this->student->grade->name)
            ->action('View Student', $viewUrl)
            ->line('You can now assign fees and manage this student.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'info',
            'title' => 'New Student Registered',
            'message' => $this->student->first_name . ' ' . $this->student->last_name . ' has been registered.',
            'student_id' => $this->student->id,
            'admission_number' => $this->student->admission_number,
            'grade' => $this->student->grade->name,
        ];
    }
}
