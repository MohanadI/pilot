import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Settings,
  Building,
  Folder,
  Bell,
  Send
} from "lucide-react";
import EmailAccountConnection from "./EmailAccountConnection";
import SupplierWhitelist from "./SupplierWhitelist";
import FolderRules from "./FolderRules";
import NotificationSettings from "./NotificationSettings";
import EmailTesting from "./EmailTesting";
import type { 
  EmailSetupState, 
  EmailAccount, 
  SupplierRule, 
  FolderRule, 
  NotificationSettings as NotificationSettingsType,
  EmailTestResult 
} from "@/types/email";

interface EmailSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (setup: EmailSetupState) => void;
}

const EmailSetupModal: React.FC<EmailSetupModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [setupState, setSetupState] = useState<EmailSetupState>({
    currentStep: 'accounts',
    accounts: [],
    supplierRules: [],
    folderRules: [],
    notificationSettings: {
      id: '1',
      userId: 'current-user',
      newInvoiceAlerts: true,
      processingErrors: true,
      dailyDigest: false,
      weeklyReport: true,
      notificationMethods: {
        email: true,
        inApp: true
      },
      alertRecipients: {
        primary: ['admin@company.com'],
        secondary: [],
        managers: ['manager@company.com']
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      }
    },
    testResults: [],
    isSaving: false,
    errors: []
  });

  const steps = [
    { id: 'accounts', name: 'Email Accounts', icon: Mail, description: 'Connect your email accounts' },
    { id: 'suppliers', name: 'Supplier Rules', icon: Building, description: 'Configure trusted suppliers' },
    { id: 'folders', name: 'Folder Rules', icon: Folder, description: 'Set up folder monitoring' },
    { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Configure alert settings' },
    { id: 'testing', name: 'Testing', icon: Send, description: 'Test your configuration' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === setupState.currentStep);
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setSetupState(prev => ({
        ...prev,
        currentStep: steps[currentStepIndex + 1].id as any
      }));
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setSetupState(prev => ({
        ...prev,
        currentStep: steps[currentStepIndex - 1].id as any
      }));
    }
  };

  const handleAddAccount = (provider: 'gmail' | 'outlook' | 'exchange') => {
    const newAccount: EmailAccount = {
      id: Math.random().toString(36).substr(2, 9),
      provider,
      email: `user@${provider === 'gmail' ? 'gmail.com' : provider === 'outlook' ? 'outlook.com' : 'company.com'}`,
      displayName: `User Account (${provider})`,
      isConnected: true,
      isActive: true,
      lastSync: new Date().toISOString(),
      connectionStatus: 'connected'
    };
    
    setSetupState(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAccount]
    }));
  };

  const handleRemoveAccount = (accountId: string) => {
    setSetupState(prev => ({
      ...prev,
      accounts: prev.accounts.filter(acc => acc.id !== accountId)
    }));
  };

  const handleRefreshAccount = (accountId: string) => {
    setSetupState(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc => 
        acc.id === accountId 
          ? { ...acc, lastSync: new Date().toISOString() }
          : acc
      )
    }));
  };

  const handleUpdateAccount = (accountId: string, updates: Partial<EmailAccount>) => {
    setSetupState(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc => 
        acc.id === accountId ? { ...acc, ...updates } : acc
      )
    }));
  };

  const handleAddSupplierRule = (rule: Omit<SupplierRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: SupplierRule = {
      ...rule,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSetupState(prev => ({
      ...prev,
      supplierRules: [...prev.supplierRules, newRule]
    }));
  };

  const handleUpdateSupplierRule = (ruleId: string, updates: Partial<SupplierRule>) => {
    setSetupState(prev => ({
      ...prev,
      supplierRules: prev.supplierRules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates, updatedAt: new Date().toISOString() } : rule
      )
    }));
  };

  const handleRemoveSupplierRule = (ruleId: string) => {
    setSetupState(prev => ({
      ...prev,
      supplierRules: prev.supplierRules.filter(rule => rule.id !== ruleId)
    }));
  };

  const handleAddFolderRule = (rule: Omit<FolderRule, 'id'>) => {
    const newRule: FolderRule = {
      ...rule,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setSetupState(prev => ({
      ...prev,
      folderRules: [...prev.folderRules, newRule]
    }));
  };

  const handleUpdateFolderRule = (ruleId: string, updates: Partial<FolderRule>) => {
    setSetupState(prev => ({
      ...prev,
      folderRules: prev.folderRules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }));
  };

  const handleRemoveFolderRule = (ruleId: string) => {
    setSetupState(prev => ({
      ...prev,
      folderRules: prev.folderRules.filter(rule => rule.id !== ruleId)
    }));
  };

  const handleUpdateNotificationSettings = (updates: Partial<NotificationSettingsType>) => {
    setSetupState(prev => ({
      ...prev,
      notificationSettings: { ...prev.notificationSettings, ...updates }
    }));
  };

  const handleSendTestEmail = async (testEmail: string) => {
    // Simulate test email processing
    const testResult: EmailTestResult = {
      id: Math.random().toString(36).substr(2, 9),
      testEmail,
      subject: 'Test Invoice - Office Supplies Ltd',
      sender: 'accounting@officesupplies.com',
      receivedAt: new Date().toISOString(),
      processingStatus: 'processing',
      confidence: 0
    };
    
    setSetupState(prev => ({
      ...prev,
      testResults: [...prev.testResults, testResult]
    }));

    // Simulate processing
    setTimeout(() => {
      setSetupState(prev => ({
        ...prev,
        testResults: prev.testResults.map(result => 
          result.id === testResult.id 
            ? {
                ...result,
                processingStatus: 'completed' as const,
                confidence: 0.95,
                extractedData: {
                  supplier: 'Office Supplies Ltd',
                  amount: 1250.50,
                  date: '2025-09-01',
                  invoiceNumber: 'INV-2025-001'
                }
              }
            : result
        )
      }));
    }, 3000);
  };

  const handleRefreshResults = () => {
    // Simulate refreshing results
    console.log('Refreshing test results...');
  };

  const handleSave = async () => {
    setSetupState(prev => ({ ...prev, isSaving: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSave) {
        onSave(setupState);
      }
      
      setSetupState(prev => ({ ...prev, currentStep: 'completed' }));
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error saving email setup:', error);
    } finally {
      setSetupState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const renderStepContent = () => {
    switch (setupState.currentStep) {
      case 'accounts':
        return (
          <EmailAccountConnection
            accounts={setupState.accounts}
            onAddAccount={handleAddAccount}
            onRemoveAccount={handleRemoveAccount}
            onRefreshAccount={handleRefreshAccount}
            onUpdateAccount={handleUpdateAccount}
          />
        );
      
      case 'suppliers':
        return (
          <SupplierWhitelist
            supplierRules={setupState.supplierRules}
            onAddRule={handleAddSupplierRule}
            onUpdateRule={handleUpdateSupplierRule}
            onRemoveRule={handleRemoveSupplierRule}
          />
        );
      
      case 'folders':
        return (
          <FolderRules
            folderRules={setupState.folderRules}
            accounts={setupState.accounts}
            onAddRule={handleAddFolderRule}
            onUpdateRule={handleUpdateFolderRule}
            onRemoveRule={handleRemoveFolderRule}
          />
        );
      
      case 'notifications':
        return (
          <NotificationSettings
            settings={setupState.notificationSettings}
            onUpdateSettings={handleUpdateNotificationSettings}
          />
        );
      
      case 'testing':
        return (
          <EmailTesting
            testResults={setupState.testResults}
            onSendTestEmail={handleSendTestEmail}
            onRefreshResults={handleRefreshResults}
          />
        );
      
      case 'completed':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Setup Complete!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your email monitoring configuration has been saved successfully.
            </p>
            <div className="text-sm text-gray-500">
              <p>• {setupState.accounts.length} email accounts connected</p>
              <p>• {setupState.supplierRules.length} supplier rules configured</p>
              <p>• {setupState.folderRules.length} folder rules set up</p>
              <p>• Notification settings configured</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (setupState.currentStep) {
      case 'accounts': return setupState.accounts.length > 0;
      case 'suppliers': return true; // Optional step
      case 'folders': return true; // Optional step
      case 'notifications': return true; // Optional step
      case 'testing': return true; // Optional step
      default: return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto sm:max-w-5xl">
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
                  <Settings className="h-5 w-5 text-blue-600" />
                  Email Setup Wizard
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {currentStep?.description}
                </p>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      setupState.currentStep === step.id
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
        {setupState.currentStep !== 'completed' && (
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={setupState.isSaving}
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={setupState.isSaving}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {currentStepIndex < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || setupState.isSaving}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={!canProceed() || setupState.isSaving}
                  className="min-w-[120px]"
                >
                  {setupState.isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailSetupModal;
