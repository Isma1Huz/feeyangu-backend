import type { SchoolPaymentConfig } from '@/types/payment.types';

/** School-configured payment methods (will be replaced by Inertia props) */
export const schoolPaymentConfigs: SchoolPaymentConfig[] = [
  {
    id: 'spc1',
    provider: 'mpesa',
    enabled: true,
    accountNumber: 'SCHOOLFEES',
    accountName: 'Green Valley Academy',
    paybillNumber: '123456',
    order: 1,
  },
  {
    id: 'spc2',
    provider: 'kcb',
    enabled: true,
    accountNumber: '1234567890',
    accountName: 'Green Valley Academy Ltd',
    order: 2,
  },
  {
    id: 'spc3',
    provider: 'equity',
    enabled: true,
    accountNumber: '0987654321',
    accountName: 'Green Valley Academy',
    order: 3,
  },
  {
    id: 'spc4',
    provider: 'ncba',
    enabled: false,
    accountNumber: '',
    accountName: '',
    order: 4,
  },
  {
    id: 'spc5',
    provider: 'coop',
    enabled: false,
    accountNumber: '',
    accountName: '',
    order: 5,
  },
];
