import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  Mail,
  Folder
} from "lucide-react";
import type { SupplierRule } from "@/types/email";

interface SupplierWhitelistProps {
  supplierRules: SupplierRule[];
  onAddRule: (rule: Omit<SupplierRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRule: (ruleId: string, updates: Partial<SupplierRule>) => void;
  onRemoveRule: (ruleId: string) => void;
}

const SupplierWhitelist: React.FC<SupplierWhitelistProps> = ({
  supplierRules,
  onAddRule,
  onUpdateRule,
  onRemoveRule
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    supplierName: '',
    emailPattern: '',
    autoProcess: true,
    priority: 1,
    folderPath: '',
    notificationEmails: ['']
  });

  const handleAddRule = () => {
    if (newRule.supplierName && newRule.emailPattern) {
      onAddRule({
        ...newRule,
        isActive: true,
        notificationEmails: newRule.notificationEmails.filter(email => email.trim() !== '')
      });
      setNewRule({
        supplierName: '',
        emailPattern: '',
        autoProcess: true,
        priority: 1,
        folderPath: '',
        notificationEmails: ['']
      });
      setIsAdding(false);
    }
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<SupplierRule>) => {
    onUpdateRule(ruleId, updates);
    setEditingRule(null);
  };

  const addNotificationEmail = () => {
    setNewRule(prev => ({
      ...prev,
      notificationEmails: [...prev.notificationEmails, '']
    }));
  };

  const updateNotificationEmail = (index: number, value: string) => {
    setNewRule(prev => ({
      ...prev,
      notificationEmails: prev.notificationEmails.map((email, i) => 
        i === index ? value : email
      )
    }));
  };

  const removeNotificationEmail = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      notificationEmails: prev.notificationEmails.filter((_, i) => i !== index)
    }));
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getPriorityText = (priority: number) => {
    if (priority >= 3) return 'High';
    if (priority >= 2) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Add New Rule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Supplier Whitelist
            </CardTitle>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              variant={isAdding ? "outline" : "default"}
            >
              {isAdding ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Define trusted suppliers and their processing rules
          </p>
        </CardHeader>
        
        {isAdding && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={newRule.supplierName}
                  onChange={(e) => setNewRule(prev => ({ ...prev, supplierName: e.target.value }))}
                  placeholder="e.g., Office Supplies Ltd"
                />
              </div>
              <div>
                <Label htmlFor="emailPattern">Email Pattern</Label>
                <Input
                  id="emailPattern"
                  value={newRule.emailPattern}
                  onChange={(e) => setNewRule(prev => ({ ...prev, emailPattern: e.target.value }))}
                  placeholder="e.g., accounting@supplier.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={newRule.priority}
                  onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                </select>
              </div>
              <div>
                <Label htmlFor="folderPath">Folder Path (Optional)</Label>
                <Input
                  id="folderPath"
                  value={newRule.folderPath}
                  onChange={(e) => setNewRule(prev => ({ ...prev, folderPath: e.target.value }))}
                  placeholder="e.g., Invoices/Office Supplies"
                />
              </div>
            </div>

            <div>
              <Label>Notification Emails</Label>
              <div className="space-y-2">
                {newRule.notificationEmails.map((email, index) => (
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoProcess"
                checked={newRule.autoProcess}
                onChange={(e) => setNewRule(prev => ({ ...prev, autoProcess: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="autoProcess">Auto-process invoices from this supplier</Label>
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
          <CardTitle>Supplier Rules ({supplierRules.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {supplierRules.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Supplier Rules
              </h3>
              <p className="text-gray-600">
                Add supplier rules to automatically process invoices from trusted senders
              </p>
            </div>
          ) : (
            supplierRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rule.supplierName}</span>
                        <Badge className={`text-xs ${getPriorityColor(rule.priority)}`}>
                          {getPriorityText(rule.priority)} Priority
                        </Badge>
                        {rule.autoProcess && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Auto-process
                          </Badge>
                        )}
                        {!rule.isActive && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {rule.emailPattern}
                        </div>
                        {rule.folderPath && (
                          <div className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {rule.folderPath}
                          </div>
                        )}
                      </div>
                      {rule.notificationEmails.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Notifications: {rule.notificationEmails.join(', ')}
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

export default SupplierWhitelist;
