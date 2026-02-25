# Build Instructions

This document provides instructions for building and deploying the FeeYangu application.

## Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18.x or higher
- NPM or Yarn

## Initial Setup

### 1. Install PHP Dependencies

```bash
composer install
```

This will install:
- Laravel framework
- Inertia.js server-side adapter
- Ziggy (for route generation)
- All other PHP packages

### 2. Generate Ziggy Routes

```bash
php artisan ziggy:generate
```

This generates the `resources/js/ziggy.js` file which allows the frontend to access Laravel routes via the `@routes` blade directive.

> **Note**: The ziggy.js file is auto-generated and should not be committed to git (it's in .gitignore).

### 3. Install JavaScript Dependencies

```bash
npm ci
```

Or for development:

```bash
npm install
```

### 4. Build Frontend Assets

For production:

```bash
npm run build
```

For development with hot module replacement:

```bash
npm run dev
```

> **Note**: In CI environments, you may need to use `LARAVEL_BYPASS_ENV_CHECK=1 npm run dev`

## Tailwind CSS Configuration

The Tailwind configuration (`tailwind.config.ts`) is set up to scan the following directories for class names:

- `./resources/js/**/*.{ts,tsx}` - All React/TypeScript components
- `./resources/views/**/*.blade.php` - All Blade templates

This ensures that all Tailwind classes used in your components are included in the final CSS bundle.

## Issues Fixed

### Empty Pages and "@routes" Showing as Text

**Problem**: The application was showing empty pages with only "@routes" visible as plain text.

**Root Causes**:
1. Tailwind content paths were incorrect (pointing to non-existent directories)
2. Vite assets were not built
3. Ziggy package routes were not generated

**Solution**:
1. Updated `tailwind.config.ts` to use correct content paths pointing to `resources/js` directory
2. Installed composer dependencies (including Ziggy)
3. Generated Ziggy routes with `php artisan ziggy:generate`
4. Built Vite assets with `npm run build`

## Build Output

After a successful build, you should see:
- `public/build/manifest.json` - Asset manifest
- `public/build/assets/*.css` - Compiled CSS including Tailwind utilities (typically ~72KB)
- `public/build/assets/*.js` - Compiled JavaScript bundles
- `resources/js/ziggy.js` - Generated route definitions (~15KB)

## Continuous Integration

In CI environments, follow this sequence:

```bash
# Install dependencies
composer install --no-interaction --prefer-dist
npm ci

# Generate routes
php artisan ziggy:generate

# Build assets
npm run build

# Run tests (optional)
php artisan test
npm test
```

## Development Workflow

For local development:

```bash
# Terminal 1: Run Laravel server
php artisan serve

# Terminal 2: Run Vite dev server
npm run dev
```

Visit `http://localhost:8000` to see your application.

## Troubleshooting

### Empty or Unstyled Pages
- Ensure Tailwind content paths in `tailwind.config.ts` are correct
- Run `npm run build` to compile assets
- Check that `public/build` directory exists and contains assets

### "@routes" Showing as Text
- Ensure Ziggy package is installed: `composer require tightenco/ziggy`
- Generate routes: `php artisan ziggy:generate`
- Verify `resources/js/ziggy.js` exists

### Build Failures
- Clear caches: `php artisan cache:clear && php artisan config:clear`
- Remove and reinstall dependencies:
  ```bash
  rm -rf vendor node_modules
  composer install
  npm ci
  ```

### Vite HMR Issues in CI
- Use `LARAVEL_BYPASS_ENV_CHECK=1 npm run dev` to bypass environment checks
- Or use production builds: `npm run build`
