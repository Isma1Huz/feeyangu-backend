# Payment System – Developer Guide

This document explains how to configure per-school payment credentials, which webhook
endpoints to register with each provider, and how the reference format works for
reconciliation.

---

## Table of Contents

1. [Architecture overview](#architecture-overview)
2. [Reference format](#reference-format)
3. [Configuring per-school M-Pesa credentials](#configuring-per-school-m-pesa-credentials)
4. [Configuring per-school bank credentials](#configuring-per-school-bank-credentials)
5. [Webhook / callback endpoints](#webhook--callback-endpoints)
6. [How reconciliation works](#how-reconciliation-works)
7. [Adding a new school](#adding-a-new-school)
8. [Running tests](#running-tests)

---

## Architecture overview

Feeyangu is a multi-tenant SaaS where each school is a tenant routed by subdomain
(e.g. `nakurugirls.feeyangu.com`).  Payment providers call _back_ to a shared API
endpoint on the main domain, so **webhook URLs must not depend on the subdomain**.

Each school stores its own API credentials in the `school_api_credentials` table
(model: `App\Models\SchoolApiCredential`).  Provider classes
(e.g. `MpesaPaymentProvider`) load these credentials at runtime when processing a
transaction for that school, with a fallback to global `config/services.php` values.

```
Parent initiates payment
        │
        ▼
Parent\PaymentController::initiate()
  • generates reference via PaymentReferenceGenerator
  • creates PaymentTransaction (status=pending)
  • calls MpesaPaymentProvider::initiatePayment()
        │
        ▼
Daraja STK Push request
  CallBackURL = /api/payments/callback/mpesa/{school_id}
        │
        ▼
PaymentCallbackController::handle(provider, school)
  • logs to PaymentWebhookLog
  • delegates to MpesaPaymentProvider::handleCallback()
        │
        ▼
MpesaPaymentProvider::completeTransaction()
  • marks transaction completed
  • creates Receipt (idempotent – firstOrCreate)
```

---

## Reference format

Every payment reference follows the pattern:

```
{NORMALIZED_ADMISSION}-{SCHOOL_ID}-{RANDOM_CODE}
```

| Segment              | Description                                                   |
|----------------------|---------------------------------------------------------------|
| `NORMALIZED_ADMISSION` | Admission number with only A-Z and 0-9, upper-cased          |
| `SCHOOL_ID`          | The school's integer primary key (unique per school)          |
| `RANDOM_CODE`        | 6-character base-36 random suffix (default, configurable)     |

**Examples:**

```
995-5-DKAKJD      # admission=995, school_id=5
A1232024-12-X7P9QR  # admission=A/123/2024, school_id=12
```

### Why this format?

* The school ID makes callbacks self-identifying – no subdomain needed.
* The normalized admission number lets staff reconcile manually.
* It is short enough to be typed by a customer on a PayBill prompt.
* The random suffix ensures uniqueness within a school.

### Service class

```php
use App\Services\Payment\PaymentReferenceGenerator;

$gen = new PaymentReferenceGenerator();
$ref = $gen->generate('A/123/2024', $school->id); // => "A1232024-5-X7P9QR"

// Parse a reference back to components
$parts = $gen->parse('995-5-DKAKJD');
// ['admission' => '995', 'school_id' => 5, 'code' => 'DKAKJD']
```

---

## Configuring per-school M-Pesa credentials

### 1. Create a `SchoolApiCredential` record

```php
use App\Models\SchoolApiCredential;

SchoolApiCredential::create([
    'school_id'   => $school->id,
    'provider'    => 'mpesa',          // must match enum in DB migration
    'environment' => 'sandbox',        // or 'production'
    'enabled'     => true,
    'credentials' => [                 // stored encrypted in DB
        'consumer_key'    => 'xXxXxXxX',
        'consumer_secret' => 'yYyYyYyY',
        'passkey'         => 'zZzZzZzZ',
        'shortcode'       => '174379',
    ],
]);
```

> **Security note:** The `credentials` column uses Laravel's `encrypted:array` cast,
> so values are encrypted at rest using the `APP_KEY`.

### 2. Supported credential keys for M-Pesa

| Key               | Description                                   |
|-------------------|-----------------------------------------------|
| `consumer_key`    | Daraja API consumer key                        |
| `consumer_secret` | Daraja API consumer secret                     |
| `passkey`         | Lipa Na M-Pesa Online passkey                  |
| `shortcode`       | Business short code (PayBill number)           |

### 3. Fallback

If no enabled `SchoolApiCredential` record exists for a school, the provider falls
back to the global values in `config/services.php`:

```php
// config/services.php
'mpesa' => [
    'environment'     => env('MPESA_ENVIRONMENT', 'sandbox'),
    'consumer_key'    => env('MPESA_CONSUMER_KEY'),
    'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
    'passkey'         => env('MPESA_PASSKEY'),
    'shortcode'       => env('MPESA_SHORTCODE'),
],
```

---

## Configuring per-school bank credentials

The same `school_api_credentials` table is used for bank providers.

### KCB

```php
SchoolApiCredential::create([
    'school_id'   => $school->id,
    'provider'    => 'kcb',
    'environment' => 'sandbox',
    'enabled'     => true,
    'credentials' => [
        'api_key'        => '...',
        'api_secret'     => '...',
        'account_number' => '1234567890',
        'base_url'       => 'https://api.kcbgroup.com', // optional override
    ],
]);
```

### Equity

```php
SchoolApiCredential::create([
    'school_id'   => $school->id,
    'provider'    => 'equity',
    'environment' => 'production',
    'enabled'     => true,
    'credentials' => [
        'api_key'       => '...',
        'merchant_code' => '...',
        'base_url'      => 'https://api.jengaapi.io', // optional override
    ],
]);
```

### NCBA / Co-operative

Same pattern with `provider = 'ncba'` or `provider = 'coop'`:

```php
SchoolApiCredential::create([
    'school_id'   => $school->id,
    'provider'    => 'coop',   // note: use 'coop', not 'cooperative'
    'environment' => 'sandbox',
    'enabled'     => true,
    'credentials' => [
        'api_key'        => '...',
        'account_number' => '...',
    ],
]);
```

---

## Webhook / callback endpoints

### Generic format

```
POST /api/payments/callback/{provider}/{school_id}
```

| Segment      | Example    | Description                           |
|--------------|------------|---------------------------------------|
| `{provider}` | `mpesa`    | Provider slug                         |
| `{school_id}`| `5`        | School's integer primary key          |

The `{school_id}` segment makes it possible to route callbacks for multiple schools
without relying on subdomain routing.

The legacy endpoint (without school ID) is kept for backwards compatibility:

```
POST /api/payments/callback/{provider}
```

### M-Pesa (Daraja)

Register the following URLs in the Daraja portal or via the C2B Registration API:

| Purpose                 | URL                                                       |
|-------------------------|-----------------------------------------------------------|
| STK Push callback       | `https://api.feeyangu.com/api/payments/callback/mpesa/5`  |
| C2B confirmation URL    | `https://api.feeyangu.com/api/payments/callback/mpesa/5`  |
| C2B validation URL      | `https://api.feeyangu.com/api/payments/callback/mpesa/5`  |

For the STK Push, the `CallBackURL` is set automatically when initiating payment –
it uses the school-aware route with the school's ID.

### KCB / Equity / NCBA / Co-op

Register:

```
https://api.feeyangu.com/api/payments/callback/{provider}/{school_id}
```

Examples:
- `https://api.feeyangu.com/api/payments/callback/kcb/5`
- `https://api.feeyangu.com/api/payments/callback/equity/12`

---

## How reconciliation works

### Automatic (via callbacks)

When a payment is confirmed:
1. The provider calls the callback URL.
2. `PaymentCallbackController::handle()` logs the raw payload to `payment_webhook_logs`.
3. The provider-specific handler finds the `PaymentTransaction` by:
   - **STK Push:** `provider_reference` = `CheckoutRequestID`
   - **C2B PayBill:** `reference` = `BillRefNumber` (our generated reference)
   - **Banks:** `provider_reference` or `reference`
4. The transaction is marked `completed`.
5. A `Receipt` is created (idempotent via `firstOrCreate`).

### Manual (staff portal)

A school accountant can manually confirm a pending transaction via:

```
POST /api/payments/{transaction_id}/confirm
{
  "provider_reference": "RKTQDM7W6S",
  "notes": "Confirmed via bank statement"
}
```

### Parsing the reference for reconciliation

```php
$gen    = new PaymentReferenceGenerator();
$parsed = $gen->parse('995-5-DKAKJD');
// $parsed['school_id']  => 5
// $parsed['admission']  => '995'
```

---

## Adding a new school

1. Create the `School` record.
2. Create a `SchoolPaymentConfig` for each enabled provider (display config).
3. Create a `SchoolApiCredential` for each provider that requires API access.
4. Register webhook URLs with each provider pointing to
   `/api/payments/callback/{provider}/{school_id}`.
5. For M-Pesa C2B, register the `ConfirmationURL` via the Daraja C2B Registration API.

---

## Running tests

```bash
php vendor/bin/phpunit tests/Feature/Payment/
```

Tests use an in-memory SQLite database and `Http::fake()` to mock all external HTTP
calls – no real payment API credentials are required.

Test coverage includes:
- `PaymentReferenceGeneratorTest` – reference format, uniqueness, parsing
- `MpesaPaymentFlowTest` – STK Push initiation, STK callback, C2B callback,
  idempotency, per-school credentials, KCB bank flow
