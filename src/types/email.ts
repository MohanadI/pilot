export interface EmailAccount {
  id: string;
  provider: 'gmail' | 'outlook' | 'exchange';
  email: string;
  displayName: string;
  isConnected: boolean;
  isActive: boolean;
  lastSync?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'connecting';
  error?: string;
}

export interface SupplierRule {
  id: string;
  supplierName: string;
  emailPattern: string;
  isActive: boolean;
  priority: number;
  autoProcess: boolean;
  folderPath?: string;
  notificationEmails: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FolderRule {
  id: string;
  accountId: string;
  folderName: string;
  folderPath: string;
  isMonitored: boolean;
  includeSubfolders: boolean;
  processingRules: {
    autoProcess: boolean;
    requireApproval: boolean;
    notificationEmails: string[];
  };
}

export interface NotificationSettings {
  id: string;
  userId: string;
  newInvoiceAlerts: boolean;
  processingErrors: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  notificationMethods: {
    email: boolean;
    inApp: boolean;
    slack?: boolean;
    teams?: boolean;
  };
  alertRecipients: {
    primary: string[];
    secondary: string[];
    managers: string[];
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
}

export interface EmailTestResult {
  id: string;
  testEmail: string;
  subject: string;
  sender: string;
  receivedAt: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  extractedData?: {
    supplier: string;
    amount: number;
    date: string;
    invoiceNumber: string;
  };
  confidence: number;
  errors?: string[];
}

export interface EmailSetupState {
  currentStep: 'accounts' | 'suppliers' | 'folders' | 'notifications' | 'testing' | 'completed';
  accounts: EmailAccount[];
  supplierRules: SupplierRule[];
  folderRules: FolderRule[];
  notificationSettings: NotificationSettings;
  testResults: EmailTestResult[];
  isSaving: boolean;
  errors: string[];
}

export type EmailProvider = 'gmail' | 'outlook' | 'exchange';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'connecting';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'error';
