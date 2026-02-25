export type PaymentProvider = 'mpesa' | 'kcb' | 'equity' | 'ncba' | 'coop' | 'absa' | 'stanbic' | 'dtb' | 'im_bank' | 'family_bank';

export interface PaymentMethodOption {
  id: PaymentProvider;
  name: string;
  category: 'mobile_money' | 'bank';
  logo?: string;
  color: string;
  instructions: string[];
}

export interface SchoolPaymentConfig {
  id: string;
  provider: PaymentProvider;
  enabled: boolean;
  accountNumber: string;
  accountName: string;
  /** M-Pesa paybill or till number */
  paybillNumber?: string;
  order: number;
}

export interface PaymentTransaction {
  id: string;
  studentId: string;
  amount: number;
  provider: PaymentProvider;
  status: 'initiating' | 'processing' | 'completed' | 'failed' | 'manual_confirm';
  reference: string;
  phoneNumber?: string;
  createdAt: string;
  completedAt?: string;
}

export const PAYMENT_PROVIDERS: PaymentMethodOption[] = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    category: 'mobile_money',
    color: 'hsl(142, 72%, 35%)',
    instructions: [
      'Go to M-Pesa on your phone',
      'Select "Lipa na M-Pesa"',
      'Select "Pay Bill"',
      'Enter Business Number: {paybill}',
      'Enter Account Number: {account}',
      'Enter Amount: {amount}',
      'Enter your M-Pesa PIN',
      'Confirm the transaction',
    ],
  },
  {
    id: 'kcb',
    name: 'KCB Bank',
    category: 'bank',
    color: 'hsl(210, 80%, 40%)',
    instructions: [
      'Log in to KCB Mobile/Internet Banking',
      'Select "Send Money" or "Pay Bills"',
      'Enter Account: {account}',
      'Account Name: {accountName}',
      'Enter Amount: KES {amount}',
      'Use Reference: {reference}',
      'Confirm the transaction',
    ],
  },
  {
    id: 'equity',
    name: 'Equity Bank',
    category: 'bank',
    color: 'hsl(25, 90%, 45%)',
    instructions: [
      'Log in to Equity Mobile/Internet Banking',
      'Select "Send Money" or "Pay Bills"',
      'Enter Account: {account}',
      'Account Name: {accountName}',
      'Enter Amount: KES {amount}',
      'Use Reference: {reference}',
      'Confirm the transaction',
    ],
  },
  {
    id: 'ncba',
    name: 'NCBA Bank',
    category: 'bank',
    color: 'hsl(200, 70%, 35%)',
    instructions: [
      'Log in to NCBA NOW app or Internet Banking',
      'Select "Transfers" → "Other Banks / Own Account"',
      'Enter Account: {account}',
      'Account Name: {accountName}',
      'Enter Amount: KES {amount}',
      'Use Reference: {reference}',
      'Confirm the transaction',
    ],
  },
  {
    id: 'coop',
    name: 'Co-operative Bank',
    category: 'bank',
    color: 'hsl(160, 60%, 35%)',
    instructions: [
      'Log in to MCo-op Cash or Internet Banking',
      'Select "Send Money" or "Pay Bills"',
      'Enter Account: {account}',
      'Account Name: {accountName}',
      'Enter Amount: KES {amount}',
      'Use Reference: {reference}',
      'Confirm the transaction',
    ],
  },
  {
    id: 'absa',
    name: 'Absa Bank',
    category: 'bank',
    color: 'hsl(0, 80%, 45%)',
    instructions: [
      'Log in to Absa Mobile/Internet Banking',
      'Select "Payments" → "Pay Bills"',
      'Enter Account: {account}',
      'Account Name: {accountName}',
      'Enter Amount: KES {amount}',
      'Use Reference: {reference}',
      'Confirm the transaction',
    ],
  },
  {
    id: 'stanbic',
    name: 'Stanbic Bank',
    category: 'bank',
    color: 'hsl(210, 60%, 45%)',
    instructions: [
      'Log in to Stanbic Mobile/Internet Banking',
      'Select "Payments"',
      'Enter Account: {account}',
      'Account Name: {accountName}',
      'Enter Amount: KES {amount}',
      'Use Reference: {reference}',
      'Confirm the transaction',
    ],
  },
  {
    id: 'dtb',
    name: 'DTB Bank',
    category: 'bank',
    color: 'hsl(35, 70%, 45%)',
    instructions: [
      'Log in to DTB Mobile/Internet Banking',
      'Select "Transfers"',
      'Enter Account: {account}',
      'Account Name: {accountName}',
      'Enter Amount: KES {amount}',
      'Use Reference: {reference}',
      'Confirm the transaction',
    ],
  },
  {
    id: 'im_bank',
    name: 'I&M Bank',
    category: 'bank',
    color: 'hsl(220, 50%, 40%)',
    instructions: [
      'Log in to I&M Mobile/Internet Banking',
      'Select "Payments"',
      'Enter Account: {account}',
      'Account Name: {accountName}',
      'Enter Amount: KES {amount}',
      'Use Reference: {reference}',
      'Confirm the transaction',
    ],
  },
  {
    id: 'family_bank',
    name: 'Family Bank',
    category: 'bank',
    color: 'hsl(280, 60%, 45%)',
    instructions: [
      'Log in to Family Bank Mobile/Internet Banking',
      'Select "Payments"',
      'Enter Account: {account}',
      'Account Name: {accountName}',
      'Enter Amount: KES {amount}',
      'Use Reference: {reference}',
      'Confirm the transaction',
    ],
  },
];
