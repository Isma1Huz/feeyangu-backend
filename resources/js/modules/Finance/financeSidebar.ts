import type { ModuleSidebarConfig } from '../Academics/academicsSidebar';

export const financeSidebarConfig: ModuleSidebarConfig = {
  moduleKey: 'finance',
  title: 'FINANCE',
  categories: [
    {
      name: 'FEE MANAGEMENT',
      icon: 'DollarSign',
      items: [
        { name: 'Dashboard', url: '/school/dashboard', icon: 'LayoutDashboard' },
        { name: 'Fee Structures', url: '/school/fee-structures', icon: 'FileText' },
        { name: 'Payment Methods', url: '/school/payment-methods', icon: 'Wallet' },
      ],
    },
    {
      name: 'TRANSACTIONS',
      icon: 'CreditCard',
      items: [
        { name: 'Payments', url: '/school/payments', icon: 'CreditCard' },
        { name: 'Receipts', url: '/school/receipts', icon: 'Receipt' },
      ],
    },
  ],
};
