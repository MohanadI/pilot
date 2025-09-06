import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Folder, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  Mail,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import type { FolderRule, EmailAccount } from "@/types/email";

interface FolderRulesProps {
  folderRules: FolderRule[];
  accounts: EmailAccount[];
  onAddRule: (rule: Omit<FolderRule, 'id'>) => void;
  onUpdateRule: (ruleId: string, updates: Partial<FolderRule>) => void;
  onRemoveRule: (ruleId: string) => void;
}

const FolderRules: React.FC<FolderRulesProps> = ({
  folderRules,
  accounts,
  onAddRule,
  onUpdateRule,
  onRemoveRule
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    accountId: '',
    folderName: '',
    folderPath: '',
    isMonitored: true,
    includeSubfolders: false,
    processingRules: {
      autoProcess: true,
      requireApproval: false,
      notificationEmails: ['']
    }
  });

  const handleAddRule = () => {
    if (newRule.accountId && newRule.folderName && newRule.folderPath) {
      onAddRule({
        ...newRule,
        processingRules: {
          ...newRule.processingRules,
          notificationEmails: newRule.processingRules.notificationEmails.filter(email => email.trim() !== '')
        }
      });
      setNewRule({
        accountId: '',
        folderName: '',
        folderPath: '',
        isMonitored: true,
        includeSubfolders: false,
        processingRules: {
          autoProcess: true,
          requireApproval: false,
          notificationEmails: ['']
        }
      });
      setIsAdding(false);
    }
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<FolderRule>) => {
    onUpdateRule(ruleId, updates);
    setEditingRule(null);
  };

  const addNotificationEmail = () => {
    setNewRule(prev => ({
      ...prev,
      processingRules: {
        ...prev.processingRules,
        notificationEmails: [...prev.processingRules.notificationEmails, '']
      }
    }));
  };

  const updateNotificationEmail = (index: number, value: string) => {
    setNewRule(prev => ({
      ...prev,
      processingRules: {
        ...prev.processingRules,
        notificationEmails: prev.processingRules.notificationEmails.map((email, i) => 
          i === index ? value : email
        )
      }
    }));
  };

  const removeNotificationEmail = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      processingRules: {
        ...prev.processingRules,
        notificationEmails: prev.processingRules.notificationEmails.filter((_, i) => i !== index)
      }
    }));
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.displayName : 'Unknown Account';
  };

  const getAccountEmail = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.email : '';
  };

  return (
    <div className="space-y-6">
      {/* Add New Rule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Folder Monitoring Rules
            </CardTitle>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              variant={isAdding ? "outline" : "default"}
              disabled={accounts.length === 0}
            >
              {isAdding ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Folder Rule
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Configure which folders to monitor for invoices
          </p>
        </CardHeader>
        
        {isAdding && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="accountId">Email Account</Label>
              <select
                id="accountId"
                value={newRule.accountId}
                onChange={(e) => setNewRule(prev => ({ ...prev, accountId: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.displayName} ({account.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newRule.folderName}
                  onChange={(e) => setNewRule(prev => ({ ...prev, folderName: e.target.value }))}
                  placeholder="e.g., Invoices"
                />
              </div>
              <div>
                <Label htmlFor="folderPath">Folder Path</Label>
                <Input
                  id="folderPath"
                  value={newRule.folderPath}
                  onChange={(e) => setNewRule(prev => ({ ...prev, folderPath: e.target.value }))}
                  placeholder="e.g., /Invoices/2025"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isMonitored"
                  checked={newRule.isMonitored}
                  onChange={(e) => setNewRule(prev => ({ ...prev, isMonitored: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isMonitored">Monitor this folder</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeSubfolders"
                  checked={newRule.includeSubfolders}
                  onChange={(e) => setNewRule(prev => ({ ...prev, includeSubfolders: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="includeSubfolders">Include subfolders</Label>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Processing Rules</h4>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoProcess"
                  checked={newRule.processingRules.autoProcess}
                  onChange={(e) => setNewRule(prev => ({ 
                    ...prev, 
                    processingRules: { ...prev.processingRules, autoProcess: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="autoProcess">Auto-process invoices</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={newRule.processingRules.requireApproval}
                  onChange={(e) => setNewRule(prev => ({ 
                    ...prev, 
                    processingRules: { ...prev.processingRules, requireApproval: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="requireApproval">Require approval before processing</Label>
              </div>
            </div>

            <div>
              <Label>Notification Emails</Label>
              <div className="space-y-2">
                {newRule.processingRules.notificationEmails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={email}
                      onChange={(e) => updateNotificationEmail(index, e.target.value)}
                      placeholder="email@company.com"
                      type="email"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotificationEmail(index)}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNotificationEmail}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Email
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRule}>
                <Save className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Existing Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Folder Rules ({folderRules.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {folderRules.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Folder Rules
              </h3>
              <p className="text-gray-600">
                Add folder rules to monitor specific folders for invoices
              </p>
            </div>
          ) : (
            folderRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Folder className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rule.folderName}</span>
                        <Badge variant={rule.isMonitored ? "default" : "secondary"}>
                          {rule.isMonitored ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Monitored
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Not Monitored
                            </>
                          )}
                        </Badge>
                        {rule.processingRules.autoProcess && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Auto-process
                          </Badge>
                        )}
                        {rule.processingRules.requireApproval && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Requires Approval
                          </Badge>
                        )}
                        {rule.includeSubfolders && (
                          <Badge variant="outline" className="text-xs">
                            <Settings className="h-3 w-3 mr-1" />
                            Includes Subfolders
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {getAccountName(rule.accountId)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {rule.folderPath}
                        </div>
                      </div>
                      {rule.processingRules.notificationEmails.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Notifications: {rule.processingRules.notificationEmails.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRule(rule.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveRule(rule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FolderRules;
