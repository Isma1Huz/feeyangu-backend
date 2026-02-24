# Database Seeders Documentation

## Overview
This directory contains comprehensive database seeders for the Feeyangu school management system with realistic Kenyan context.

## Seeders

### 1. RolesAndPermissionsSeeder
Creates user roles using Spatie Permission package:
- `super_admin` - System administrator with full access
- `school_admin` - School-level administrator
- `accountant` - Financial management staff
- `parent` - Student guardians

### 2. SchoolSeeder
Creates 5 schools with complete structure:
- **Schools**: Nairobi Primary School, Mombasa High School, Kisumu Academy, Eldoret International School, Nakuru Girls School
- **Grades**: 5 per school (Grade 1, Grade 2, Grade 3, Form 1, Form 2)
- **Classes**: 3 per grade (A, B, C) with teacher assignments
- **Academic Terms**: 3 terms for 2024 (Term 1, 2, 3)

### 3. UserSeeder
Creates users for the system:
- 1 super_admin (email: admin@feeyangu.com)
- Per school:
  - 1 school_admin (email: admin{N}@school.com)
  - 1 accountant (email: accountant{N}@school.com)
  - 8 parents with Kenyan names and phone numbers (+254...)
- All passwords: `password`

### 4. StudentSeeder
Creates 8 students per school (40 total):
- Realistic Kenyan first and last names
- Unique admission numbers (format: ADM2024XXX)
- Randomly assigned to grades and classes
- 1-2 parents linked per student
- StudentHealthProfile with blood type, height, weight, etc.
- 1-2 EmergencyContacts per student

### 5. FeeStructureSeeder
Creates comprehensive fee structures:
- Fee structures for each grade and term combination
- 3-5 fee items per structure:
  - Tuition Fee: 50,000 KES (5,000,000 cents)
  - Books & Stationery: 15,000 KES (1,500,000 cents)
  - School Uniform: 8,000 KES (800,000 cents)
  - Transport: 12,000 KES (1,200,000 cents)
  - Lunch: 20,000 KES (2,000,000 cents)
- Invoices for each student per term
- Payment scenarios:
  - Full payment: completed transaction + receipt
  - Partial payment: 50% paid
  - No payment: pending or overdue status
- Receipts with unique receipt numbers for completed payments

### 6. AdditionalDataSeeder
Creates supplementary data:
- **SchoolPaymentConfigs**: Payment methods per school
  - M-Pesa (Paybill numbers)
  - KCB Bank account
  - Equity Bank account
- **PTSessions**: Parent-Teacher meeting sessions
  - Dates, times, venues
  - 20-minute slots with 5-minute breaks
- **PTSlots**: Individual meeting slots
  - Multiple teachers
  - Multiple dates
  - Available/booked status
- **Notifications**: Sample notifications for users
  - Payment notifications
  - Invoice notifications
  - Fee reminders
  - School announcements

## Running the Seeders

### Run All Seeders
```bash
php artisan db:seed
```

### Run Individual Seeder
```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
php artisan db:seed --class=SchoolSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=StudentSeeder
php artisan db:seed --class=FeeStructureSeeder
php artisan db:seed --class=AdditionalDataSeeder
```

### Fresh Migration with Seeding
```bash
php artisan migrate:fresh --seed
```

## Seeding Order
The seeders must run in this order due to foreign key dependencies:
1. RolesAndPermissionsSeeder
2. SchoolSeeder
3. UserSeeder
4. StudentSeeder
5. FeeStructureSeeder
6. AdditionalDataSeeder

This order is configured in `DatabaseSeeder.php`.

## Data Volume
- **Schools**: 5
- **Grades**: 25 (5 per school)
- **Classes**: 75 (3 per grade)
- **Academic Terms**: 15 (3 per school)
- **Users**: 51 (1 super_admin + 10 per school)
- **Students**: 40 (8 per school)
- **Fee Structures**: 375 (25 grades × 3 terms × 5 schools)
- **Invoices**: 120 (40 students × 3 terms)
- **Payment Configs**: 15 (3 per school)
- **Notifications**: Varies (1-3 per user)

## Kenyan Context
All data uses realistic Kenyan context:
- **Names**: John Kamau, Mary Wanjiru, Peter Ochieng, etc.
- **Locations**: Nairobi, Mombasa, Kisumu, Eldoret, Nakuru
- **Phone Numbers**: +254 format (Kenyan country code)
- **Payment Providers**: M-Pesa, KCB, Equity Bank
- **Currency**: Kenyan Shillings (KES) stored as cents

## Notes
- All amounts are stored as integers in cents (1 KES = 100 cents)
- Passwords are hashed using Laravel's bcrypt
- Foreign keys are properly linked
- Data includes realistic variety (different grades, payment statuses, etc.)
- Some records are intentionally set to different states (completed, pending, overdue) for testing
