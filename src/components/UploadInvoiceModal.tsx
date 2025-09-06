import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  CheckCircle, 
  ArrowLeft,
  FileText,
  Zap
} from "lucide-react";
import FileUploader from "./FileUploader";
import ExtractionProgress from "./ExtractionProgress";
import FieldReview from "./FieldReview";
import type { UploadedFile, ExtractionResult, UploadModalState } from "@/types/upload";

interface UploadInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceSaved?: (invoice: any) => void;
}

const UploadInvoiceModal: React.FC<UploadInvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceSaved
}) => {
  const [modalState, setModalState] = useState<UploadModalState>({
    isOpen: false,
    files: [],
    step: 'upload'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleFilesSelected = (files: UploadedFile[]) => {
    setModalState(prev => ({
      ...prev,
      files,
      step: files.length > 0 ? 'processing' : 'upload'
    }));

    // Start extraction process
    if (files.length > 0) {
      const extraction: ExtractionResult = {
        id: Math.random().toString(36).substr(2, 9),
        fileId: files[0].id,
        status: 'extracting',
        progress: 0,
        fields: []
      };
      
      setModalState(prev => ({
        ...prev,
        currentExtraction: extraction
      }));
    }
  };

  const handleExtractionComplete = (result: ExtractionResult) => {
    setModalState(prev => ({
      ...prev,
      currentExtraction: result,
      step: 'review'
    }));
  };

  const handleFieldUpdate = (fieldId: string, value: string) => {
    setModalState(prev => {
      if (!prev.currentExtraction) return prev;
      
      const updatedFields = prev.currentExtraction.fields.map(field =>
        field.id === fieldId ? { ...field, value } : field
      );
      
      return {
        ...prev,
        currentExtraction: {
          ...prev.currentExtraction,
          fields: updatedFields
        }
      };
    });
  };

  const handleSave = async () => {
    if (!modalState.currentExtraction) return;
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create invoice object from extracted data
      const invoice = {
        id: Date.now(),
        supplier: modalState.currentExtraction.fields.find(f => f.id === 'supplier')?.value || '',
        invoiceNumber: modalState.currentExtraction.fields.find(f => f.id === 'invoiceNumber')?.value || '',
        date: modalState.currentExtraction.fields.find(f => f.id === 'date')?.value || '',
        amount: parseFloat(modalState.currentExtraction.fields.find(f => f.id === 'amount')?.value || '0'),
        vat: parseFloat(modalState.currentExtraction.fields.find(f => f.id === 'vat')?.value || '0'),
        dueDate: modalState.currentExtraction.fields.find(f => f.id === 'dueDate')?.value || '',
        status: 'stored' as const,
        extractedAt: 'Just now',
        source: 'Direct Upload'
      };
      
      setModalState(prev => ({
        ...prev,
        step: 'completed'
      }));
      
      if (onInvoiceSaved) {
        onInvoiceSaved(invoice);
      }
      
      // Reset modal after a delay
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setModalState({
      isOpen: false,
      files: [],
      step: 'upload'
    });
    setIsSaving(false);
    onClose();
  };

  const handleBack = () => {
    setModalState(prev => ({
      ...prev,
      step: 'upload',
      files: [],
      currentExtraction: undefined
    }));
  };

  const getStepTitle = () => {
    switch (modalState.step) {
      case 'upload': return 'Upload Invoice Files';
      case 'processing': return 'AI Processing';
      case 'review': return 'Review Extracted Data';
      case 'completed': return 'Invoice Saved Successfully';
      default: return 'Upload Invoice';
    }
  };

  const getStepDescription = () => {
    switch (modalState.step) {
      case 'upload': return 'Select or drag and drop your invoice files to get started';
      case 'processing': return 'Our AI is extracting data from your invoice...';
      case 'review': return 'Please review and confirm the extracted information';
      case 'completed': return 'Your invoice has been successfully processed and saved';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (modalState.step) {
      case 'upload':
        return (
          <FileUploader
            onFilesSelected={handleFilesSelected}
            maxFiles={3}
            maxSizeInMB={10}
          />
        );
      
      case 'processing':
        return modalState.currentExtraction ? (
          <ExtractionProgress
            extraction={modalState.currentExtraction}
            onComplete={handleExtractionComplete}
          />
        ) : null;
      
      case 'review':
        return modalState.currentExtraction ? (
          <FieldReview
            fields={modalState.currentExtraction.fields}
            onFieldUpdate={handleFieldUpdate}
            onSave={handleSave}
            onCancel={handleClose}
            isSaving={isSaving}
          />
        ) : null;
      
      case 'completed':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Invoice Processed Successfully!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your invoice has been extracted and saved to the system.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
              <Button onClick={handleBack}>
                Upload Another
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {modalState.step !== 'upload' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  {getStepTitle()}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {getStepDescription()}
                </p>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {['upload', 'processing', 'review', 'completed'].map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      modalState.step === step
                        ? 'bg-blue-600 text-white'
                        : ['upload', 'processing', 'review'].indexOf(modalState.step) > index
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step === 'upload' && <Upload className="h-4 w-4" />}
                    {step === 'processing' && <Zap className="h-4 w-4" />}
                    {step === 'review' && <FileText className="h-4 w-4" />}
                    {step === 'completed' && <CheckCircle className="h-4 w-4" />}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-8 h-0.5 ${
                        ['upload', 'processing', 'review'].indexOf(modalState.step) > index
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
      </DialogContent>
    </Dialog>
  );
};

export default UploadInvoiceModal;
