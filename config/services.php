<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Provider Services
    |--------------------------------------------------------------------------
    |
    | Configuration for payment providers (M-Pesa, Banks, etc.)
    |
    */

    'mpesa' => [
        'environment' => env('MPESA_ENVIRONMENT', 'sandbox'),
        'consumer_key' => env('MPESA_CONSUMER_KEY'),
        'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
        'passkey' => env('MPESA_PASSKEY'),
        'shortcode' => env('MPESA_SHORTCODE'),
        'initiator_name' => env('MPESA_INITIATOR_NAME'),
        'security_credential' => env('MPESA_SECURITY_CREDENTIAL'),
    ],

    'kcb' => [
        'api_key' => env('KCB_API_KEY'),
        'api_secret' => env('KCB_API_SECRET'),
        'base_url' => env('KCB_BASE_URL'),
    ],

    'equity' => [
        'merchant_code' => env('EQUITY_MERCHANT_CODE'),
        'api_key' => env('EQUITY_API_KEY'),
        'api_secret' => env('EQUITY_API_SECRET'),
        'base_url' => env('EQUITY_BASE_URL'),
    ],

];
