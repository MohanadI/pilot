export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  description: string;
  icon: string;
  isPopular?: boolean;
}

export interface ExportFilter {
  id: string;
  name: string;
  type: 'dateRange' | 'supplier' | 'status' | 'amount' | 'currency';
  value: any;
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: string;
  fields: string[];
  customFields?: CustomField[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean';
  formula?: string;
  isRequired: boolean;
  defaultValue?: any;
}

export interface ScheduledExport {
  id: string;
  name: string;
  description: string;
  format: string;
  filters: ExportFilter[];
  template?: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:MM format
    timezone: string;
  };
  recipients: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportJob {
  id: string;
  name: string;
  format: string;
  filters: ExportFilter[];
  template?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ExportPreview {
  totalRecords: number;
  filteredRecords: number;
  columns: string[];
  sampleData: any[];
  estimatedSize: string;
  estimatedTime: string;
}

export interface ExportSettings {
  defaultFormat: string;
  defaultTemplate?: string;
  includeHeaders: boolean;
  dateFormat: string;
  numberFormat: string;
  currencyFormat: string;
  timezone: string;
  compression: boolean;
  encryption: boolean;
  password?: string;
}

export interface ExportHistory {
  id: string;
  name: string;
  format: string;
  fileSize: number;
  recordCount: number;
  status: 'completed' | 'failed';
  createdAt: string;
  downloadUrl?: string;
  expiresAt?: string;
}

export type ExportFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type FilterType = 'dateRange' | 'supplier' | 'status' | 'amount' | 'currency';
export type FieldType = 'text' | 'number' | 'date' | 'currency' | 'boolean';

