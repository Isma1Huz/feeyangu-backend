<?php

use App\Models\School;

if (! function_exists('currentTenant')) {
    /**
     * Return the current authenticated user's school (tenant).
     */
    function currentTenant(): ?School
    {
        return auth()->user()?->school;
    }
}

if (! function_exists('isModuleEnabled')) {
    /**
     * Check whether a module is enabled for the current school.
     */
    function isModuleEnabled(string $moduleKey): bool
    {
        $school = currentTenant();

        if (! $school) {
            return false;
        }

        return $school->isModuleEnabled($moduleKey);
    }
}

if (! function_exists('tenantConfig')) {
    /**
     * Retrieve a config value from the current school's module settings.
     */
    function tenantConfig(string $key, mixed $default = null): mixed
    {
        $school = currentTenant();

        if (! $school) {
            return $default;
        }

        [$moduleKey, $settingKey] = array_pad(explode('.', $key, 2), 2, null);

        if (! $settingKey) {
            return $default;
        }

        $settings = $school->getModuleSettings($moduleKey);

        return data_get($settings, $settingKey, $default);
    }
}

if (! function_exists('formatMoney')) {
    /**
     * Format an amount in Kenya Shillings.
     *
     * @param  int  $amountCents  Amount in cents (smallest currency unit, e.g. 1500 = KES 15.00)
     */
    function formatMoney(int $amountCents, string $currency = 'KES'): string
    {
        $value = $amountCents / 100;

        return $currency . ' ' . number_format($value, 2);
    }
}

if (! function_exists('formatDate')) {
    /**
     * Format a date for display in the Kenyan locale.
     */
    function formatDate(\DateTimeInterface|string|null $date, string $format = 'd M Y'): string
    {
        if (! $date) {
            return '';
        }

        if (is_string($date)) {
            $date = \Carbon\Carbon::parse($date);
        }

        return $date->format($format);
    }
}
