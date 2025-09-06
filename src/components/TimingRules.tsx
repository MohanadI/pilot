import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  Repeat,
  Target
} from "lucide-react";
import type { TimingRule, ReminderCondition, ReminderPriority } from "@/types/reminder";

interface TimingRulesProps {
  timingRules: TimingRule[];
  onAddRule: (rule: Omit<TimingRule, 'id'>) => void;
  onUpdateRule: (ruleId: string, updates: Partial<TimingRule>) => void;
  onRemoveRule: (ruleId: string) => void;
}

const TimingRules: React.FC<TimingRulesProps> = ({
  timingRules,
  onAddRule,
  onUpdateRule,
  onRemoveRule
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<TimingRule>>({
    name: '',
    description: '',
    daysBeforeDue: 7,
    reminderFrequency: 'daily',
    maxAttempts: 3,
    isActive: true,
    priority: 'medium',
    conditions: []
  });

  const priorities: { value: ReminderPriority; name: string; color: string; description: string }[] = [
    { value: 'low', name: 'Low', color: 'bg-gray-100 text-gray-800', description: 'Non-urgent reminders' },
    { value: 'medium', name: 'Medium', color: 'bg-blue-100 text-blue-800', description: 'Standard reminders' },
    { value: 'high', name: 'High', color: 'bg-orange-100 text-orange-800', description: 'Important reminders' },
    { value: 'urgent', name: 'Urgent', color: 'bg-red-100 text-red-800', description: 'Critical reminders' }
  ];

  const frequencies = [
    { value: 'daily', name: 'Daily', description: 'Send every day' },
    { value: 'weekly', name: 'Weekly', description: 'Send once per week' },
    { value: 'monthly', name: 'Monthly', description: 'Send once per month' }
  ];

  const conditionTypes = [
    { value: 'amount', name: 'Amount', description: 'Based on invoice amount' },
    { value: 'supplier', name: 'Supplier', description: 'Based on supplier' },
    { value: 'status', name: 'Status', description: 'Based on invoice status' },
    { value: 'currency', name: 'Currency', description: 'Based on currency' },
    { value: 'custom', name: 'Custom', description: 'Custom condition' }
  ];

  const operators = [
    { value: 'equals', name: 'Equals', description: 'Exact match' },
    { value: 'greaterThan', name: 'Greater Than', description: 'Value is greater than' },
    { value: 'lessThan', name: 'Less Than', description: 'Value is less than' },
    { value: 'contains', name: 'Contains', description: 'Contains text' },
    { value: 'between', name: 'Between', description: 'Value is between two values' }
  ];

  const handleAddRule = () => {
    if (newRule.name && newRule.description) {
      onAddRule({
        name: newRule.name,
        description: newRule.description,
        daysBeforeDue: newRule.daysBeforeDue || 7,
        reminderFrequency: newRule.reminderFrequency || 'daily',
        maxAttempts: newRule.maxAttempts || 3,
        isActive: newRule.isActive || true,
        priority: newRule.priority || 'medium',
        conditions: newRule.conditions || []
      });
      setNewRule({
        name: '',
        description: '',
        daysBeforeDue: 7,
        reminderFrequency: 'daily',
        maxAttempts: 3,
        isActive: true,
        priority: 'medium',
        conditions: []
      });
      setIsAdding(false);
    }
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<TimingRule>) => {
    onUpdateRule(ruleId, updates);
    setEditingRule(null);
  };

  const addCondition = () => {
    setNewRule(prev => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'amount',
          operator: 'greaterThan',
          value: '',
          description: ''
        }
      ]
    }));
  };

  const updateCondition = (index: number, updates: Partial<ReminderCondition>) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.map((condition, i) => 
        i === index ? { ...condition, ...updates } : condition
      ) || []
    }));
  };

  const removeCondition = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || []
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

  const getFrequencyName = (frequency: string) => {
    const freq = frequencies.find(f => f.value === frequency);
    return freq?.name || frequency;
  };

  return (
    <div className="space-y-6">
      {/* Add New Rule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timing Rules
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
            Configure when and how often reminders are sent
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
                  placeholder="e.g., Standard 7-day reminder"
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
                placeholder="Describe when this rule should be applied"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="daysBeforeDue">Days Before Due</Label>
                <Input
                  id="daysBeforeDue"
                  type="number"
                  min="0"
                  max="365"
                  value={newRule.daysBeforeDue || 7}
                  onChange={(e) => setNewRule(prev => ({ ...prev, daysBeforeDue: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Send first reminder X days before due date
                </p>
              </div>
              
              <div>
                <Label htmlFor="reminderFrequency">Frequency</Label>
                <select
                  id="reminderFrequency"
                  value={newRule.reminderFrequency || 'daily'}
                  onChange={(e) => setNewRule(prev => ({ ...prev, reminderFrequency: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.name} - {freq.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  max="50"
                  value={newRule.maxAttempts || 3}
                  onChange={(e) => setNewRule(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum reminder attempts before escalation
                </p>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Conditions</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
              
              <div className="space-y-2">
                {newRule.conditions?.map((condition, index) => (
                  <div key={condition.id} className="flex items-center gap-2 p-2 border rounded">
                    <select
                      value={condition.type}
                      onChange={(e) => updateCondition(index, { type: e.target.value as any })}
                      className="p-2 border rounded-md"
                    >
                      {conditionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, { operator: e.target.value as any })}
                      className="p-2 border rounded-md"
                    >
                      {operators.map(op => (
                        <option key={op.value} value={op.value}>
                          {op.name}
                        </option>
                      ))}
                    </select>
                    
                    <Input
                      value={condition.value || ''}
                      onChange={(e) => updateCondition(index, { value: e.target.value })}
                      placeholder="Value"
                      className="flex-1"
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(index)}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
              <Label htmlFor="isActive">Activate this rule</Label>
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
          <CardTitle>Active Rules ({timingRules.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {timingRules.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Timing Rules
              </h3>
              <p className="text-gray-600">
                Create your first timing rule to get started
              </p>
            </div>
          ) : (
            timingRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
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
                        <Calendar className="h-3 w-3" />
                        {rule.daysBeforeDue} days before due
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        {getFrequencyName(rule.reminderFrequency)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Max {rule.maxAttempts} attempts
                      </div>
                      {rule.conditions && rule.conditions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Settings className="h-3 w-3" />
                          {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
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

export default TimingRules;
