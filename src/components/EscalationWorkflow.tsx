import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings,
  CheckCircle,
  X,
  Clock,
  Target,
  Users,
  DollarSign,
  FileText,
  Ban
} from "lucide-react";
import type { EscalationRule, EscalationAction, EscalationActionType, ReminderPriority } from "@/types/reminder";

interface EscalationWorkflowProps {
  escalationRules: EscalationRule[];
  onAddRule: (rule: Omit<EscalationRule, 'id'>) => void;
  onUpdateRule: (ruleId: string, updates: Partial<EscalationRule>) => void;
  onRemoveRule: (ruleId: string) => void;
}

const EscalationWorkflow: React.FC<EscalationWorkflowProps> = ({
  escalationRules,
  onAddRule,
  onUpdateRule,
  onRemoveRule
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<EscalationRule>>({
    name: '',
    description: '',
    triggerAfter: 7,
    triggerType: 'days',
    actions: [],
    isActive: true,
    priority: 'medium'
  });

  const priorities: { value: ReminderPriority; name: string; color: string; description: string }[] = [
    { value: 'low', name: 'Low', color: 'bg-gray-100 text-gray-800', description: 'Low priority escalations' },
    { value: 'medium', name: 'Medium', color: 'bg-blue-100 text-blue-800', description: 'Standard escalations' },
    { value: 'high', name: 'High', color: 'bg-orange-100 text-orange-800', description: 'Important escalations' },
    { value: 'urgent', name: 'Urgent', color: 'bg-red-100 text-red-800', description: 'Critical escalations' }
  ];

  const triggerTypes = [
    { value: 'days', name: 'Days', description: 'Trigger after X days' },
    { value: 'attempts', name: 'Attempts', description: 'Trigger after X reminder attempts' }
  ];

  const actionTypes: { value: EscalationActionType; name: string; icon: React.ReactNode; description: string; isPremium: boolean }[] = [
    { value: 'notify_manager', name: 'Notify Manager', icon: <Users className="h-4 w-4" />, description: 'Send notification to manager', isPremium: false },
    { value: 'create_task', name: 'Create Task', icon: <Target className="h-4 w-4" />, description: 'Create task in project management', isPremium: false },
    { value: 'calculate_late_fee', name: 'Calculate Late Fee', icon: <DollarSign className="h-4 w-4" />, description: 'Calculate and apply late fees', isPremium: false },
    { value: 'send_legal_notice', name: 'Send Legal Notice', icon: <FileText className="h-4 w-4" />, description: 'Send formal legal notice', isPremium: true },
    { value: 'suspend_supplier', name: 'Suspend Supplier', icon: <Ban className="h-4 w-4" />, description: 'Temporarily suspend supplier', isPremium: true }
  ];

  const taskPlatforms = [
    { value: 'asana', name: 'Asana' },
    { value: 'trello', name: 'Trello' },
    { value: 'jira', name: 'Jira' },
    { value: 'monday', name: 'Monday.com' },
    { value: 'custom', name: 'Custom' }
  ];

  const feeTypes = [
    { value: 'percentage', name: 'Percentage', description: 'X% of invoice amount' },
    { value: 'fixed', name: 'Fixed Amount', description: 'Fixed amount per day' },
    { value: 'tiered', name: 'Tiered', description: 'Different rates based on amount' }
  ];

  const handleAddRule = () => {
    if (newRule.name && newRule.description && newRule.actions && newRule.actions.length > 0) {
      onAddRule({
        name: newRule.name,
        description: newRule.description,
        triggerAfter: newRule.triggerAfter || 7,
        triggerType: newRule.triggerType || 'days',
        actions: newRule.actions,
        isActive: newRule.isActive || true,
        priority: newRule.priority || 'medium'
      });
      setNewRule({
        name: '',
        description: '',
        triggerAfter: 7,
        triggerType: 'days',
        actions: [],
        isActive: true,
        priority: 'medium'
      });
      setIsAdding(false);
    }
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<EscalationRule>) => {
    onUpdateRule(ruleId, updates);
  };

  const addAction = () => {
    setNewRule(prev => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'notify_manager',
          configuration: {},
          delay: 0,
          isEnabled: true
        }
      ]
    }));
  };

  const updateAction = (index: number, updates: Partial<EscalationAction>) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions?.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      ) || []
    }));
  };

  const removeAction = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }));
  };

  const getPriorityColor = (priority: ReminderPriority) => {
    const priorityInfo = priorities.find(p => p.value === priority);
    return priorityInfo?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityName = (priority: ReminderPriority) => {
    const priorityInfo = priorities.find(p => p.value === priority);
    return priorityInfo?.name || priority;
  };

  const getActionIcon = (type: EscalationActionType) => {
    const actionType = actionTypes.find(at => at.value === type);
    return actionType?.icon || <Settings className="h-4 w-4" />;
  };

  const getActionName = (type: EscalationActionType) => {
    const actionType = actionTypes.find(at => at.value === type);
    return actionType?.name || type;
  };

  const renderActionConfiguration = (action: EscalationAction, index: number) => {
    switch (action.type) {
      case 'notify_manager':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Manager Email</Label>
                <Input
                  value={action.configuration?.notify_manager?.email || ''}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      notify_manager: {
                        email: e.target.value,
                        subject: action.configuration?.notify_manager?.subject || '',
                        includeInvoiceDetails: action.configuration?.notify_manager?.includeInvoiceDetails || false
                      }
                    }
                  })}
                  placeholder="manager@company.com"
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={action.configuration?.notify_manager?.subject || ''}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      notify_manager: {
                        email: action.configuration?.notify_manager?.email || '',
                        subject: e.target.value,
                        includeInvoiceDetails: action.configuration?.notify_manager?.includeInvoiceDetails || false
                      }
                    }
                  })}
                  placeholder="Overdue Invoice Alert"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={action.configuration?.notify_manager?.includeInvoiceDetails || false}
                onChange={(e) => updateAction(index, {
                  configuration: {
                    ...action.configuration,
                    notify_manager: {
                      email: action.configuration?.notify_manager?.email || '',
                      subject: action.configuration?.notify_manager?.subject || '',
                      includeInvoiceDetails: e.target.checked
                    }
                  }
                })}
                className="rounded"
              />
              <Label>Include invoice details in notification</Label>
            </div>
          </div>
        );
      
      case 'create_task':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Platform</Label>
                <select
                  value={action.configuration?.create_task?.platform || 'asana'}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      create_task: {
                        platform: e.target.value as any,
                        projectId: action.configuration?.create_task?.projectId || '',
                        title: action.configuration?.create_task?.title || '',
                        description: action.configuration?.create_task?.description || '',
                        priority: action.configuration?.create_task?.priority || 'medium'
                      }
                    }
                  })}
                  className="w-full p-2 border rounded-md"
                >
                  {taskPlatforms.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Project ID</Label>
                <Input
                  value={action.configuration?.create_task?.projectId || ''}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      create_task: {
                        platform: action.configuration?.create_task?.platform || 'asana',
                        projectId: e.target.value,
                        title: action.configuration?.create_task?.title || '',
                        description: action.configuration?.create_task?.description || '',
                        priority: action.configuration?.create_task?.priority || 'medium'
                      }
                    }
                  })}
                  placeholder="Project ID"
                />
              </div>
            </div>
            <div>
              <Label>Task Title</Label>
              <Input
                value={action.configuration?.create_task?.title || ''}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      create_task: {
                        platform: action.configuration?.create_task?.platform || 'asana',
                        projectId: action.configuration?.create_task?.projectId || '',
                        title: e.target.value,
                        description: action.configuration?.create_task?.description || '',
                        priority: action.configuration?.create_task?.priority || 'medium'
                      }
                    }
                  })}
                placeholder="Follow up on overdue invoice"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                value={action.configuration?.create_task?.description || ''}
                onChange={(e) => updateAction(index, {
                  configuration: {
                    ...action.configuration,
                    create_task: {
                      platform: action.configuration?.create_task?.platform || 'asana',
                      projectId: action.configuration?.create_task?.projectId || '',
                      title: action.configuration?.create_task?.title || '',
                      description: e.target.value,
                      priority: action.configuration?.create_task?.priority || 'medium'
                    }
                  }
                })}
                placeholder="Task description"
                className="w-full h-20 p-2 border rounded-md resize-none"
              />
            </div>
          </div>
        );
      
      case 'calculate_late_fee':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Fee Type</Label>
                <select
                  value={action.configuration?.calculate_late_fee?.feeType || 'percentage'}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      calculate_late_fee: {
                        feeType: e.target.value as any,
                        feeValue: action.configuration?.calculate_late_fee?.feeValue || 0,
                        gracePeriod: action.configuration?.calculate_late_fee?.gracePeriod || 0,
                        currency: action.configuration?.calculate_late_fee?.currency || 'EUR'
                      }
                    }
                  })}
                  className="w-full p-2 border rounded-md"
                >
                  {feeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Fee Value</Label>
                <Input
                  type="number"
                  value={action.configuration?.calculate_late_fee?.feeValue || 0}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      calculate_late_fee: {
                        feeType: action.configuration?.calculate_late_fee?.feeType || 'percentage',
                        feeValue: parseFloat(e.target.value) || 0,
                        gracePeriod: action.configuration?.calculate_late_fee?.gracePeriod || 0,
                        currency: action.configuration?.calculate_late_fee?.currency || 'EUR'
                      }
                    }
                  })}
                  placeholder="5.0"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Grace Period (days)</Label>
                <Input
                  type="number"
                  value={action.configuration?.calculate_late_fee?.gracePeriod || 0}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      calculate_late_fee: {
                        feeType: action.configuration?.calculate_late_fee?.feeType || 'percentage',
                        feeValue: action.configuration?.calculate_late_fee?.feeValue || 0,
                        gracePeriod: parseInt(e.target.value) || 0,
                        currency: action.configuration?.calculate_late_fee?.currency || 'EUR'
                      }
                    }
                  })}
                  placeholder="3"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <select
                  value={action.configuration?.calculate_late_fee?.currency || 'EUR'}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      calculate_late_fee: {
                        feeType: action.configuration?.calculate_late_fee?.feeType || 'percentage',
                        feeValue: action.configuration?.calculate_late_fee?.feeValue || 0,
                        gracePeriod: action.configuration?.calculate_late_fee?.gracePeriod || 0,
                        currency: e.target.value
                      }
                    }
                  })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'send_legal_notice':
        return (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Premium Feature</span>
              </div>
              <p className="text-xs text-yellow-800 mt-1">
                Legal notices require a premium subscription
              </p>
            </div>
            <div>
              <Label>Template ID</Label>
              <Input
                value={action.configuration?.send_legal_notice?.templateId || ''}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      send_legal_notice: {
                        templateId: e.target.value,
                        recipients: action.configuration?.send_legal_notice?.recipients || [],
                        includeLegalText: action.configuration?.send_legal_notice?.includeLegalText || false
                      }
                    }
                  })}
                placeholder="legal-notice-template-001"
              />
            </div>
          </div>
        );
      
      case 'suspend_supplier':
        return (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Premium Feature</span>
              </div>
              <p className="text-xs text-yellow-800 mt-1">
                Supplier suspension requires a premium subscription
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Duration (days)</Label>
                <Input
                  type="number"
                  value={action.configuration?.suspend_supplier?.duration || 0}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      suspend_supplier: {
                        duration: parseInt(e.target.value) || 0,
                        reason: action.configuration?.suspend_supplier?.reason || '',
                        notifySupplier: action.configuration?.suspend_supplier?.notifySupplier || false,
                        autoReactivate: action.configuration?.suspend_supplier?.autoReactivate || false
                      }
                    }
                  })}
                  placeholder="30"
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Input
                  value={action.configuration?.suspend_supplier?.reason || ''}
                  onChange={(e) => updateAction(index, {
                    configuration: {
                      ...action.configuration,
                      suspend_supplier: {
                        duration: action.configuration?.suspend_supplier?.duration || 0,
                        reason: e.target.value,
                        notifySupplier: action.configuration?.suspend_supplier?.notifySupplier || false,
                        autoReactivate: action.configuration?.suspend_supplier?.autoReactivate || false
                      }
                    }
                  })}
                  placeholder="Repeated late payments"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Rule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Escalation Workflow
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
                  New Rule
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Configure automated escalation actions for overdue invoices
          </p>
        </CardHeader>
        
        {isAdding && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ruleName">Rule Name</Label>
                <Input
                  id="ruleName"
                  value={newRule.name || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Standard 7-day escalation"
                />
              </div>
              <div>
                <Label htmlFor="rulePriority">Priority</Label>
                <select
                  id="rulePriority"
                  value={newRule.priority || 'medium'}
                  onChange={(e) => setNewRule(prev => ({ ...prev, priority: e.target.value as ReminderPriority }))}
                  className="w-full p-2 border rounded-md"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.name} - {priority.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="ruleDescription">Description</Label>
              <Input
                id="ruleDescription"
                value={newRule.description || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe when this escalation rule should be triggered"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="triggerAfter">Trigger After</Label>
                <Input
                  id="triggerAfter"
                  type="number"
                  min="1"
                  max="365"
                  value={newRule.triggerAfter || 7}
                  onChange={(e) => setNewRule(prev => ({ ...prev, triggerAfter: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="triggerType">Trigger Type</Label>
                <select
                  id="triggerType"
                  value={newRule.triggerType || 'days'}
                  onChange={(e) => setNewRule(prev => ({ ...prev, triggerType: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  {triggerTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Escalation Actions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Escalation Actions</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAction}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </div>
              
              <div className="space-y-4">
                {newRule.actions?.map((action, index) => (
                  <div key={action.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getActionIcon(action.type)}
                        <span className="font-medium">{getActionName(action.type)}</span>
                        <Badge variant="outline" className="text-xs">
                          Action {index + 1}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={action.delay || 0}
                          onChange={(e) => updateAction(index, { delay: parseInt(e.target.value) || 0 })}
                          placeholder="Delay (min)"
                          className="w-20"
                        />
                        <span className="text-xs text-gray-500">min delay</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(index)}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label>Action Type</Label>
                        <select
                          value={action.type}
                          onChange={(e) => updateAction(index, { type: e.target.value as EscalationActionType })}
                          className="w-full p-2 border rounded-md"
                        >
                          {actionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.name} {type.isPremium && '(Premium)'}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {renderActionConfiguration(action, index)}
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={action.isEnabled || false}
                          onChange={(e) => updateAction(index, { isEnabled: e.target.checked })}
                          className="rounded"
                        />
                        <Label>Enable this action</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={newRule.isActive || false}
                onChange={(e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isActive">Activate this escalation rule</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRule}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Existing Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Active Escalation Rules ({escalationRules.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {escalationRules.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Escalation Rules
              </h3>
              <p className="text-gray-600">
                Create your first escalation rule to get started
              </p>
            </div>
          ) : (
            escalationRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rule.name}</span>
                      <Badge className={`text-xs ${getPriorityColor(rule.priority)}`}>
                        {getPriorityName(rule.priority)}
                      </Badge>
                      {rule.isActive ? (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        After {rule.triggerAfter} {rule.triggerType}
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                      </div>
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

export default EscalationWorkflow;
