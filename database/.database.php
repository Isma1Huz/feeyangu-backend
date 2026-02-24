<?php

return [
    'sqlite' => [
        'driver' => 'sqlite',
        'url' => env('DB_URL'),
        'database' => ':memory:',
        'prefix' => '',
        'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
    ],
];
