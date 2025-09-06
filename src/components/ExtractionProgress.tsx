import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database,
  FileText,
  Euro,
  Calendar,
  Building
} from "lucide-react";
import type { ExtractionResult } from "@/types/upload";

interface ExtractionProgressProps {
  extraction: ExtractionResult;
  onComplete?: (result: ExtractionResult) => void;
}

interface ExtractionStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
}

const ExtractionProgress: React.FC<ExtractionProgressProps> = ({
  extraction,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [extractedFields, setExtractedFields] = useState<string[]>([]);

  const steps: ExtractionStep[] = [
    {
      id: 'preprocessing',
      name: 'Preprocessing',
      description: 'Analyzing document structure and preparing for extraction',
      icon: <FileText className="h-4 w-4" />,
      completed: currentStep > 0,
      current: currentStep === 0
    },
    {
      id: 'ocr',
      name: 'OCR Processing',
      description: 'Extracting text from document using optical character recognition',
      icon: <Zap className="h-4 w-4" />,
      completed: currentStep > 1,
      current: currentStep === 1
    },
    {
      id: 'ai_extraction',
      name: 'AI Extraction',
      description: 'Using AI to identify and extract invoice fields',
      icon: <Database className="h-4 w-4" />,
      completed: currentStep > 2,
      current: currentStep === 2
    },
    {
      id: 'validation',
      name: 'Validation',
      description: 'Validating extracted data and calculating confidence scores',
      icon: <CheckCircle className="h-4 w-4" />,
      completed: currentStep > 3,
      current: currentStep === 3
    }
  ];

  const fieldIcons: Record<string, React.ReactNode> = {
    supplier: <Building className="h-3 w-3" />,
    amount: <Euro className="h-3 w-3" />,
    date: <Calendar className="h-3 w-3" />,
    invoiceNumber: <FileText className="h-3 w-3" />
  };

  useEffect(() => {
    if (extraction.status === 'extracting') {
      simulateExtraction();
    }
  }, [extraction.status]);

  const simulateExtraction = () => {
    const stepDuration = 2000; // 2 seconds per step
    const fieldExtractionInterval = 500; // New field every 500ms

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= steps.length) {
          clearInterval(stepInterval);
          // Simulate completion
          setTimeout(() => {
            if (onComplete) {
              onComplete({
                ...extraction,
                status: 'review',
                progress: 100,
                fields: generateSampleFields()
              });
            }
          }, 1000);
          return prev;
        }
        return nextStep;
      });
    }, stepDuration);

    // Simulate field extraction
    const fieldInterval = setInterval(() => {
      setExtractedFields(prev => {
        const allFields = ['supplier', 'invoiceNumber', 'date', 'amount', 'vat', 'dueDate'];
        const nextField = allFields[prev.length];
        if (nextField && prev.length < allFields.length) {
          return [...prev, nextField];
        }
        if (prev.length >= allFields.length) {
          clearInterval(fieldInterval);
        }
        return prev;
      });
    }, fieldExtractionInterval);

    return () => {
      clearInterval(stepInterval);
      clearInterval(fieldInterval);
    };
  };

  const generateSampleFields = () => {
    return [
      {
        id: 'supplier',
        label: 'Supplier',
        value: 'Office Supplies Ltd',
        confidence: 0.95,
        isEditable: true,
        isRequired: true
      },
      {
        id: 'invoiceNumber',
        label: 'Invoice Number',
        value: 'INV-2025-001',
        confidence: 0.98,
        isEditable: true,
        isRequired: true
      },
      {
        id: 'date',
        label: 'Invoice Date',
        value: '2025-09-01',
        confidence: 0.92,
        isEditable: true,
        isRequired: true
      },
      {
        id: 'amount',
        label: 'Amount',
        value: '1250.50',
        confidence: 0.97,
        isEditable: true,
        isRequired: true
      },
      {
        id: 'vat',
        label: 'VAT',
        value: '250.10',
        confidence: 0.94,
        isEditable: true,
        isRequired: true
      },
      {
        id: 'dueDate',
        label: 'Due Date',
        value: '2025-09-30',
        confidence: 0.89,
        isEditable: true,
        isRequired: true
      }
    ];
  };

  const getStepStatus = (step: ExtractionStep) => {
    if (step.completed) return 'completed';
    if (step.current) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'current': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          AI Extraction Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(extraction.progress)}%</span>
          </div>
          <Progress value={extraction.progress} className="h-2" />
        </div>

        {/* Extraction Steps */}
        <div className="space-y-3">
          {steps.map((step) => {
            const status = getStepStatus(step);
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  status === 'current' ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`p-2 rounded-full ${getStepColor(status)}`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{step.name}</h4>
                    {status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {status === 'current' && (
                      <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Extracted Fields Preview */}
        {extractedFields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Extracted Fields</h4>
            <div className="grid grid-cols-2 gap-2">
              {extractedFields.map((field, index) => (
                <div
                  key={field}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded-lg animate-in slide-in-from-left-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {fieldIcons[field] || <FileText className="h-3 w-3" />}
                  <span className="text-xs font-medium capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(Math.random() * 20 + 80)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {extraction.status === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-900">Extraction Failed</p>
              <p className="text-xs text-red-700">{extraction.error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtractionProgress;
