import React from 'react';
import SchoolPaymentMethods from '@/pages/school/PaymentMethods';

// Accountant uses the same Payment Methods config as School Admin
const PaymentGateway: React.FC = () => {
  return <SchoolPaymentMethods />;
};

export default PaymentGateway;
