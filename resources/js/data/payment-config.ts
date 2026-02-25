import type { SchoolPaymentConfig } from '@/types/payment.types';

/** 
 * DEPRECATED: School-configured payment methods 
 * 
 * This file contained mock/hardcoded payment configurations and should NOT be used.
 * Payment configurations are now fetched from the backend database via Inertia props.
 * 
 * See: app/Http/Controllers/Parent/ChildrenController.php (show method, line 104-114)
 * The backend passes real payment methods via the 'paymentMethods' prop.
 * 
 * DO NOT IMPORT THIS FILE IN ANY COMPONENTS.
 */

/* COMMENTED OUT - DO NOT USE MOCK DATA
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
*/
