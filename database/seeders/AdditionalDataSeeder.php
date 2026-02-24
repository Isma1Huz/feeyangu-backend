<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\SchoolPaymentConfig;
use App\Models\PTSession;
use App\Models\PTSlot;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AdditionalDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->createSchoolPaymentConfigs();
        $this->createPTSessions();
        $this->createNotifications();
    }

    private function createSchoolPaymentConfigs(): void
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            SchoolPaymentConfig::create([
                'school_id' => $school->id,
                'provider' => 'mpesa',
                'enabled' => true,
                'account_number' => 'MPESA-' . str_pad($school->id, 6, '0', STR_PAD_LEFT),
                'account_name' => $school->name,
                'paybill_number' => '400' . str_pad($school->id, 3, '0', STR_PAD_LEFT),
                'sort_order' => 1,
            ]);

            SchoolPaymentConfig::create([
                'school_id' => $school->id,
                'provider' => 'kcb',
                'enabled' => true,
                'account_number' => '01100' . str_pad($school->id, 7, '0', STR_PAD_LEFT) . '00',
                'account_name' => $school->name,
                'paybill_number' => null,
                'sort_order' => 2,
            ]);

            SchoolPaymentConfig::create([
                'school_id' => $school->id,
                'provider' => 'equity',
                'enabled' => true,
                'account_number' => '11430' . str_pad($school->id, 7, '0', STR_PAD_LEFT) . '00',
                'account_name' => $school->name . ' - Equity Bank',
                'paybill_number' => null,
                'sort_order' => 3,
            ]);
        }
    }

    private function createPTSessions(): void
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $session = PTSession::create([
                'school_id' => $school->id,
                'name' => 'Term 3 2024 Parent-Teacher Sessions',
                'dates' => ['2024-10-15', '2024-10-16'],
                'slot_duration_minutes' => 20,
                'break_between_slots_minutes' => 5,
                'start_time' => '09:00',
                'end_time' => '16:00',
                'venue' => 'School Main Hall',
                'parent_instructions' => 'Please arrive 5 minutes before your scheduled time. Bring your student ID.',
                'status' => 'open',
                'booking_deadline' => Carbon::parse('2024-10-14 23:59:59'),
            ]);

            $teachers = ['Mr. Kamau', 'Mrs. Wanjiru', 'Mr. Ochieng', 'Miss Akinyi'];
            $dates = ['2024-10-15', '2024-10-16'];
            
            foreach ($dates as $date) {
                foreach ($teachers as $teacher) {
                    $startTime = '09:00';
                    for ($i = 0; $i < 8; $i++) {
                        $endTime = Carbon::parse($startTime)->addMinutes(20)->format('H:i');
                        
                        PTSlot::create([
                            'session_id' => $session->id,
                            'teacher_name' => $teacher,
                            'date' => $date,
                            'start_time' => $startTime,
                            'end_time' => $endTime,
                            'status' => rand(0, 2) === 0 ? 'booked' : 'available',
                            'blocked_reason' => null,
                        ]);

                        $startTime = Carbon::parse($endTime)->addMinutes(5)->format('H:i');
                    }
                }
            }
        }
    }

    private function createNotifications(): void
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            $users = User::where('school_id', $school->id)->get();
            
            foreach ($users as $user) {
                $notificationTypes = [
                    ['type' => 'success', 'title' => 'Payment Received', 'message' => 'Your payment has been received successfully.'],
                    ['type' => 'info', 'title' => 'New Invoice', 'message' => 'A new invoice has been generated for Term 3 2024.'],
                    ['type' => 'warning', 'title' => 'Fee Reminder', 'message' => 'This is a reminder that your fee payment is due soon.'],
                    ['type' => 'info', 'title' => 'School Update', 'message' => 'Important announcement regarding upcoming school events.'],
                ];

                $selectedNotifications = array_slice($notificationTypes, 0, rand(1, 3));
                
                foreach ($selectedNotifications as $notif) {
                    Notification::create([
                        'user_id' => $user->id,
                        'title' => $notif['title'],
                        'message' => $notif['message'],
                        'type' => $notif['type'],
                        'read' => rand(0, 1) === 1,
                    ]);
                }
            }
        }
    }
}
