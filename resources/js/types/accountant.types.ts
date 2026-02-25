export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'void';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  grade: string;
  term: string;
  items: { name: string; amount: number }[];
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedDate: string;
  sentVia: 'email' | 'sms' | 'both' | 'none';
}

export type ReconciliationMatchConfidence = 'high' | 'medium' | 'low';
export type ReconciliationStatus = 'matched' | 'suggested' | 'unmatched_system' | 'unmatched_bank';

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  balance: number;
}

export interface ReconciliationItem {
  id: string;
  bankTransaction?: BankTransaction;
  systemPaymentId?: string;
  systemPaymentRef?: string;
  systemAmount?: number;
  systemStudentName?: string;
  status: ReconciliationStatus;
  confidence?: ReconciliationMatchConfidence;
  matchedAt?: string;
  matchedBy?: string;
}

export type IntegrationProvider = 'xero' | 'quickbooks' | 'zoho' | 'wave' | 'sage';
export type IntegrationSyncStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

export interface IntegrationConfig {
  id: string;
  provider: IntegrationProvider;
  displayName: string;
  status: IntegrationSyncStatus;
  lastSyncedAt: string;
  syncFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  itemsSynced: number;
  syncErrors: number;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  vendor: string;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
}

export interface AccountantKPI {
  dailyCollections: string;
  pendingReconciliation: number;
  unmatchedTransactions: number;
  outstandingInvoices: number;
  paymentSuccessRate: string;
  pettyCashBalance: string;
}
