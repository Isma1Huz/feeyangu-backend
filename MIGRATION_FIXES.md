# Migration and Model Fixes Documentation

## Overview
This document details all the fixes applied to resolve migration failures and model inconsistencies in the FeeYangu backend application.

## Issues Found and Fixed

### 1. Migration Ordering Issues

**Problem:** Multiple migrations had the same timestamp, causing Laravel to execute them in alphabetical order. This led to foreign key constraint errors when child tables were created before parent tables.

**Fixed Migrations:**

| Original Timestamp | New Timestamp | Migration File | Reason |
|-------------------|---------------|----------------|---------|
| 2026_02_24_201000 | 2026_02_24_200958 | `create_academic_terms_table` | Moved before schools to avoid conflict |
| 2026_02_24_200959 | 2026_02_24_201000 | `add_school_fields_to_users_table` | Moved after schools table creation |
| 2026_02_24_201007 | 2026_02_24_201009 | `create_invoice_items_table` | Moved after invoices table |
| 2026_02_24_201008 | 2026_02_24_201010 | `create_receipt_items_table` | Moved after receipts table |
| 2026_02_24_201023 | 2026_02_24_201024 | `create_pt_bookings_table` | Moved after pt_slots table |
| 2026_02_24_191044 | 2026_02_24_201025 | `add_additional_indexes_for_performance` | Moved to end after all tables exist |

**Correct Execution Order:**
1. Core tables (users, cache, jobs)
2. Payment webhook logs
3. Permission and activity log tables
4. Academic terms (independent)
5. Schools, grades, grade classes (independent)
6. Add school_id to users (depends on schools)
7. Students, invoices, payment configs (depend on schools)
8. Payment transactions, receipts, fee structures (depend on students)
9. Invoice items, receipt items (depend on parent tables)
10. Health-related tables
11. PT sessions → PT slots → PT bookings (hierarchical)
12. Performance indexes (last, after all tables exist)

### 2. Migration Syntax Issues

**Issue:** Duplicate index definition in `payment_webhook_logs` table
- **File:** `database/migrations/2026_02_24_185500_create_payment_webhook_logs_table.php`
- **Problem:** Status column had both inline `->index()` and separate `$table->index('status')`
- **Fix:** Removed inline index, kept only the separate index definition

### 3. Model Casting Issues

**Problem:** Several models had inconsistent or missing cast definitions for their data types.

**Fixed Models:**

#### PTSession.php
- **Issue:** `booking_deadline` cast as `datetime` but migration defines it as `date`
- **Fix:** Changed cast to `'date'`
```php
'booking_deadline' => 'date',  // was 'datetime'
```

#### PaymentWebhookLog.php
- **Issue:** Used old `$casts` property instead of modern `casts()` method
- **Fix:** Converted to method-based casting
```php
protected function casts(): array  // was protected $casts = [...]
```

#### ReconciliationItem.php
- **Issue:** Missing relationship method for `matched_by` foreign key
- **Fix:** Added `matcher()` relationship
```php
public function matcher(): BelongsTo
{
    return $this->belongsTo(User::class, 'matched_by');
}
```

#### Amount Field Casts
Added integer casts to all models with `amount` or monetary fields:
- **Invoice**: `total_amount`, `paid_amount`, `balance`
- **FeeItem**: `amount`
- **InvoiceItem**: `amount`
- **ReceiptItem**: `amount`
- **Receipt**: `amount`
- **PaymentTransaction**: `amount`
- **FeeStructure**: `total_amount`

```php
protected function casts(): array
{
    return [
        'amount' => 'integer',
        // other casts...
    ];
}
```

## Verification

### Migration Test Results
```bash
php artisan migrate:fresh
# Result: All 41 migrations executed successfully ✅
```

**Tables Created:**
- 3 Laravel framework tables (users, cache, jobs)
- 38 application tables
- Total: 41 tables with proper foreign key constraints

### Seeder Test Results
```bash
php artisan db:seed
# Result: All seeders completed successfully ✅
```

**Seeded Data:**
- 5 Kenyan schools
- 51 users (including super admin, school admins, accountants, parents)
- 40 students
- Fee structures and academic terms

## Best Practices Learned

1. **Migration Timestamps:** When creating related tables, ensure parent tables have earlier timestamps than child tables that reference them.

2. **Avoid Same Timestamp:** Never give multiple migrations the same timestamp, especially if they have dependencies.

3. **Index Definitions:** Don't define an index both inline and separately - choose one approach.

4. **Model Casts:** Always match model casts to database column types:
   - `date` columns → `'date'` cast
   - `datetime`/`timestamp` → `'datetime'` cast
   - `bigInteger` amounts → `'integer'` cast
   - `json` → `'array'` cast

5. **Foreign Key Relationships:** Every foreign key in migrations should have a corresponding relationship method in the model.

6. **Consistency:** Use the modern `casts()` method approach for all models (Laravel 11+).

## Testing Migrations Locally

To test migrations on a fresh database:

```bash
# Option 1: Using SQLite (fastest for testing)
sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
touch database/database.sqlite
php artisan migrate:fresh --seed

# Option 2: Using MySQL
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status

# Rollback if needed
php artisan migrate:rollback
```

## Future Maintenance

When creating new migrations:

1. Always check dependencies before setting timestamps
2. Run `php artisan migrate:fresh` locally to test
3. Verify all foreign key constraints work
4. Add corresponding model relationships
5. Add appropriate casts to models
6. Test with seeders to verify data relationships

## Files Modified

### Migrations (6 renamed)
- `2026_02_24_200958_create_academic_terms_table.php` (renamed)
- `2026_02_24_201000_add_school_fields_to_users_table.php` (renamed)
- `2026_02_24_201009_create_invoice_items_table.php` (renamed)
- `2026_02_24_201010_create_receipt_items_table.php` (renamed)
- `2026_02_24_201024_create_pt_bookings_table.php` (renamed)
- `2026_02_24_201025_add_additional_indexes_for_performance.php` (renamed)
- `2026_02_24_185500_create_payment_webhook_logs_table.php` (fixed duplicate index)

### Models (10 updated)
- `app/Models/PTSession.php`
- `app/Models/PaymentWebhookLog.php`
- `app/Models/ReconciliationItem.php`
- `app/Models/Invoice.php`
- `app/Models/FeeItem.php`
- `app/Models/InvoiceItem.php`
- `app/Models/ReceiptItem.php`
- `app/Models/Receipt.php`
- `app/Models/PaymentTransaction.php`
- `app/Models/FeeStructure.php`

## Conclusion

All migration and model issues have been resolved. The application can now be deployed with confidence that migrations will execute successfully on fresh databases. All foreign key relationships are properly ordered, and model casts are consistent with database schema.
