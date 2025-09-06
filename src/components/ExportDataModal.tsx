import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  ArrowLeft,
  ArrowRight,
  FileText,
  Filter,
  Settings,
  Clock,
  Eye
} from "lucide-react";
import ExportFilters from "./ExportFilters";
import ExportTemplates from "./ExportTemplates";
import ScheduledExports from "./ScheduledExports";
import ExportPreview from "./ExportPreview";
import type { 
  ExportFormat, 
  ExportFilter, 
  ExportTemplate, 
  ScheduledExport,
  ExportPreview as ExportPreviewType,
  ExportJob
} from "@/types/export";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport?: (exportData: any) => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  onExport
}) => {
  const [currentStep, setCurrentStep] = useState<'format' | 'filters' | 'templates' | 'schedule' | 'preview'>('format');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [filters, setFilters] = useState<ExportFilter[]>([]);
  const [selectedTemplate] = useState<ExportTemplate | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const formats: ExportFormat[] = [
    {
      id: 'csv',
      name: 'CSV',
      extension: 'csv',
      mimeType: 'text/csv',
      description: 'Comma-separated values for Excel and accounting software',
      icon: '📊',
      isPopular: true
    },
    {
      id: 'excel',
      name: 'Excel',
      extension: 'xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: 'Microsoft Excel format with formatting and formulas',
      icon: '📈',
      isPopular: true
    },
    {
      id: 'pdf',
      name: 'PDF Report',
      extension: 'pdf',
      mimeType: 'application/pdf',
      description: 'Formatted PDF report for sharing and printing',
      icon: '📄'
    },
    {
      id: 'json',
      name: 'JSON',
      extension: 'json',
      mimeType: 'application/json',
      description: 'Structured data for developer integrations',
      icon: '🔧'
    }
  ];

  const templates: ExportTemplate[] = [
    {
      id: '1',
      name: 'QuickBooks Import',
      description: 'Optimized for QuickBooks import',
      format: 'csv',
      fields: ['supplier', 'invoiceNumber', 'date', 'amount', 'vat'],
      isDefault: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Xero Import',
      description: 'Formatted for Xero accounting software',
      format: 'excel',
      fields: ['supplier', 'invoiceNumber', 'date', 'amount', 'vat', 'dueDate'],
      isDefault: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const scheduledExports: ScheduledExport[] = [
    {
      id: '1',
      name: 'Monthly Invoice Report',
      description: 'Monthly summary of all invoices',
      format: 'pdf',
      filters: [],
      schedule: {
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '09:00',
        timezone: 'UTC'
      },
      recipients: ['admin@company.com'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const preview: ExportPreviewType = {
    totalRecords: 1250,
    filteredRecords: 1250,
    columns: ['supplier', 'invoiceNumber', 'date', 'amount', 'vat', 'status'],
    sampleData: [
      {
        supplier: 'Office Supplies Ltd',
        invoiceNumber: 'INV-2025-001',
        date: '2025-09-01',
        amount: 1250.50,
        vat: 250.10,
        status: 'stored'
      },
      {
        supplier: 'Tech Solutions GmbH',
        invoiceNumber: 'TS-5847',
        date: '2025-08-28',
        amount: 3200.00,
        vat: 640.00,
        status: 'stored'
      },
      {
        supplier: 'Marketing Agency Pro',
        invoiceNumber: 'MAP-2025-078',
        date: '2025-08-25',
        amount: 2800.75,
        vat: 560.15,
        status: 'overdue'
      }
    ],
    estimatedSize: '2.5 MB',
    estimatedTime: '30 seconds'
  };

  const steps = [
    { id: 'format', name: 'Format', icon: FileText, description: 'Choose export format' },
    { id: 'filters', name: 'Filters', icon: Filter, description: 'Filter your data' },
    { id: 'templates', name: 'Templates', icon: Settings, description: 'Select template' },
    { id: 'schedule', name: 'Schedule', icon: Clock, description: 'Set up automation' },
    { id: 'preview', name: 'Preview', icon: Eye, description: 'Review and export' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepInfo = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id as any);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id as any);
    }
  };

  const handleExport = async () => {
    if (!selectedFormat) return;
    
    setIsExporting(true);
    
    // Simulate export job
    const job: ExportJob = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Export ${selectedFormat.name}`,
      format: selectedFormat.id,
      filters,
      template: selectedTemplate?.id,
      status: 'processing',
      progress: 0,
      totalRecords: preview.filteredRecords,
      processedRecords: 0,
      createdAt: new Date().toISOString()
    };
    
    // Simulate processing
    const interval = setInterval(() => {
      const newProgress = Math.min(job.progress + Math.random() * 20, 100);
      const newProcessedRecords = Math.floor((newProgress / 100) * job.totalRecords);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setIsExporting(false);
        console.log('Export completed:', {
          ...job,
          status: 'completed',
          progress: 100,
          processedRecords: job.totalRecords,
          fileSize: Math.floor(Math.random() * 5000000) + 1000000, // 1-6MB
          downloadUrl: `https://example.com/download/${job.id}`,
          completedAt: new Date().toISOString()
        });
      }
    }, 500);
    
    if (onExport) {
      onExport({
        format: selectedFormat,
        filters,
        template: selectedTemplate,
        preview
      });
    }
  };

  const handleRefreshPreview = () => {
    // Simulate refreshing preview
    console.log('Refreshing preview...');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'format': return selectedFormat !== null;
      case 'filters': return true; // Optional step
      case 'templates': return true; // Optional step
      case 'schedule': return true; // Optional step
      case 'preview': return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'format':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Choose Export Format</h3>
              <p className="text-sm text-gray-600">
                Select the format that best suits your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formats.map((format) => (
                <div
                  key={format.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedFormat?.id === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFormat(format)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{format.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{format.name}</h4>
                        {format.isPopular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{format.extension.toUpperCase()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{format.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'filters':
        return (
          <ExportFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableSuppliers={['Office Supplies Ltd', 'Tech Solutions GmbH', 'Marketing Agency Pro']}
            availableStatuses={['stored', 'processing', 'overdue', 'reminder_sent']}
            availableCurrencies={['EUR', 'USD', 'GBP']}
          />
        );
      
      case 'templates':
        return (
          <ExportTemplates
            templates={templates}
            onAddTemplate={(template) => console.log('Add template:', template)}
            onUpdateTemplate={(id, updates) => console.log('Update template:', id, updates)}
            onRemoveTemplate={(id) => console.log('Remove template:', id)}
            onDuplicateTemplate={(id) => console.log('Duplicate template:', id)}
          />
        );
      
      case 'schedule':
        return (
          <ScheduledExports
            scheduledExports={scheduledExports}
            onAddScheduledExport={(export_) => console.log('Add scheduled export:', export_)}
            onUpdateScheduledExport={(id, updates) => console.log('Update scheduled export:', id, updates)}
            onRemoveScheduledExport={(id) => console.log('Remove scheduled export:', id)}
            onToggleScheduledExport={(id) => console.log('Toggle scheduled export:', id)}
          />
        );
      
      case 'preview':
        return selectedFormat ? (
          <ExportPreview
            preview={preview}
            format={selectedFormat}
            onRefresh={handleRefreshPreview}
            onDownload={handleExport}
            isDownloading={isExporting}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStepIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Export Data
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {currentStepInfo?.description}
                </p>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : currentStepIndex > index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <step.icon className="h-4 w-4" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 ${
                        currentStepIndex > index
                          ? 'bg-green-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'preview' && (
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isExporting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isExporting}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportDataModal;

