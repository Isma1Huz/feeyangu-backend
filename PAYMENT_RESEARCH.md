# FeeYangu Payment Methods Research

## Overview

This document captures research into how the two core payment flows work for school fee collection in Kenya — **M-Pesa (Safaricom Daraja C2B Paybill)** and **ABSA Bank Paybill** — and exactly how each one interacts with a school's assigned paybill number and the student's admission number as the account reference.

The goal is to inform the implementation of these payment methods within the FeeYangu platform.

---

## 1. How Schools Collect Fees via Paybill in Kenya

Both M-Pesa and ABSA operate on the same conceptual model when it comes to school fee collection:

```
School gets a dedicated Paybill/Business Short Code assigned by Safaricom (M-Pesa)
                           OR
School gets a dedicated Paybill number assigned by ABSA Bank

Parent/guardian pays to that Paybill number.
When prompted for "Account Number", they enter the student's admission number.

The bank/Safaricom then passes:
  - Paybill number  →  identifies the school
  - Account number  →  identifies the student (admission number)
  - Amount          →  payment amount in KES
  - Phone/MSISDN    →  who paid
  - Transaction ID  →  unique M-Pesa/bank receipt

Your system receives a webhook (confirmation callback) with all of the above.
You look up the student by admission number → apply the payment to their account.
```

---

## 2. M-Pesa C2B Paybill (Safaricom Daraja API)

### 2.1 What It Is

The **C2B (Customer-to-Business)** API is a Safaricom Daraja API that allows a business (your school) to receive payments from M-Pesa users. The school has a **dedicated Paybill short code** (e.g., `247247`). This is *different* from the STK Push approach already in the system — the key distinction is who initiates the payment:

| Feature | C2B Paybill | STK Push (existing) |
|---|---|---|
| Who initiates | Parent goes to M-Pesa menu manually | Your system pushes a prompt to parent's phone |
| Account reference | Parent types it in (admission number) | System sets it programmatically |
| Use case | When parent pays via M-Pesa menu / USSD *777# | When parent pays via the school portal/app |
| API trigger | Webhook — Safaricom sends callback to your server | API call — your server calls Safaricom |

For the school fee use case described (school has an assigned M-Pesa paybill, student pays using admission number), the **C2B Paybill** flow is the correct one.

### 2.2 Official Documentation

- **Safaricom Daraja Developer Portal**: https://developer.safaricom.co.ke/
- **C2B API Endpoint**: `POST /mpesa/c2b/v1/registerurl` (URL registration)
- **C2B Simulate Endpoint**: `POST /mpesa/c2b/v1/simulate` (sandbox testing)

### 2.3 Step-by-Step: How C2B Paybill Works for a School

#### Step 1 — School Obtains a Paybill Number from Safaricom

The school (or FeeYangu on their behalf) applies to Safaricom for a **Business Short Code (Paybill)**. This is a 5-6 digit number like `247247`. Each school gets its own unique Paybill.

> **In FeeYangu**: This short code is stored in `SchoolPaymentConfig.paybill_number` for the school with `provider = 'mpesa'`.

#### Step 2 — School Admin Configures FeeYangu

The school admin stores their M-Pesa Paybill credentials in FeeYangu:
- `paybill_number` → the 5-6 digit short code assigned by Safaricom
- `consumer_key` / `consumer_secret` → API credentials from Daraja developer portal
- `passkey` → provided by Safaricom (used to generate request passwords)

#### Step 3 — Register Validation and Confirmation URLs (One-time Setup)

FeeYangu must register two URLs with Safaricom so Safaricom knows where to send payment notifications:

```json
POST https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl
Authorization: Bearer {access_token}

{
  "ShortCode": "247247",
  "ResponseType": "Completed",
  "ConfirmationURL": "https://api.feeyangu.com/payments/callback/mpesa/confirmation",
  "ValidationURL":   "https://api.feeyangu.com/payments/callback/mpesa/validation"
}
```

**ValidationURL** (Optional):
- Safaricom calls this *before* completing the transaction.
- Your system can accept or reject the payment (e.g., validate the admission number exists in your database).
- Your server must respond within ~5 seconds with `{ "ResultCode": 0, "ResultDesc": "Accepted" }` to accept, or `ResultCode: 1` to reject.

**ConfirmationURL** (Required):
- Safaricom calls this *after* the payment is completed.
- Your system records the payment and reconciles to the student.
- Must respond with `{ "ResultCode": 0, "ResultDesc": "Success" }`.

> **In FeeYangu**: The existing `/api/payments/callback/{provider}` route handles this. For C2B, the route needs to handle both `/callback/mpesa/validation` and `/callback/mpesa/confirmation` separately.

#### Step 4 — Parent Pays via M-Pesa Menu

The parent's experience on their phone:
```
M-Pesa Menu
  → Lipa na M-Pesa
    → Paybill
      → Business No: 247247       ← School's M-Pesa Paybill
      → Account No:  ADM/001/2024 ← Student's admission number
      → Amount:      5000
      → M-Pesa PIN: ****
      → Confirm? YES
```

#### Step 5 — Safaricom Sends Confirmation Callback to FeeYangu

```json
POST https://api.feeyangu.com/payments/callback/mpesa/confirmation
Content-Type: application/json

{
  "TransactionType": "Pay Bill",
  "TransID":         "QQQ123XYZ456",
  "TransTime":       "20241015143022",
  "TransAmount":     "5000.00",
  "BusinessShortCode": "247247",
  "BillRefNumber":   "ADM/001/2024",
  "InvoiceNumber":   "",
  "OrgAccountBalance": "150000.00",
  "ThirdPartyTransID": "",
  "MSISDN":          "254712345678",
  "FirstName":       "John",
  "MiddleName":      "",
  "LastName":        "Doe"
}
```

**The critical field**: `BillRefNumber` = `"ADM/001/2024"` — this is the admission number the parent typed.

#### Step 6 — FeeYangu Processes the Callback

```
Receive callback
  → Log to PaymentWebhookLog
  → Extract BillRefNumber → "ADM/001/2024"
  → Look up Student by school + admission_number
  → Look up open Invoice for that student
  → Create PaymentTransaction (status=completed, provider=mpesa, provider_reference=QQQ123XYZ456)
  → Apply payment to Invoice (reduce balance)
  → Generate Receipt
  → Notify parent (SMS/email) with receipt
  → Respond 200 OK: { "ResultCode": 0, "ResultDesc": "Success" }
```

### 2.4 Key Differences from Current STK Push Implementation

The current `MpesaPaymentProvider` implements **STK Push**, which is triggered *by your system*. C2B Paybill works differently:

| Aspect | STK Push (current) | C2B Paybill (required) |
|---|---|---|
| Payment trigger | System calls `stkpush/v1/processrequest` | Parent pays manually via M-Pesa menu |
| Transaction linking | `provider_reference` = `CheckoutRequestID` | Transaction linked via `BillRefNumber` = admission number |
| Callback field | `Body.stkCallback.CallbackMetadata` | Flat JSON with `BillRefNumber`, `TransID`, `MSISDN` |
| Webhook URL | `/callback/mpesa` | `/callback/mpesa/confirmation` + `/callback/mpesa/validation` |
| API setup | Just credentials | Must register URLs with Safaricom first |
| `AccountReference` field | Set by system to internal reference | Set by parent — must be the admission number |

### 2.5 Validation Callback — Admit or Reject Payments

The validation URL lets FeeYangu reject payments where the admission number doesn't match any student:

```json
// Safaricom sends to your ValidationURL:
{
  "TransactionType": "Pay Bill",
  "TransID": "...",
  "TransAmount": "5000.00",
  "BusinessShortCode": "247247",
  "BillRefNumber": "ADM/001/2024",
  "MSISDN": "254712345678",
  ...
}

// FeeYangu responds to ACCEPT:
{ "ResultCode": "0", "ResultDesc": "Accepted" }

// FeeYangu responds to REJECT (e.g., admission number not found):
{ "ResultCode": "C2B00012", "ResultDesc": "Invalid Account Number" }
```

---

## 3. ABSA Bank Paybill for School Fees

### 3.1 What It Is

ABSA Bank Kenya provides a **Paybill** service that allows schools to collect fees via M-Pesa, but the funds are settled directly into the school's **ABSA bank account**. This is essentially an M-Pesa Paybill where ABSA is the intermediary — ABSA has a master shortcode (`303030` is the generic ABSA paybill) but each school is assigned a **unique account number** within ABSA, and parents use the student's admission number as a sub-reference.

**There are two distinct models:**

#### Model A — ABSA-Assigned M-Pesa Paybill (Direct to ABSA Account)

The school has an M-Pesa Paybill where the settlement goes into their ABSA bank account.

```
Parent pays:
  → Paybill: [School's assigned M-Pesa Paybill] (managed by ABSA)
  → Account: [Student Admission Number]
  → Amount:  5000

Funds flow: Parent's M-Pesa → ABSA Settlement Account → School's ABSA Bank Account
Notification: ABSA sends a webhook/API notification to FeeYangu with payment details
```

#### Model B — ABSA Bank Transfer via Paybill 303030 (M-Pesa to ABSA)

```
Parent pays:
  → Paybill: 303030 (ABSA generic shortcode)
  → Account: [School's ABSA Account Number]
  → Amount:  5000

This credits the school's ABSA account.
FeeYangu then reconciles from the bank statement (no real-time webhook in this model).
```

> **For FeeYangu**, **Model A** is the most useful — ABSA assigns a dedicated paybill to the school, and ABSA sends real-time API notifications. This is the one the problem statement refers to.

### 3.2 Official Documentation

- **ABSA Access Developer Portal**: https://developer.absa.africa/
- **ABSA Collections API**: https://www.absabank.co.ke/corporate-and-investment/transactional-solutions/collections/
- **ABSA API Marketplace**: https://www.api.absa.africa/home/

> **Note**: ABSA's developer portal requires formal business onboarding (corporate banking relationship) before you can access the Collections API. Unlike Safaricom's public Daraja portal, ABSA APIs are not publicly accessible — they require signing a contract with ABSA Corporate Banking.

### 3.3 Step-by-Step: How ABSA Paybill Works for a School

#### Step 1 — School Opens ABSA Corporate/Business Account

The school must have an active ABSA business bank account. They then formally apply to ABSA to:
1. Have a dedicated M-Pesa Paybill linked to their account (ABSA manages this with Safaricom).
2. Activate the ABSA Collections API for the account.
3. Receive API credentials (Client ID + Client Secret) via the ABSA developer portal.

#### Step 2 — FeeYangu Stores ABSA Configuration

For each school, store in `SchoolPaymentConfig`:
- `provider = 'absa'`
- `paybill_number` → the Paybill/shortcode assigned by ABSA/Safaricom to this school
- `account_number` → the school's ABSA bank account number
- API credentials stored in `ApiCredential` table

#### Step 3 — Register Callback URLs with ABSA

Similar to the M-Pesa Daraja flow, the school (via FeeYangu) registers callback URLs with ABSA's API so FeeYangu gets notified of incoming payments.

```
POST https://api.absa.africa/collections/v1/register
Authorization: Bearer {access_token}

{
  "accountNumber": "0123456789",
  "callbackUrl":   "https://api.feeyangu.com/payments/callback/absa",
  "validationUrl": "https://api.feeyangu.com/payments/callback/absa/validation"
}
```

#### Step 4 — Parent Pays via M-Pesa Menu

```
M-Pesa Menu
  → Lipa na M-Pesa
    → Paybill
      → Business No: [School's ABSA-assigned Paybill]
      → Account No:  ADM/001/2024    ← Student admission number
      → Amount:      5000
      → Confirm
```

Funds flow:
```
Parent's M-Pesa wallet → Safaricom → ABSA settlement → School's ABSA bank account
```

#### Step 5 — ABSA Sends a Webhook to FeeYangu

ABSA's Collections API notifies FeeYangu after a successful payment:

```json
POST https://api.feeyangu.com/payments/callback/absa
Authorization: [ABSA webhook signature/token]

{
  "transactionId":     "ABSA20241015001234",
  "paybillNumber":     "123456",
  "accountReference":  "ADM/001/2024",
  "amount":            5000.00,
  "currency":          "KES",
  "payerMsisdn":       "254712345678",
  "payerName":         "John Doe",
  "transactionTime":   "2024-10-15T14:30:22Z",
  "status":            "COMPLETED",
  "bankReference":     "ABSA20241015001234"
}
```

**The critical field**: `accountReference` = `"ADM/001/2024"` — the admission number.

#### Step 6 — FeeYangu Processes the ABSA Callback

```
Receive callback
  → Verify webhook signature (HMAC or token provided by ABSA)
  → Log to PaymentWebhookLog
  → Extract accountReference → "ADM/001/2024"
  → Look up Student by school + admission_number
  → Look up open Invoice
  → Create PaymentTransaction (provider='absa', status='completed')
  → Apply payment to Invoice
  → Generate Receipt
  → Notify parent
  → Respond 200 OK: { "status": "received" }
```

### 3.4 ABSA vs M-Pesa Direct Paybill Comparison

| Aspect | M-Pesa C2B (Safaricom Daraja) | ABSA Paybill (ABSA Collections) |
|---|---|---|
| Who assigns Paybill | Safaricom | ABSA (coordinates with Safaricom) |
| Settlement destination | Any M-Pesa business/float | School's ABSA bank account |
| Real-time notifications | Yes (Daraja callbacks) | Yes (ABSA Collections webhook) |
| Account reference field | `BillRefNumber` | `accountReference` |
| Developer access | Public (Daraja dev portal) | Requires ABSA corporate account |
| API authentication | OAuth 2.0 (Basic auth to get token) | OAuth 2.0 (Client credentials) |
| Sandbox available | Yes (Safaricom sandbox) | Yes (ABSA developer sandbox) |

---

## 4. How FeeYangu's Existing System Maps to These Flows

### 4.1 Current Architecture Review

The system already has:
- `SchoolPaymentConfig` model with `paybill_number` and `account_number` fields ✅
- `Student.admission_number` field (unique per school) ✅
- `PaymentWebhookLog` for logging all callbacks ✅
- `PaymentCallbackController` with `handle()` method for any provider ✅
- `MpesaPaymentProvider` implementing STK Push ✅
- `PaymentProviderFactory` with `absa` listed as "not yet implemented" ⚠️

### 4.2 What Needs to Be Added

#### For M-Pesa C2B Paybill:

1. **Two new callback routes** (validation + confirmation):
   ```php
   // routes/api.php
   Route::post('/payments/callback/mpesa/validation',   [PaymentCallbackController::class, 'mpesaValidation'])->name('api.payment.callback.mpesa.validation');
   Route::post('/payments/callback/mpesa/confirmation', [PaymentCallbackController::class, 'mpesaConfirmation'])->name('api.payment.callback.mpesa.confirmation');
   ```

2. **New method in `MpesaPaymentProvider`** — `registerC2BUrls()` — to register validation/confirmation URLs with Safaricom one time per school.

3. **Update `handleCallback()`** in `MpesaPaymentProvider` to handle the **C2B flat payload** (not the STK Push nested payload):
   - C2B payload has `BillRefNumber` (admission number) at the root level.
   - STK Push payload has `Body.stkCallback.CallbackMetadata`.
   - These are two completely different formats — the handler must be split.

4. **Look up student by admission number** in the callback handler:
   ```php
   $admissionNumber = $payload['BillRefNumber'];
   $student = Student::where('school_id', $schoolId)
                     ->where('admission_number', $admissionNumber)
                     ->first();
   ```

5. **Validation handler** to reject payments for unknown admission numbers:
   ```php
   if (!$student) {
       return response()->json(['ResultCode' => 'C2B00012', 'ResultDesc' => 'Invalid Account Number']);
   }
   return response()->json(['ResultCode' => '0', 'ResultDesc' => 'Accepted']);
   ```

#### For ABSA Bank Paybill:

1. **Create `AbsaPaymentProvider.php`** in `/app/Services/Payment/Providers/` implementing `PaymentProviderInterface`:
   - `initiatePayment()` — not applicable for passive C2B flow (no push needed; parent pays directly).
   - `handleCallback()` — parses ABSA webhook payload, extracts `accountReference` (admission number), looks up student, records payment.
   - `validateConfiguration()` — checks ABSA API credentials are configured.

2. **Register `AbsaPaymentProvider`** in `PaymentProviderFactory`:
   ```php
   'absa' => app(AbsaPaymentProvider::class),
   ```

3. **Register callback URLs with ABSA** one time per school (similar to M-Pesa C2B URL registration).

4. **Add ABSA config keys** to `config/services.php` and `.env.example`.

### 4.3 Key Field Mapping: Admission Number as Account Reference

This is the central concept tying everything together:

```
Parent pays to Paybill → enters Admission Number as "Account Number"
                                        ↓
Safaricom/ABSA sends webhook to FeeYangu
                                        ↓
BillRefNumber (M-Pesa) or accountReference (ABSA) = Student Admission Number
                                        ↓
FeeYangu looks up:  Student.admission_number = BillRefNumber
                    (scoped to the school via paybill_number → SchoolPaymentConfig → school_id)
                                        ↓
Payment applied to student's account → Invoice balance reduced → Receipt generated
```

### 4.4 Existing Transaction Reference Format vs Admission Number

Currently when a parent initiates STK Push via the portal, the system generates an internal reference:
```
MPE-0001-STD123-240301-A1B2   ← internal reference (set by system)
```

For C2B Paybill (both M-Pesa and ABSA), the "account reference" is set by the **parent** when they pay manually:
```
ADM/001/2024   ← admission number (set by parent on their phone)
```

This means the `PaymentTransaction.reference` will be the internal reference for STK Push but the lookup key changes for C2B — FeeYangu receives the admission number and must look up the matching student first, then create the transaction.

---

## 5. Parent Payment Instructions

For FeeYangu to support the C2B paybill model, the system should display clear payment instructions to parents in the parent portal:

### M-Pesa Instructions (C2B Paybill):
```
1. Open M-Pesa on your phone
2. Select "Lipa na M-Pesa"
3. Select "Paybill"
4. Enter Business Number: [school's M-Pesa paybill number]
5. Enter Account Number:  [student's admission number, e.g., ADM/001/2024]
6. Enter Amount:          [amount to pay in KES]
7. Enter your M-Pesa PIN and confirm
8. You will receive an M-Pesa confirmation SMS
9. Your payment will reflect in the portal within a few minutes
```

### ABSA Bank Instructions:
```
Option 1 — M-Pesa to ABSA Paybill:
1. Open M-Pesa on your phone
2. Select "Lipa na M-Pesa" → "Paybill"
3. Enter Business Number: [school's ABSA-assigned paybill]
4. Enter Account Number:  [student's admission number]
5. Enter Amount and confirm

Option 2 — Direct Bank Transfer:
1. Bank: Absa Bank Kenya
2. Account Name: [School Name]
3. Account Number: [school's ABSA account number]
4. Reference/Narration: [student's admission number]
5. Upload deposit slip in the portal for manual reconciliation
```

---

## 6. Summary of Required System Changes

| Component | Change Required | Priority |
|---|---|---|
| `MpesaPaymentProvider` | Add C2B URL registration method | High |
| `MpesaPaymentProvider` | Add separate C2B callback handler (uses `BillRefNumber`) | High |
| `PaymentCallbackController` | Add `mpesaValidation()` and `mpesaConfirmation()` methods | High |
| `routes/api.php` | Add C2B validation + confirmation callback routes | High |
| `AbsaPaymentProvider` (new) | Create full provider class with ABSA Collections API | High |
| `PaymentProviderFactory` | Register AbsaPaymentProvider | High |
| `config/services.php` | Add ABSA config keys | Medium |
| `.env.example` | Add ABSA environment variables | Medium |
| Parent portal UI | Display paybill payment instructions per school | Medium |
| `SchoolPaymentConfig` | Already has `paybill_number` — no schema change needed | Done ✅ |
| `Student.admission_number` | Already exists — no schema change needed | Done ✅ |

---

## 7. References

- [Safaricom Daraja Developer Portal](https://developer.safaricom.co.ke/)
- [Safaricom C2B API Docs](https://developer.safaricom.co.ke/APIs/CustomerToBusinessRegisterURL)
- [M-Pesa C2B Operating Manual](https://www.safaricom.co.ke/images/Downloads/M-PESA-C2B-and-Paybill-Portal-Guide.pdf)
- [ABSA Access Developer Portal](https://developer.absa.africa/)
- [ABSA Collections Service](https://www.absabank.co.ke/corporate-and-investment/transactional-solutions/collections/)
- [ABSA API Marketplace](https://www.api.absa.africa/home/)
