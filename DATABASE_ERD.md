# FeeYangu Database ERD (Entity Relationship Diagram)

## Overview

This document provides a comprehensive Entity Relationship Diagram for the FeeYangu school management system database.

## Core Entities

### School Management

```
┌──────────────────────┐
│      SCHOOLS         │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ owner_name           │
│ status (enum)        │
│ location             │
│ logo (nullable)      │
│ timestamps           │
│ soft_deletes         │
└──────────────────────┘
         │
         │ 1:N
         ├──────────> USERS (school_id FK)
         ├──────────> STUDENTS (school_id FK)
         ├──────────> GRADES (school_id FK)
         ├──────────> ACADEMIC_TERMS (school_id FK)
         ├──────────> FEE_STRUCTURES (school_id FK)
         ├──────────> SCHOOL_PAYMENT_CONFIGS (school_id FK)
         ├──────────> PAYMENT_TRANSACTIONS (school_id FK)
         ├──────────> RECEIPTS (school_id FK)
         ├──────────> INVOICES (school_id FK)
         ├──────────> EXPENSE_RECORDS (school_id FK)
         ├──────────> PT_SESSIONS (school_id FK)
         ├──────────> BANK_TRANSACTIONS (school_id FK)
         ├──────────> INTEGRATION_CONFIGS (school_id FK)
         └──────────> RECONCILIATION_ITEMS (school_id FK)
```

### Users & Authentication

```
┌──────────────────────┐
│       USERS          │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ email (unique)       │
│ password             │
│ phone (nullable)     │
│ avatar (nullable)    │
│ school_id (FK)       │
│ email_verified_at    │
│ remember_token       │
│ timestamps           │
└──────────────────────┘
         │
         │ N:M (via PARENT_STUDENT)
         ├──────────> STUDENTS
         │
         │ 1:N
         ├──────────> NOTIFICATIONS (user_id FK)
         ├──────────> PAYMENT_TRANSACTIONS (parent_id FK)
         └──────────> PT_BOOKINGS (parent_id FK)


┌────────────────────────┐
│    PARENT_STUDENT      │
│     (Pivot Table)      │
├────────────────────────┤
│ id (PK)                │
│ user_id (FK)           │
│ student_id (FK)        │
│ timestamps             │
└────────────────────────┘
```

### Roles & Permissions (Spatie)

```
┌──────────────────────┐
│       ROLES          │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ guard_name           │
│ timestamps           │
└──────────────────────┘
         │
         │ N:M
         └──────────> USERS

Roles:
- super_admin
- school_admin
- accountant
- parent
```

## Academic Structure

```
┌──────────────────────┐         ┌─────────────────────┐
│       GRADES         │         │   ACADEMIC_TERMS    │
├──────────────────────┤         ├─────────────────────┤
│ id (PK)              │         │ id (PK)             │
│ school_id (FK)       │         │ school_id (FK)      │
│ name                 │         │ name                │
│ sort_order           │         │ year                │
│ timestamps           │         │ start_date          │
└──────────────────────┘         │ end_date            │
         │                       │ status (enum)       │
         │ 1:N                   │ timestamps          │
         ├──────────> GRADE_CLASSES         └─────────────────────┘
         │                                │
         │ 1:N                            │ 1:N
         └──────────> FEE_STRUCTURES ─────┘


┌──────────────────────┐
│   GRADE_CLASSES      │
├──────────────────────┤
│ id (PK)              │
│ grade_id (FK)        │
│ name                 │
│ teacher_name         │
│ capacity             │
│ timestamps           │
└──────────────────────┘
         │
         │ 1:N
         └──────────> STUDENTS (class_id FK)
```

## Student Management

```
┌──────────────────────────────────┐
│          STUDENTS                │
├──────────────────────────────────┤
│ id (PK)                          │
│ school_id (FK)                   │
│ admission_number (unique)        │
│ first_name                       │
│ last_name                        │
│ grade_id (FK)                    │
│ class_id (FK → GRADE_CLASSES)   │
│ status (enum)                    │
│ timestamps                       │
│ soft_deletes                     │
└──────────────────────────────────┘
         │
         │ 1:1
         ├──────────> STUDENT_HEALTH_PROFILES
         │
         │ 1:N
         ├──────────> MEDICAL_CONDITIONS
         ├──────────> ALLERGIES
         ├──────────> VACCINATION_RECORDS
         ├──────────> HEALTH_INCIDENTS
         ├──────────> EMERGENCY_CONTACTS
         ├──────────> HEALTH_DOCUMENTS
         ├──────────> HEALTH_UPDATE_REQUESTS
         ├──────────> INVOICES
         ├──────────> PAYMENT_TRANSACTIONS
         ├──────────> RECEIPTS
         └──────────> PT_BOOKINGS
```

## Fee Management

```
┌──────────────────────┐
│   FEE_STRUCTURES     │
├──────────────────────┤
│ id (PK)              │
│ school_id (FK)       │
│ name                 │
│ grade_id (FK)        │
│ term_id (FK)         │
│ total_amount         │
│ status (enum)        │
│ timestamps           │
└──────────────────────┘
         │
         │ 1:N
         └──────────> FEE_ITEMS


┌──────────────────────┐
│      FEE_ITEMS       │
├──────────────────────┤
│ id (PK)              │
│ fee_structure_id (FK)│
│ name                 │
│ amount (cents)       │
│ timestamps           │
└──────────────────────┘
```

## Payment System

```
┌────────────────────────────────┐
│  SCHOOL_PAYMENT_CONFIGS        │
├────────────────────────────────┤
│ id (PK)                        │
│ school_id (FK)                 │
│ provider (enum)                │
│   - mpesa, equity, kcb, etc.   │
│ enabled (boolean)              │
│ account_number                 │
│ account_name                   │
│ paybill_number (nullable)      │
│ sort_order                     │
│ timestamps                     │
└────────────────────────────────┘


┌────────────────────────────────┐
│    PAYMENT_TRANSACTIONS        │
├────────────────────────────────┤
│ id (PK)                        │
│ school_id (FK)                 │
│ student_id (FK)                │
│ parent_id (FK → USERS)         │
│ amount (cents)                 │
│ provider                       │
│ status (enum)                  │
│ reference (unique)             │
│ phone_number (nullable)        │
│ provider_reference (nullable)  │
│ created_at                     │
│ completed_at (nullable)        │
│ updated_at                     │
└────────────────────────────────┘
         │
         │ 1:1
         └──────────> RECEIPTS


┌────────────────────────────────┐
│          RECEIPTS              │
├────────────────────────────────┤
│ id (PK)                        │
│ school_id (FK)                 │
│ payment_transaction_id (FK)    │
│ receipt_number (unique)        │
│ student_id (FK)                │
│ amount (cents)                 │
│ payment_method                 │
│ payment_reference              │
│ issued_at                      │
│ timestamps                     │
└────────────────────────────────┘
         │
         │ 1:N
         └──────────> RECEIPT_ITEMS


┌────────────────────────────────┐
│        RECEIPT_ITEMS           │
├────────────────────────────────┤
│ id (PK)                        │
│ receipt_id (FK)                │
│ name                           │
│ amount (cents)                 │
│ timestamps                     │
└────────────────────────────────┘
```

## Invoicing

```
┌────────────────────────────────┐
│          INVOICES              │
├────────────────────────────────┤
│ id (PK)                        │
│ school_id (FK)                 │
│ invoice_number (unique)        │
│ student_id (FK)                │
│ grade                          │
│ term                           │
│ total_amount (cents)           │
│ paid_amount (cents)            │
│ balance (cents)                │
│ status (enum)                  │
│ due_date                       │
│ issued_date                    │
│ sent_via (enum)                │
│ timestamps                     │
└────────────────────────────────┘
         │
         │ 1:N
         └──────────> INVOICE_ITEMS


┌────────────────────────────────┐
│        INVOICE_ITEMS           │
├────────────────────────────────┤
│ id (PK)                        │
│ invoice_id (FK)                │
│ name                           │
│ amount (cents)                 │
│ timestamps                     │
└────────────────────────────────┘
```

## Health Management

```
┌───────────────────────────────────┐
│    STUDENT_HEALTH_PROFILES        │
├───────────────────────────────────┤
│ id (PK)                           │
│ student_id (FK, unique)           │
│ blood_type (nullable)             │
│ height (nullable)                 │
│ weight (nullable)                 │
│ vision_notes (nullable)           │
│ hearing_notes (nullable)          │
│ general_health_status (nullable)  │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│       MEDICAL_CONDITIONS          │
├───────────────────────────────────┤
│ id (PK)                           │
│ student_id (FK)                   │
│ name                              │
│ type (enum)                       │
│ severity (enum)                   │
│ diagnosed_date (nullable)         │
│ treating_doctor (nullable)        │
│ management_notes (nullable)       │
│ emergency_action_plan (nullable)  │
│ status (enum)                     │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│           ALLERGIES               │
├───────────────────────────────────┤
│ id (PK)                           │
│ student_id (FK)                   │
│ allergen                          │
│ allergen_category (enum)          │
│ reaction_type                     │
│ severity (enum)                   │
│ emergency_protocol                │
│ epi_pen_available (boolean)       │
│ epi_pen_location (nullable)       │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│      VACCINATION_RECORDS          │
├───────────────────────────────────┤
│ id (PK)                           │
│ student_id (FK)                   │
│ vaccine_name                      │
│ date_administered                 │
│ administered_by                   │
│ next_due_date (nullable)          │
│ batch_number (nullable)           │
│ certificate_url (nullable)        │
│ status (enum)                     │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│       HEALTH_INCIDENTS            │
├───────────────────────────────────┤
│ id (PK)                           │
│ student_id (FK)                   │
│ incident_date                     │
│ incident_time                     │
│ type (enum)                       │
│ description                       │
│ action_taken                      │
│ reported_by                       │
│ parent_notified (boolean)         │
│ parent_notified_at (nullable)     │
│ external_medical_help (boolean)   │
│ external_medical_details (null)   │
│ follow_up_required (boolean)      │
│ follow_up_date (nullable)         │
│ follow_up_completed (boolean)     │
│ follow_up_notes (nullable)        │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│      EMERGENCY_CONTACTS           │
├───────────────────────────────────┤
│ id (PK)                           │
│ student_id (FK)                   │
│ full_name                         │
│ relationship                      │
│ primary_phone                     │
│ secondary_phone (nullable)        │
│ priority                          │
│ notes (nullable)                  │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│       HEALTH_DOCUMENTS            │
├───────────────────────────────────┤
│ id (PK)                           │
│ student_id (FK)                   │
│ type (enum)                       │
│ title                             │
│ description (nullable)            │
│ file_url                          │
│ upload_date                       │
│ uploaded_by (FK → USERS)          │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│    HEALTH_UPDATE_REQUESTS         │
├───────────────────────────────────┤
│ id (PK)                           │
│ student_id (FK)                   │
│ parent_id (FK → USERS)            │
│ update_description                │
│ status (enum)                     │
│ submitted_at                      │
│ reviewed_by (FK → USERS, null)    │
│ reviewed_at (nullable)            │
│ review_notes (nullable)           │
│ timestamps                        │
└───────────────────────────────────┘
```

## Parent-Teacher Meetings

```
┌───────────────────────────────────┐
│         PT_SESSIONS               │
├───────────────────────────────────┤
│ id (PK)                           │
│ school_id (FK)                    │
│ name                              │
│ dates (JSON array)                │
│ slot_duration_minutes             │
│ break_between_slots_minutes       │
│ start_time                        │
│ end_time                          │
│ venue                             │
│ parent_instructions (nullable)    │
│ status (enum)                     │
│ booking_deadline                  │
│ timestamps                        │
└───────────────────────────────────┘
         │
         │ 1:N
         ├──────────> PT_SLOTS
         └──────────> PT_BOOKINGS


┌───────────────────────────────────┐
│          PT_SLOTS                 │
├───────────────────────────────────┤
│ id (PK)                           │
│ session_id (FK)                   │
│ teacher_name                      │
│ date                              │
│ start_time                        │
│ end_time                          │
│ status (enum)                     │
│ blocked_reason (nullable)         │
│ timestamps                        │
└───────────────────────────────────┘
         │
         │ 1:1
         └──────────> PT_BOOKINGS


┌───────────────────────────────────┐
│         PT_BOOKINGS               │
├───────────────────────────────────┤
│ id (PK)                           │
│ slot_id (FK)                      │
│ session_id (FK)                   │
│ parent_id (FK → USERS)            │
│ student_id (FK)                   │
│ status (enum)                     │
│ parent_message (nullable)         │
│ teacher_notes (nullable)          │
│ reschedule_reason (nullable)      │
│ booked_at                         │
│ confirmed_at (nullable)           │
│ completed_at (nullable)           │
│ timestamps                        │
└───────────────────────────────────┘
```

## Financial Management

```
┌───────────────────────────────────┐
│       EXPENSE_RECORDS             │
├───────────────────────────────────┤
│ id (PK)                           │
│ school_id (FK)                    │
│ date                              │
│ category                          │
│ description                       │
│ amount (cents)                    │
│ vendor                            │
│ receipt_url (nullable)            │
│ status (enum)                     │
│ submitted_by                      │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│     RECONCILIATION_ITEMS          │
├───────────────────────────────────┤
│ id (PK)                           │
│ school_id (FK)                    │
│ bank_transaction_id (FK, null)    │
│ system_payment_id (FK, null)      │
│ status (enum)                     │
│ confidence (enum, nullable)       │
│ matched_at (nullable)             │
│ matched_by (nullable)             │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│      BANK_TRANSACTIONS            │
├───────────────────────────────────┤
│ id (PK)                           │
│ school_id (FK)                    │
│ date                              │
│ description                       │
│ reference                         │
│ amount (cents)                    │
│ balance (cents)                   │
│ timestamps                        │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│     INTEGRATION_CONFIGS           │
├───────────────────────────────────┤
│ id (PK)                           │
│ school_id (FK)                    │
│ provider (enum)                   │
│   - xero, quickbooks, zoho, etc.  │
│ display_name                      │
│ status (enum)                     │
│ last_synced_at (nullable)         │
│ sync_frequency                    │
│ items_synced (default 0)          │
│ sync_errors (nullable)            │
│ timestamps                        │
└───────────────────────────────────┘
```

## Notifications

```
┌───────────────────────────────────┐
│        NOTIFICATIONS              │
├───────────────────────────────────┤
│ id (PK)                           │
│ user_id (FK)                      │
│ title                             │
│ message                           │
│ type (enum)                       │
│   - info, success, warning, error │
│ read (boolean, default false)     │
│ timestamps                        │
└───────────────────────────────────┘
```

## Data Types & Constraints

### Enums

- **School Status**: active, suspended, pending
- **Student Status**: active, inactive
- **Term Status**: active, upcoming, completed
- **Fee Structure Status**: active, inactive
- **Payment Status**: initiating, processing, completed, failed, manual_confirm
- **Invoice Status**: draft, sent, paid, partial, overdue, void
- **Invoice Sent Via**: email, sms, both, none
- **Notification Type**: info, success, warning, error
- **Expense Status**: pending, approved, rejected
- **Reconciliation Status**: matched, suggested, unmatched_system, unmatched_bank
- **Reconciliation Confidence**: high, medium, low
- **Integration Status**: connected, disconnected, error, syncing
- **Medical Condition Type**: chronic, allergy, disability, dietary, mental_health, other
- **Medical Condition Severity**: mild, moderate, severe, critical, life_threatening
- **Medical Condition Status**: active, resolved, monitoring
- **Allergy Category**: food, medication, environmental, insect, other
- **Vaccination Status**: up_to_date, due_soon, overdue
- **Health Incident Type**: injury, illness, allergic_reaction, mental_health, emergency, other
- **Health Document Type**: medical_certificate, vaccination_card, doctor_letter, disability_assessment, insurance_card, other
- **Health Update Request Status**: pending, reviewed, applied, declined
- **PT Session Status**: draft, open, closed, completed
- **PT Slot Status**: available, booked, blocked, completed
- **PT Booking Status**: pending, confirmed, cancelled, rescheduled, completed
- **Payment Providers**: mpesa, equity, kcb, cooperative, ncba, absa, stanbic, dtb, family, standard_chartered
- **Integration Providers**: xero, quickbooks, zoho, wave, sage

### Indexes

All tables have indexes on:
- Foreign keys (school_id, student_id, parent_id, etc.)
- Status fields
- Date fields used for querying
- Unique constraints (admission_number per school, receipt_number per school, invoice_number per school)

### Soft Deletes

Enabled on:
- Schools
- Students

### Special Constraints

- Unique composite: (school_id, admission_number) on Students
- Unique composite: (school_id, receipt_number) on Receipts
- Unique composite: (school_id, invoice_number) on Invoices
- Amounts stored as bigInteger (cents) for precision
- All foreign keys have onDelete actions (cascade/restrict/set null)

---

**Generated:** February 2026
**Database Schema Version:** 1.0.0
**Total Tables:** 39
