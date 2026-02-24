# FeeYangu Backend - Phase 1 Setup Guide

## Overview

This document provides comprehensive setup instructions for Phase 1 of the FeeYangu Laravel + Inertia backend implementation.

## System Requirements

- PHP 8.2 or higher
- Composer 2.x
- MySQL 8.0+ or PostgreSQL 13+
- Redis (for sessions, cache, and queues)
- Node.js 18+ and npm (for frontend assets)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Isma1Huz/feeyangu-backend.git
cd feeyangu-backend
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Update your `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=feeyangu
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 4. Create Database

```bash
# MySQL
mysql -u root -p
CREATE DATABASE feeyangu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 5. Run Migrations

```bash
php artisan migrate
```

This will create all the necessary tables:
- Users and authentication tables
- Schools and academic structure
- Students and parent relationships
- Fee structures and payment tables
- Invoices and receipts
- Health management tables
- Parent-Teacher meeting tables
- Reconciliation and integration tables

### 6. Seed the Database

```bash
php artisan db:seed
```

This will populate the database with:
- 4 roles (super_admin, school_admin, accountant, parent)
- 5 Kenyan schools with complete academic structure
- 51 users (1 super admin + 10 users per school)
- 40 students (8 per school) with health profiles
- Fee structures, invoices, and payments
- Payment configurations and PT sessions

**Default Credentials:**

Super Admin:
- Email: `admin@feeyangu.com`
- Password: `password`

School Admin (example for first school):
- Email: `admin@nairobiprimary.ac.ke`
- Password: `password`

### 7. Storage Setup

```bash
php artisan storage:link
```

### 8. Install Horizon (Queue Management)

```bash
php artisan horizon:install
```

To run Horizon:
```bash
php artisan horizon
```

## Package Details

### Core Packages

- **Laravel Framework 11**: PHP framework
- **Inertia.js**: Frontend adapter for React
- **Laravel Sanctum**: API authentication
- **Laravel Breeze**: Authentication scaffolding

### Feature Packages

- **Spatie Laravel Permission**: Role and permission management
- **Spatie Laravel Activitylog**: Audit logging
- **Laravel Cashier**: SaaS subscription billing with Stripe
- **Laravel Horizon**: Redis queue monitoring

## Database Schema

### Core Tables

**Schools**
- Manages school information, status, and logo
- Soft deletes enabled

**Users**
- Extended with phone, avatar, and school_id
- Roles: super_admin, school_admin, accountant, parent
- Email verification and 2FA support

**Students**
- Linked to schools, grades, and classes
- Many-to-many relationship with parents
- Unique admission numbers per school
- Soft deletes enabled

### Academic Structure

**Grades** → **GradeClasses** → **Students**
**Academic Terms** → Fee structures per term

### Financial Management

**Fee Structures** → Fee Items
**Invoices** → Invoice Items
**Payment Transactions** → Receipts → Receipt Items
**Expense Records** for school expenses
**Reconciliation** between bank and system payments

### Payment Providers

Support for:
- M-Pesa (Safaricom)
- KCB Bank
- Equity Bank (Jenga API)
- NCBA Bank (Loop API)
- Co-operative Bank
- Absa Bank
- Stanbic Bank
- DTB (Diamond Trust Bank)
- I&M Bank
- Family Bank

### Health Management

**Student Health Profiles** with:
- Medical Conditions
- Allergies
- Vaccination Records
- Health Incidents
- Emergency Contacts
- Health Documents
- Health Update Requests

### Parent-Teacher Meetings

**PT Sessions** → PT Slots → PT Bookings
Manages conference scheduling and booking

## Middleware

### Custom Middleware

1. **EnsureRole**: Checks user has required role(s)
   ```php
   Route::middleware(['role:super_admin'])->group(function () {
       // Super admin routes
   });
   ```

2. **EnsureSchoolAccess**: Ensures school-level users only access their school
   ```php
   Route::middleware(['school.access'])->group(function () {
       // School admin/accountant routes
   });
   ```

3. **EnsureParentAccess**: Ensures parents only access their children's data
   ```php
   Route::middleware(['parent.access'])->group(function () {
       // Parent routes
   });
   ```

## Eloquent Models

All models include:
- ✅ Complete fillable fields
- ✅ Type casting (dates, booleans, arrays, etc.)
- ✅ Full relationships (belongsTo, hasMany, belongsToMany, hasOne)
- ✅ Soft deletes where appropriate
- ✅ Accessors and mutators

### Key Models

- **User**: Authentication with roles and school relationship
- **School**: Multi-tenant base model
- **Student**: Core student management with health profiles
- **PaymentTransaction**: Handles all payment processing
- **Invoice**: Manages fee invoicing and balances
- **Receipt**: Payment receipts with line items

## Roles and Permissions

### Roles

1. **super_admin**
   - Platform owner
   - Manages all schools and users
   - Access to platform settings

2. **school_admin**
   - School principal
   - Manages school students, fees, and settings
   - Full access to their school's data

3. **accountant**
   - School accountant
   - Manages invoicing, payments, reconciliation
   - Access to financial reports

4. **parent**
   - Views children's fees and payments
   - Makes payments
   - Views receipts and statements

## Inertia Configuration

Inertia is configured to share:
- Authenticated user data (with roles and permissions)
- Flash messages (success, error, warning, info)

Access in React components via `usePage().props`

## Development Commands

### Running the Development Server

```bash
php artisan serve
```

### Queue Worker (for background jobs)

```bash
php artisan queue:work
```

### Running Tests

```bash
php artisan test
```

### Code Formatting

```bash
./vendor/bin/pint
```

## File Structure

```
app/
├── Console/          # Artisan commands
├── Http/
│   ├── Controllers/  # API and web controllers
│   ├── Middleware/   # Custom middleware
│   └── Requests/     # Form request validation
├── Models/           # Eloquent models
└── Providers/        # Service providers

database/
├── factories/        # Model factories for testing
├── migrations/       # Database migrations
└── seeders/          # Database seeders

routes/
├── api.php          # API routes
├── auth.php         # Authentication routes
└── web.php          # Web routes (Inertia)
```

## Next Steps - Phase 2

Phase 2 will implement:
- Controllers for all routes
- Form request validation
- API endpoints
- Inertia page responses
- Policy-based authorization

## Troubleshooting

### Migration Errors

If you encounter migration errors, reset the database:
```bash
php artisan migrate:fresh --seed
```

### Permission Errors

Clear cache and rebuild:
```bash
php artisan cache:clear
php artisan config:clear
php artisan permission:cache-reset
```

### Queue Issues

Restart queue workers:
```bash
php artisan queue:restart
```

## Support

For issues or questions, please open an issue on GitHub:
https://github.com/Isma1Huz/feeyangu-backend/issues

---

**Generated:** February 2026
**Laravel Version:** 11.48.0
**PHP Version:** 8.2+
