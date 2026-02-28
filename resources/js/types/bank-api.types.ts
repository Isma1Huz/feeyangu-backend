import type { PaymentProvider } from '@/types/payment.types';

export type ApiEnvironment = 'sandbox' | 'production';

export type TestStatus = 'untested' | 'testing' | 'success' | 'failed';

export interface ApiField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password' | 'url';
  required: boolean;
  helpText?: string;
}

export interface BankApiConfig {
  provider: PaymentProvider;
  name: string;
  description: string;
  docsUrl: string;
  fields: ApiField[];
  sandboxBaseUrl: string;
  productionBaseUrl: string;
}

export interface SavedApiCredentials {
  provider: PaymentProvider;
  environment: ApiEnvironment;
  enabled: boolean;
  values: Record<string, string>;
  testStatus: TestStatus;
  lastTested?: string;
  errorMessage?: string;
}

export const BANK_API_CONFIGS: BankApiConfig[] = [
  {
    provider: 'mpesa',
    name: 'M-Pesa (Daraja)',
    description: 'Safaricom Daraja API for M-Pesa STK Push and C2B payments.',
    docsUrl: 'https://developer.safaricom.co.ke/',
    sandboxBaseUrl: 'https://sandbox.safaricom.co.ke',
    productionBaseUrl: 'https://api.safaricom.co.ke',
    fields: [
      {
        key: 'consumer_key',
        label: 'Consumer Key',
        placeholder: 'Enter your Daraja Consumer Key',
        type: 'password',
        required: true,
        helpText: 'Found in your Daraja app credentials.',
      },
      {
        key: 'consumer_secret',
        label: 'Consumer Secret',
        placeholder: 'Enter your Daraja Consumer Secret',
        type: 'password',
        required: true,
        helpText: 'Found in your Daraja app credentials.',
      },
      {
        key: 'business_short_code',
        label: 'Business Short Code',
        placeholder: 'e.g. 174379',
        type: 'text',
        required: true,
        helpText: 'Paybill or Till number (use 174379 for sandbox).',
      },
      {
        key: 'passkey',
        label: 'Lipa na M-Pesa Passkey',
        placeholder: 'Enter your Lipa na M-Pesa Passkey',
        type: 'password',
        required: true,
        helpText: 'Provided by Safaricom when your Paybill is approved.',
      },
    ],
  },
  {
    provider: 'equity',
    name: 'Equity Bank (Jenga API)',
    description: 'Equity Bank Jenga API for direct bank transfers and collections.',
    docsUrl: 'https://developer.jengaapi.io/',
    sandboxBaseUrl: 'https://uat.jengahq.io',
    productionBaseUrl: 'https://api.jengahq.io',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'Enter your Jenga API Key',
        type: 'password',
        required: true,
        helpText: 'Your Jenga API public key for request signing.',
      },
      {
        key: 'merchant_code',
        label: 'Merchant Code',
        placeholder: 'Enter your merchant code',
        type: 'text',
        required: true,
        helpText: 'Your unique merchant identifier from Equity Bank.',
      },
      {
        key: 'private_key',
        label: 'Private Key (PEM)',
        placeholder: '-----BEGIN RSA PRIVATE KEY-----',
        type: 'password',
        required: true,
        helpText: 'RSA private key used to sign API requests.',
      },
    ],
  },
  {
    provider: 'kcb',
    name: 'KCB Bank',
    description: 'KCB Bank API for real-time payment processing and collections.',
    docsUrl: 'https://developer.kcbgroup.com/',
    sandboxBaseUrl: 'https://uat.buni.kcbgroup.com',
    productionBaseUrl: 'https://api.buni.kcbgroup.com',
    fields: [
      {
        key: 'consumer_key',
        label: 'Consumer Key',
        placeholder: 'Enter your KCB Consumer Key',
        type: 'password',
        required: true,
      },
      {
        key: 'consumer_secret',
        label: 'Consumer Secret',
        placeholder: 'Enter your KCB Consumer Secret',
        type: 'password',
        required: true,
      },
      {
        key: 'merchant_code',
        label: 'Merchant Code',
        placeholder: 'Enter your KCB merchant code',
        type: 'text',
        required: true,
        helpText: 'Your merchant code as registered with KCB.',
      },
    ],
  },
  {
    provider: 'coop',
    name: 'Co-operative Bank',
    description: 'Co-op Bank Connect API for collections and payments.',
    docsUrl: 'https://developer.co-opbank.co.ke/',
    sandboxBaseUrl: 'https://developer.co-opbank.co.ke:8280',
    productionBaseUrl: 'https://api.co-opbank.co.ke',
    fields: [
      {
        key: 'consumer_key',
        label: 'Consumer Key',
        placeholder: 'Enter your Co-op Consumer Key',
        type: 'password',
        required: true,
      },
      {
        key: 'consumer_secret',
        label: 'Consumer Secret',
        placeholder: 'Enter your Co-op Consumer Secret',
        type: 'password',
        required: true,
      },
      {
        key: 'account_number',
        label: 'Account Number',
        placeholder: 'Enter the school account number',
        type: 'text',
        required: true,
        helpText: 'The Co-op Bank account number to receive payments.',
      },
    ],
  },
  {
    provider: 'ncba',
    name: 'NCBA Bank',
    description: 'NCBA Bank API for digital payment collections.',
    docsUrl: 'https://developer.ncbagroup.com/',
    sandboxBaseUrl: 'https://uat.ncbagroup.com/api',
    productionBaseUrl: 'https://api.ncbagroup.com',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'Enter your NCBA API Key',
        type: 'password',
        required: true,
      },
      {
        key: 'api_secret',
        label: 'API Secret',
        placeholder: 'Enter your NCBA API Secret',
        type: 'password',
        required: true,
      },
      {
        key: 'merchant_code',
        label: 'Merchant Code',
        placeholder: 'Enter your NCBA merchant code',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    provider: 'absa',
    name: 'Absa Bank',
    description: 'Absa Bank API for payment collections and transfers.',
    docsUrl: 'https://developer.absa.africa/',
    sandboxBaseUrl: 'https://api-sandbox.absa.africa',
    productionBaseUrl: 'https://api.absa.africa',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'Enter your Absa API Key',
        type: 'password',
        required: true,
      },
      {
        key: 'api_secret',
        label: 'API Secret',
        placeholder: 'Enter your Absa API Secret',
        type: 'password',
        required: true,
      },
    ],
  },
  {
    provider: 'stanbic',
    name: 'Stanbic Bank',
    description: 'Stanbic Bank API for payment processing.',
    docsUrl: 'https://developer.stanbicbank.co.ke/',
    sandboxBaseUrl: 'https://uat.stanbicbank.co.ke/api',
    productionBaseUrl: 'https://api.stanbicbank.co.ke',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'Enter your Stanbic API Key',
        type: 'password',
        required: true,
      },
      {
        key: 'merchant_code',
        label: 'Merchant Code',
        placeholder: 'Enter your Stanbic merchant code',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    provider: 'dtb',
    name: 'DTB Bank',
    description: 'Diamond Trust Bank API for collections and payments.',
    docsUrl: 'https://developer.dtbafrica.com/',
    sandboxBaseUrl: 'https://uat.dtbafrica.com/api',
    productionBaseUrl: 'https://api.dtbafrica.com',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'Enter your DTB API Key',
        type: 'password',
        required: true,
      },
      {
        key: 'merchant_code',
        label: 'Merchant Code',
        placeholder: 'Enter your DTB merchant code',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    provider: 'im_bank',
    name: 'I&M Bank',
    description: 'I&M Bank API for digital payment collections.',
    docsUrl: 'https://developer.imbank.com/',
    sandboxBaseUrl: 'https://uat.imbank.com/api',
    productionBaseUrl: 'https://api.imbank.com',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'Enter your I&M API Key',
        type: 'password',
        required: true,
      },
      {
        key: 'merchant_code',
        label: 'Merchant Code',
        placeholder: 'Enter your I&M merchant code',
        type: 'text',
        required: true,
      },
    ],
  },
  {
    provider: 'family_bank',
    name: 'Family Bank',
    description: 'Family Bank API for payment collections.',
    docsUrl: 'https://developer.familybank.co.ke/',
    sandboxBaseUrl: 'https://uat.familybank.co.ke/api',
    productionBaseUrl: 'https://api.familybank.co.ke',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        placeholder: 'Enter your Family Bank API Key',
        type: 'password',
        required: true,
      },
      {
        key: 'merchant_code',
        label: 'Merchant Code',
        placeholder: 'Enter your Family Bank merchant code',
        type: 'text',
        required: true,
      },
    ],
  },
];
