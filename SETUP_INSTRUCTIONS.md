# FeeYangu Backend Setup Instructions

## Prerequisites
- PHP 8.3+
- Composer
- Node.js 18+ & npm
- SQLite (for development) or MySQL (for production)

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/Isma1Huz/feeyangu-backend.git
cd feeyangu-backend
```

### 2. Install Dependencies

#### PHP Dependencies
```bash
composer install
```

#### Node.js Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` file for your environment:
- For SQLite (Development):
  ```env
  DB_CONNECTION=sqlite
  SESSION_DRIVER=file
  CACHE_STORE=file
  QUEUE_CONNECTION=sync
  ```

- For MySQL (Production):
  ```env
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=feeyangu
  DB_USERNAME=your_username
  DB_PASSWORD=your_password
  ```

### 4. Database Setup

#### For SQLite
```bash
touch database/database.sqlite
php artisan migrate:fresh --seed
```

#### For MySQL
```bash
# Create database first
mysql -u root -p -e "CREATE DATABASE feeyangu;"
php artisan migrate:fresh --seed
```

### 5. Install Ziggy (Route Generation for Inertia)
```bash
composer require tightenco/ziggy
php artisan ziggy:generate
```

### 6. Build Frontend Assets
```bash
npm run build
```

### 7. Start Development Server
```bash
php artisan serve
```

The application will be available at `http://localhost:8000`

## Demo Credentials

### Super Admin
- Email: `admin@feeyangu.com`
- Password: `password`

### School Admin (Green Academy - School 1)
- Email: `admin1@school.com`
- Password: `password`

### Accountant (Green Academy - School 1)
- Email: `accountant1@school.com`
- Password: `password`

### Parent (Green Academy - School 1)
- Email: `john.kamau1@example.com`
- Password: `password`

## Development Mode with Hot Reload

For development with Vite HMR:
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server (with CI bypass)
LARAVEL_BYPASS_ENV_CHECK=1 npm run dev
```

## Common Issues & Solutions

### Issue: "@routes" showing as plain text
**Solution**: Install Ziggy package
```bash
composer require tightenco/ziggy
php artisan ziggy:generate
```

### Issue: Styles not loading
**Solution**: Build frontend assets
```bash
npm run build
php artisan config:clear
php artisan view:clear
```

### Issue: Login not working
**Solution**: Check credentials (password is `password`, not `password123`)

### Issue: Database errors
**Solution**: Run migrations
```bash
php artisan migrate:fresh --seed
```

## Package Versions (2026 Latest)

### PHP Packages
- Laravel: 11.48.0
- Inertia Laravel: 1.3.4
- Laravel Breeze: 2.3.8
- Laravel Sanctum: 4.3.1
- Spatie Laravel Permission: 6.24.1
- tightenco/ziggy: 2.6+

### Node Packages
- React: 18.3.1
- @inertiajs/react: 2.3.16
- Vite: 5.4.19
- Tailwind CSS: 3.4.17
- TypeScript: 5.8.3

All packages are up-to-date as of February 2026.

## Testing

### Run Tests
```bash
php artisan test
```

### Clear Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
```

## Production Deployment

1. Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`
2. Configure proper database credentials
3. Set up Redis for caching/sessions if available
4. Run: `npm run build`
5. Run: `php artisan config:cache`
6. Run: `php artisan route:cache`
7. Run: `php artisan view:cache`
8. Configure web server (Apache/Nginx) to point to `/public` directory
9. Set proper file permissions: `storage/` and `bootstrap/cache/` must be writable

## Support

For issues or questions, please open an issue on the GitHub repository.
