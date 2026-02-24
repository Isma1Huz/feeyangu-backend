# FeeYangu Backend

Laravel + Inertia.js backend for FeeYangu — a Kenyan school fee management SaaS platform.

## 🚀 Quick Start

### Prerequisites

- PHP 8.2+
- Composer 2.x
- MySQL 8.0+ or PostgreSQL 13+ (SQLite for development)
- Redis (optional, for production)
- Node.js 18+ (for frontend assets)

### Installation

```bash
# Clone the repository
git clone https://github.com/Isma1Huz/feeyangu-backend.git
cd feeyangu-backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Create database
touch database/database.sqlite  # For SQLite, or configure MySQL/PostgreSQL

# Run migrations and seed data
php artisan migrate --seed

# Start development server
php artisan serve
```

### Default Credentials

**Super Admin:**
- Email: `admin@feeyangu.com`
- Password: `password`

**School Admin (Nairobi Primary School):**
- Email: `admin@nairobiprimary.ac.ke`
- Password: `password`

See [PHASE1_SETUP.md](PHASE1_SETUP.md) for complete setup instructions.

## 📦 What's Included

### Phase 1: Foundation (COMPLETED ✅)

- ✅ **39 Database Migrations** - Complete schema with all relationships
- ✅ **30 Eloquent Models** - Full ORM with relationships and type casting
- ✅ **Authentication** - Laravel Breeze with API scaffolding
- ✅ **Authorization** - Spatie Permission with 4 roles (super_admin, school_admin, accountant, parent)
- ✅ **3 Custom Middleware** - Role-based and multi-tenant access control
- ✅ **Comprehensive Seeders** - 5 schools, 51 users, 40 students, complete financial data
- ✅ **Inertia.js Setup** - Configured with shared data
- ✅ **Documentation** - Complete setup guide and ERD

### Database Schema

**Core Modules:**
- 🏫 **School Management** - Multi-tenant architecture
- 👨‍🎓 **Student Management** - Enrollment, grades, classes
- 💰 **Fee Management** - Structures, items, terms
- 💳 **Payment Processing** - 10 Kenyan payment providers (M-Pesa, KCB, Equity, etc.)
- 🧾 **Invoicing** - Automated invoice generation and tracking
- 🏥 **Health Management** - Medical records, allergies, vaccinations, incidents
- 👨‍👩‍👧 **Parent-Teacher Meetings** - Scheduling and booking system
- 🔄 **Bank Reconciliation** - Payment matching
- 📊 **Expense Tracking** - School expense management
- 🔗 **Accounting Integrations** - Xero, QuickBooks, Zoho, Wave, Sage

See [DATABASE_ERD.md](DATABASE_ERD.md) for complete entity relationship diagram.

## 🏗️ Architecture

### Multi-Tenancy

School-level data isolation:
- Each school has its own data scope
- Super admins can access all schools
- School admins/accountants access only their school
- Parents access only their children's data

### Security

- Role-based access control (RBAC) via Spatie Permission
- Multi-tenant data isolation via middleware
- Password hashing (Bcrypt)
- CSRF protection
- SQL injection prevention (Eloquent ORM)
- XSS prevention
- API authentication via Laravel Sanctum

### Payment Providers

Support for 10 Kenyan payment providers:
- **M-Pesa** (Safaricom Daraja API)
- **KCB Bank**
- **Equity Bank** (Jenga API)
- **NCBA Bank** (Loop API)
- **Co-operative Bank**
- **Absa Bank**
- **Stanbic Bank**
- **DTB** (Diamond Trust Bank)
- **I&M Bank**
- **Family Bank**

## 📁 Project Structure

```
app/
├── Http/
│   ├── Controllers/      # API and web controllers
│   ├── Middleware/       # Custom middleware (role, school access, parent access)
│   └── Requests/         # Form request validation
├── Models/               # 30 Eloquent models with relationships
└── Providers/            # Service providers

database/
├── migrations/           # 39 database migrations
└── seeders/             # Comprehensive seeders with Kenyan data

routes/
├── api.php              # API routes
├── auth.php             # Authentication routes
└── web.php              # Web routes (Inertia)
```

## 🛠️ Development

### Running Tests

```bash
php artisan test
```

### Code Formatting

```bash
./vendor/bin/pint
```

### Queue Workers (Background Jobs)

```bash
php artisan queue:work
```

### Horizon (Queue Dashboard)

```bash
php artisan horizon
```

Access at: `http://localhost:8000/horizon`

## 📚 Documentation

- [Phase 1 Setup Guide](PHASE1_SETUP.md) - Complete installation and configuration
- [Database ERD](DATABASE_ERD.md) - Entity relationship diagram with all tables

## 🗺️ Roadmap

### Phase 2: Routes & Controllers (In Progress)
- [ ] Controllers for all routes
- [ ] Form request validation
- [ ] Policy-based authorization
- [ ] Inertia page responses

### Phase 3: Payment Integrations
- [ ] M-Pesa STK Push & C2B
- [ ] KCB Bank API integration
- [ ] Equity Bank Jenga API
- [ ] Other bank integrations
- [ ] Payment webhooks and callbacks

### Phase 4: Production Hardening
- [ ] Enhanced security measures
- [ ] Performance optimization
- [ ] Caching strategies
- [ ] Background job processing
- [ ] Email/SMS notifications

### Phase 5: API Endpoints
- [ ] Real-time payment status polling
- [ ] Notification system
- [ ] Receipt generation (PDF)
- [ ] Reporting APIs

## 📊 Database Statistics

- **Tables**: 39
- **Models**: 30
- **Migrations**: 39
- **Seeders**: 6
- **Sample Data**:
  - 5 Schools
  - 51 Users
  - 40 Students
  - 75 Fee Structures
  - 120 Invoices

## 🤝 Contributing

This is a private project. For issues or questions, please contact the repository owner.

## 📄 License

Proprietary - All rights reserved

---

**Built with Laravel 11** • **PHP 8.3** • **Inertia.js** • **Spatie Packages**

**Developed for:** Kenyan School Fee Management

**Status:** Phase 1 Complete ✅