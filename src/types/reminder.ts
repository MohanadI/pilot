export interface TimingRule {
  id: string;
  name: string;
  description: string;
  daysBeforeDue: number;
  reminderFrequency: 'daily' | 'weekly' | 'monthly';
  maxAttempts: number;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  conditions?: ReminderCondition[];
}

export interface ReminderCondition {
  id: string;
  type: 'amount' | 'supplier' | 'status' | 'currency' | 'custom';
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'between';
  value: any;
  description: string;
}

export interface CommunicationChannel {
  id: string;
  type: 'email' | 'slack' | 'sms' | 'dashboard' | 'webhook';
  name: string;
  description: string;
  isEnabled: boolean;
  isPremium: boolean;
  configuration: ChannelConfiguration;
  recipients: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ChannelConfiguration {
  email?: {
    smtpServer: string;
    port: number;
    username: string;
    useTLS: boolean;
    fromAddress: string;
    replyTo?: string;
  };
  slack?: {
    webhookUrl: string;
    channel: string;
    username: string;
    iconEmoji?: string;
  };
  sms?: {
    provider: 'twilio' | 'aws-sns' | 'custom';
    apiKey: string;
    fromNumber: string;
    countryCode: string;
  };
  webhook?: {
    url: string;
    method: 'POST' | 'PUT' | 'PATCH';
    headers: Record<string, string>;
    authentication?: {
      type: 'bearer' | 'basic' | 'api-key';
      token: string;
    };
  };
}

export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  type: 'reminder' | 'overdue' | 'escalation' | 'payment_confirmation';
  language: string;
  subject: string;
  body: string;
  isDefault: boolean;
  isActive: boolean;
  variables: TemplateVariable[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean';
  defaultValue?: any;
  isRequired: boolean;
  example: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  description: string;
  triggerAfter: number; // days or attempts
  triggerType: 'days' | 'attempts';
  actions: EscalationAction[];
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface EscalationAction {
  id: string;
  type: 'notify_manager' | 'create_task' | 'calculate_late_fee' | 'send_legal_notice' | 'suspend_supplier';
  configuration: ActionConfiguration;
  delay?: number; // minutes
  isEnabled: boolean;
}

export interface ActionConfiguration {
  notify_manager?: {
    email: string;
    cc?: string[];
    subject: string;
    includeInvoiceDetails: boolean;
  };
  create_task?: {
    platform: 'asana' | 'trello' | 'jira' | 'monday' | 'custom';
    projectId: string;
    title: string;
    description: string;
    assignee?: string;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    labels?: string[];
  };
  calculate_late_fee?: {
    feeType: 'percentage' | 'fixed' | 'tiered';
    feeValue: number;
    maxFee?: number;
    gracePeriod: number; // days
    currency: string;
  };
  send_legal_notice?: {
    templateId: string;
    recipients: string[];
    cc?: string[];
    includeLegalText: boolean;
  };
  suspend_supplier?: {
    duration: number; // days
    reason: string;
    notifySupplier: boolean;
    autoReactivate: boolean;
  };
}

export interface ReminderSettings {
  id: string;
  name: string;
  description: string;
  timingRules: TimingRule[];
  communicationChannels: CommunicationChannel[];
  messageTemplates: MessageTemplate[];
  escalationRules: EscalationRule[];
  globalSettings: GlobalReminderSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalReminderSettings {
  timezone: string;
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  workingHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  respectHolidays: boolean;
  holidayCalendar?: string;
  maxDailyReminders: number;
  batchProcessing: boolean;
  batchSize: number;
  retryAttempts: number;
  retryDelay: number; // minutes
  loggingLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface ReminderHistory {
  id: string;
  invoiceId: string;
  reminderType: 'reminder' | 'overdue' | 'escalation';
  channel: string;
  recipient: string;
  status: 'sent' | 'failed' | 'pending' | 'cancelled';
  sentAt: string;
  deliveredAt?: string;
  errorMessage?: string;
  templateUsed: string;
  messageContent: string;
}

export interface ReminderStats {
  totalReminders: number;
  sentToday: number;
  pendingReminders: number;
  failedReminders: number;
  overdueInvoices: number;
  escalationTriggers: number;
  averageResponseTime: number; // hours
  successRate: number; // percentage
}

export type ReminderType = 'reminder' | 'overdue' | 'escalation' | 'payment_confirmation';
export type ChannelType = 'email' | 'slack' | 'sms' | 'dashboard' | 'webhook';
export type EscalationActionType = 'notify_manager' | 'create_task' | 'calculate_late_fee' | 'send_legal_notice' | 'suspend_supplier';
export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TemplateType = 'reminder' | 'overdue' | 'escalation' | 'payment_confirmation';
export type VariableType = 'text' | 'number' | 'date' | 'currency' | 'boolean';
