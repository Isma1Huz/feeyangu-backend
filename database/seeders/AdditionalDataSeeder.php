<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\SchoolPaymentConfig;
use App\Models\PTSession;
use App\Models\PTSlot;
use App\Models\Notification;
use App\Models\User;
use App\Models\ExpenseRecord;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AdditionalDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->createSchoolPaymentConfigs();
        $this->createPTSessions();
        $this->createNotifications();
        $this->createExpenseRecords();
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

    private function createExpenseRecords(): void
    {
        $schools = School::all();
        
        foreach ($schools as $school) {
            // Get accountant user for this school
            $accountant = User::where('school_id', $school->id)
                ->whereHas('roles', function($q) {
                    $q->where('name', 'accountant');
                })
                ->first();

            if (!$accountant) {
                continue;
            }

            $categories = ['Utilities', 'Supplies', 'Maintenance', 'Salaries', 'Transport', 'Food & Catering', 'Technology', 'Furniture'];
            $vendors = ['Kenya Power', 'Nairobi Water', 'ABC Supplies Ltd', 'Tech Solutions', 'Food Masters', 'City Transport'];
            $statuses = ['pending', 'approved', 'rejected'];

            $expenseData = [
                ['category' => 'Utilities', 'description' => 'Electricity bill for January 2026', 'vendor' => 'Kenya Power', 'amount' => 4500000],
                ['category' => 'Utilities', 'description' => 'Water bill for January 2026', 'vendor' => 'Nairobi Water', 'amount' => 1200000],
                ['category' => 'Supplies', 'description' => 'Office stationery and supplies', 'vendor' => 'ABC Supplies Ltd', 'amount' => 3500000],
                ['category' => 'Maintenance', 'description' => 'Repair of broken windows in Block A', 'vendor' => 'Quick Fix Solutions', 'amount' => 2800000],
                ['category' => 'Technology', 'description' => 'Purchase of 10 new computers', 'vendor' => 'Tech Solutions', 'amount' => 120000000],
                ['category' => 'Food & Catering', 'description' => 'Food supplies for school cafeteria', 'vendor' => 'Food Masters', 'amount' => 8500000],
                ['category' => 'Transport', 'description' => 'School bus fuel for January', 'vendor' => 'City Transport', 'amount' => 4200000],
                ['category' => 'Furniture', 'description' => 'New desks and chairs for Grade 8', 'vendor' => 'Furniture World', 'amount' => 5600000],
                ['category' => 'Salaries', 'description' => 'Teaching staff salaries - January 2026', 'vendor' => 'N/A', 'amount' => 450000000],
                ['category' => 'Maintenance', 'description' => 'Painting of school hall', 'vendor' => 'Prime Painters', 'amount' => 7500000],
                ['category' => 'Supplies', 'description' => 'Science lab equipment and chemicals', 'vendor' => 'Lab Supplies Co', 'amount' => 6800000],
                ['category' => 'Technology', 'description' => 'Internet service for February 2026', 'vendor' => 'Safaricom Business', 'amount' => 2500000],
            ];

            foreach ($expenseData as $i => $data) {
                $daysAgo = rand(1, 30);
                $status = $i < 8 ? 'approved' : ($i < 10 ? 'pending' : 'rejected');
                
                ExpenseRecord::create([
                    'school_id' => $school->id,
                    'date' => Carbon::now()->subDays($daysAgo),
                    'category' => $data['category'],
                    'description' => $data['description'],
                    'amount' => $data['amount'],
                    'vendor' => $data['vendor'],
                    'receipt_url' => null,
                    'status' => $status,
                    'submitted_by' => $accountant->id,
                ]);
            }
        }
    }
}
