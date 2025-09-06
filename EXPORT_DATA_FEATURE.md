# Export Data Feature

## Overview
The Export Data feature provides comprehensive data export capabilities with multiple formats, filtering options, custom templates, and scheduled automation. This feature allows users to export invoice data in various formats suitable for accounting software integration, compliance reporting, and data analysis.

## Features

### 📊 Multiple Export Formats
- **CSV**: Comma-separated values for Excel and accounting software
- **Excel**: Microsoft Excel format with formatting and formulas
- **PDF Report**: Formatted PDF report for sharing and printing
- **JSON**: Structured data for developer integrations

### 🔍 Advanced Filtering
- **Date Range**: Filter by invoice date range
- **Supplier**: Filter by specific suppliers
- **Status**: Filter by invoice status (stored, processing, overdue, etc.)
- **Amount**: Filter by amount range
- **Currency**: Filter by currency type
- **Custom Filters**: Create complex filter combinations

### 📋 Custom Templates
- **Pre-built Templates**: QuickBooks, Xero, and other accounting software formats
- **Custom Fields**: Add calculated fields and formulas
- **Field Selection**: Choose which data fields to include
- **Template Management**: Create, edit, duplicate, and delete templates

### ⏰ Scheduled Exports
- **Automated Reports**: Set up recurring exports (daily, weekly, monthly, quarterly, yearly)
- **Email Delivery**: Automatic delivery to specified recipients
- **Timezone Support**: Configure exports for different timezones
- **Schedule Management**: Enable/disable and modify schedules

### 👁️ Export Preview
- **Data Preview**: See sample data before exporting
- **Size Estimation**: Preview file size and processing time
- **Column Selection**: Review which columns will be included
- **Filter Summary**: See how filters affect the export

## Components

### ExportDataModal
Main modal component that orchestrates the entire export workflow with a step-by-step wizard interface.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Handles modal close
- `onExport?: (exportData: any) => void` - Handles export completion

**Features:**
- Multi-step wizard (Format → Filters → Templates → Schedule → Preview)
- Progress indicator
- Navigation between steps
- Export job simulation

### ExportFilters
Component for creating and managing data filters.

**Props:**
- `filters: ExportFilter[]` - Current filters
- `onFiltersChange: (filters: ExportFilter[]) => void` - Filter update handler
- `availableSuppliers?: string[]` - Available supplier options
- `availableStatuses?: string[]` - Available status options
- `availableCurrencies?: string[]` - Available currency options

**Features:**
- Dynamic filter creation
- Multiple filter types (date range, supplier, status, amount, currency)
- Filter management (add, edit, remove)
- Visual filter summary

### ExportTemplates
Component for managing export templates and custom formats.

**Props:**
- `templates: ExportTemplate[]` - Available templates
- `onAddTemplate: (template) => void` - Add new template
- `onUpdateTemplate: (id, updates) => void` - Update existing template
- `onRemoveTemplate: (id) => void` - Remove template
- `onDuplicateTemplate: (id) => void` - Duplicate template

**Features:**
- Template creation and editing
- Custom field definitions
- Field type selection (text, number, date, currency, boolean)
- Formula support for calculated fields
- Template duplication and management

### ScheduledExports
Component for managing automated export schedules.

**Props:**
- `scheduledExports: ScheduledExport[]` - Current schedules
- `onAddScheduledExport: (export_) => void` - Add new schedule
- `onUpdateScheduledExport: (id, updates) => void` - Update schedule
- `onRemoveScheduledExport: (id) => void` - Remove schedule
- `onToggleScheduledExport: (id) => void` - Enable/disable schedule

**Features:**
- Schedule configuration (frequency, time, timezone)
- Recipient management
- Schedule status (active/inactive)
- Last run and next run information

### ExportPreview
Component for previewing export data and configuration.

**Props:**
- `preview: ExportPreview` - Preview data
- `format: ExportFormat` - Selected format
- `onRefresh: () => void` - Refresh preview
- `onDownload: () => void` - Start export
- `isRefreshing?: boolean` - Loading state
- `isDownloading?: boolean` - Export state

**Features:**
- Data preview table
- Export statistics
- File size and time estimation
- Export information summary
- Warning messages for filtered data

## Types

### ExportFormat
```typescript
interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  description: string;
  icon: string;
  isPopular?: boolean;
}
```

### ExportFilter
```typescript
interface ExportFilter {
  id: string;
  name: string;
  type: 'dateRange' | 'supplier' | 'status' | 'amount' | 'currency';
  value: any;
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
}
```

### ExportTemplate
```typescript
interface ExportTemplate {
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
```

### ScheduledExport
```typescript
interface ScheduledExport {
  id: string;
  name: string;
  description: string;
  format: string;
  filters: ExportFilter[];
  template?: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
  };
  recipients: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}
```

### ExportPreview
```typescript
interface ExportPreview {
  totalRecords: number;
  filteredRecords: number;
  columns: string[];
  sampleData: any[];
  estimatedSize: string;
  estimatedTime: string;
}
```

## Usage

### Basic Export
1. Click "Export Data" button in the sidebar
2. Select export format (CSV, Excel, PDF, JSON)
3. Optionally apply filters
4. Choose template (optional)
5. Preview data and configuration
6. Click "Export Now" to download

### Scheduled Export
1. Open Export Data modal
2. Go to "Schedule" step
3. Configure frequency and timing
4. Add email recipients
5. Save schedule

### Custom Template
1. Open Export Data modal
2. Go to "Templates" step
3. Click "New Template"
4. Configure fields and custom fields
5. Save template

## Integration

The Export Data feature is integrated into the main Dashboard through:

1. **Sidebar Integration**: Export button in QuickActions component
2. **Modal Management**: State management in Dashboard component
3. **Event Handlers**: Export data handling and logging

## File Structure

```
src/
├── types/
│   └── export.ts                 # Export-related type definitions
├── components/
│   ├── ExportDataModal.tsx       # Main export modal
│   ├── ExportFilters.tsx         # Filter management
│   ├── ExportTemplates.tsx       # Template management
│   ├── ScheduledExports.tsx      # Schedule management
│   ├── ExportPreview.tsx         # Data preview
│   └── index.ts                  # Component exports
└── pages/
    └── Dashboard.tsx             # Main dashboard integration
```

## Future Enhancements

- **Real-time Export Jobs**: Live progress tracking
- **Export History**: Track and manage past exports
- **Advanced Templates**: More complex template features
- **API Integration**: Connect to actual export services
- **Bulk Operations**: Export multiple datasets
- **Compression**: Automatic file compression
- **Encryption**: Secure export options
- **Cloud Storage**: Direct cloud uploads
- **Webhook Integration**: Export completion notifications

## Technical Notes

- All components use TypeScript for type safety
- Follows React best practices with functional components and hooks
- Uses shadcn/ui components for consistent UI
- Implements proper error handling and loading states
- Simulates real export processes for demonstration
- Responsive design for mobile and desktop
- Accessible UI components with proper ARIA labels
