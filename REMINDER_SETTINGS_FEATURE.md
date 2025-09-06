# Reminder Settings Feature

## Overview
The Reminder Settings feature provides comprehensive automated reminder system configuration with timing rules, communication channels, message templates, and escalation workflows. This feature allows users to set up sophisticated reminder systems for invoice payments with multiple notification channels and automated escalation processes.

## Features

### ⏰ **Timing Rules**
- **Days Before Due**: Configure when to send first reminder (default: 7 days)
- **Reminder Frequency**: Set frequency for overdue reminders (daily, weekly, monthly)
- **Maximum Attempts**: Define max reminder attempts before escalation
- **Priority Levels**: Low, Medium, High, Urgent priority settings
- **Conditional Rules**: Create rules based on amount, supplier, status, currency
- **Rule Management**: Create, edit, activate/deactivate timing rules

### 📢 **Communication Channels**
- **Email**: SMTP configuration with TLS support
- **Slack**: Webhook integration for team notifications
- **SMS**: Premium feature for urgent notifications (Twilio, AWS SNS)
- **Dashboard**: Always shows overdue invoices in interface
- **Webhook**: Custom webhook integration for external systems
- **Channel Testing**: Test channel connectivity and configuration
- **Recipient Management**: Manage multiple recipients per channel

### 📝 **Message Templates**
- **Template Types**: Reminder, Overdue, Escalation, Payment Confirmation
- **Multi-language Support**: 10+ languages including English, Spanish, French, German
- **Variable System**: Dynamic content with predefined and custom variables
- **Template Variables**: {{supplier_name}}, {{invoice_number}}, {{amount}}, etc.
- **Custom Fields**: Create calculated fields and formulas
- **Template Management**: Create, edit, duplicate, preview templates
- **Default Templates**: Set default templates for each type

### 🚨 **Escalation Workflow**
- **Trigger Conditions**: Days overdue or reminder attempts
- **Escalation Actions**:
  - **Notify Manager**: Email notifications to management
  - **Create Task**: Integration with Asana, Trello, Jira, Monday.com
  - **Calculate Late Fee**: Automatic late fee calculations
  - **Send Legal Notice**: Premium feature for legal notifications
  - **Suspend Supplier**: Premium feature for supplier suspension
- **Action Delays**: Configure delays between escalation actions
- **Priority Management**: Different escalation rules by priority

### ⚙️ **Global Settings**
- **Timezone Configuration**: Support for multiple timezones
- **Working Days**: Configure business days (Monday-Friday)
- **Working Hours**: Set business hours for reminder delivery
- **Holiday Calendar**: Respect holidays in reminder scheduling
- **Rate Limiting**: Max daily reminders and batch processing
- **Retry Logic**: Configure retry attempts and delays
- **Logging Levels**: Debug, Info, Warn, Error logging

## Components

### ReminderSettingsModal
Main modal component with tabbed interface for all reminder configuration.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Handles modal close
- `onSave?: (settings: ReminderSettings) => void` - Handles settings save

**Features:**
- Tabbed interface (Timing, Channels, Templates, Escalation, Global)
- Real-time statistics dashboard
- Settings validation and testing
- Comprehensive configuration management

### TimingRules
Component for managing reminder timing and frequency rules.

**Props:**
- `timingRules: TimingRule[]` - Current timing rules
- `onAddRule: (rule) => void` - Add new timing rule
- `onUpdateRule: (id, updates) => void` - Update existing rule
- `onRemoveRule: (id) => void` - Remove timing rule

**Features:**
- Rule creation with conditions
- Priority-based rule management
- Frequency configuration
- Conditional rule builder
- Visual rule status indicators

### CommunicationChannels
Component for managing notification delivery channels.

**Props:**
- `channels: CommunicationChannel[]` - Current channels
- `onAddChannel: (channel) => void` - Add new channel
- `onUpdateChannel: (id, updates) => void` - Update channel
- `onRemoveChannel: (id) => void` - Remove channel
- `onTestChannel: (id) => void` - Test channel connectivity

**Features:**
- Multi-channel support (Email, Slack, SMS, Dashboard, Webhook)
- Channel-specific configuration forms
- Premium feature indicators
- Recipient management
- Channel testing functionality

### MessageTemplates
Component for creating and managing message templates.

**Props:**
- `templates: MessageTemplate[]` - Current templates
- `onAddTemplate: (template) => void` - Add new template
- `onUpdateTemplate: (id, updates) => void` - Update template
- `onRemoveTemplate: (id) => void` - Remove template
- `onDuplicateTemplate: (id) => void` - Duplicate template
- `onPreviewTemplate: (id) => void` - Preview template

**Features:**
- Multi-language template support
- Variable insertion system
- Custom field creation
- Template preview functionality
- Default template management

### EscalationWorkflow
Component for configuring automated escalation processes.

**Props:**
- `escalationRules: EscalationRule[]` - Current escalation rules
- `onAddRule: (rule) => void` - Add new escalation rule
- `onUpdateRule: (id, updates) => void` - Update rule
- `onRemoveRule: (id) => void` - Remove rule

**Features:**
- Multi-action escalation workflows
- Integration with project management tools
- Late fee calculation configuration
- Premium feature management
- Action delay configuration

## Types

### TimingRule
```typescript
interface TimingRule {
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
```

### CommunicationChannel
```typescript
interface CommunicationChannel {
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
```

### MessageTemplate
```typescript
interface MessageTemplate {
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
```

### EscalationRule
```typescript
interface EscalationRule {
  id: string;
  name: string;
  description: string;
  triggerAfter: number;
  triggerType: 'days' | 'attempts';
  actions: EscalationAction[];
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
```

### GlobalReminderSettings
```typescript
interface GlobalReminderSettings {
  timezone: string;
  workingDays: number[];
  workingHours: {
    start: string;
    end: string;
  };
  respectHolidays: boolean;
  holidayCalendar?: string;
  maxDailyReminders: number;
  batchProcessing: boolean;
  batchSize: number;
  retryAttempts: number;
  retryDelay: number;
  loggingLevel: 'debug' | 'info' | 'warn' | 'error';
}
```

## Usage

### Basic Setup
1. Click "Reminder Settings" button in the sidebar
2. Configure timing rules for when reminders are sent
3. Set up communication channels (email, Slack, etc.)
4. Create message templates for different scenarios
5. Configure escalation workflows for overdue invoices
6. Adjust global settings for timezone and business hours

### Advanced Configuration
1. **Timing Rules**: Create conditional rules based on invoice amount, supplier, or status
2. **Channels**: Set up multiple channels with different priorities
3. **Templates**: Create multi-language templates with custom variables
4. **Escalation**: Configure complex workflows with multiple actions
5. **Global**: Fine-tune system behavior and performance

## Integration

The Reminder Settings feature is integrated into the main Dashboard through:

1. **Sidebar Integration**: Reminder Settings button in QuickActions component
2. **Modal Management**: State management in Dashboard component
3. **Event Handlers**: Settings save and configuration handling
4. **Statistics**: Real-time reminder statistics and performance metrics

## File Structure

```
src/
├── types/
│   └── reminder.ts                 # Reminder-related type definitions
├── components/
│   ├── ReminderSettingsModal.tsx   # Main reminder settings modal
│   ├── TimingRules.tsx             # Timing rules management
│   ├── CommunicationChannels.tsx   # Channel configuration
│   ├── MessageTemplates.tsx        # Template management
│   ├── EscalationWorkflow.tsx      # Escalation configuration
│   └── index.ts                    # Component exports
└── pages/
    └── Dashboard.tsx               # Main dashboard integration
```

## Statistics Dashboard

The Global Settings tab includes a comprehensive statistics dashboard showing:

- **Total Reminders**: All-time reminder count
- **Success Rate**: Percentage of successful deliveries
- **Overdue Invoices**: Currently overdue invoice count
- **Sent Today**: Today's reminder count
- **Pending**: Reminders waiting to be sent
- **Failed**: Failed reminder attempts
- **Average Response Time**: Time to payment after reminder
- **Escalation Triggers**: Number of escalations triggered

## Premium Features

- **SMS Notifications**: Send urgent reminders via SMS
- **Legal Notices**: Automated legal notice generation
- **Supplier Suspension**: Temporarily suspend problematic suppliers
- **Advanced Analytics**: Detailed reporting and analytics
- **Custom Integrations**: Webhook and API integrations

## Future Enhancements

- **AI-Powered Timing**: Machine learning for optimal reminder timing
- **Voice Notifications**: Phone call reminders
- **Mobile App**: Dedicated mobile app for reminder management
- **Advanced Analytics**: Predictive analytics and insights
- **Multi-tenant Support**: Support for multiple organizations
- **API Integration**: RESTful API for external integrations
- **Workflow Automation**: Visual workflow builder
- **Compliance Reporting**: Automated compliance reporting

## Technical Notes

- All components use TypeScript for type safety
- Follows React best practices with functional components and hooks
- Uses shadcn/ui components for consistent UI
- Implements proper error handling and validation
- Simulates real reminder processes for demonstration
- Responsive design for mobile and desktop
- Accessible UI components with proper ARIA labels
- Premium feature indicators and restrictions
- Comprehensive configuration validation
