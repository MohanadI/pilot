export interface Invoice {
  id: number;
  supplier: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  vat: number;
  dueDate: string;
  status: 'processing' | 'stored' | 'overdue' | 'reminder_sent';
  extractedAt: string;
  source: string;
}

export type InvoiceStatus = Invoice['status'];
