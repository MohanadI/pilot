import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy,
  CheckCircle,
  X,
  Globe,
  Eye,
  Code,
  MessageSquare
} from "lucide-react";
import type { MessageTemplate, TemplateVariable, TemplateType, VariableType } from "@/types/reminder";

interface MessageTemplatesProps {
  templates: MessageTemplate[];
  onAddTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<MessageTemplate>) => void;
  onRemoveTemplate: (templateId: string) => void;
  onDuplicateTemplate: (templateId: string) => void;
  onPreviewTemplate: (templateId: string) => void;
}

const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onRemoveTemplate,
  onDuplicateTemplate,
  onPreviewTemplate
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<MessageTemplate>>({
    name: '',
    description: '',
    type: 'reminder',
    language: 'en',
    subject: '',
    body: '',
    isDefault: false,
    isActive: true,
    variables: []
  });

  const templateTypes: { value: TemplateType; name: string; description: string; icon: React.ReactNode }[] = [
    { value: 'reminder', name: 'Reminder', description: 'Payment reminder notifications', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'overdue', name: 'Overdue', description: 'Overdue payment notifications', icon: <FileText className="h-4 w-4" /> },
    { value: 'escalation', name: 'Escalation', description: 'Escalation notifications', icon: <FileText className="h-4 w-4" /> },
    { value: 'payment_confirmation', name: 'Payment Confirmation', description: 'Payment received confirmations', icon: <CheckCircle className="h-4 w-4" /> }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'sv', name: 'Swedish' },
    { code: 'da', name: 'Danish' },
    { code: 'no', name: 'Norwegian' }
  ];

  const variableTypes: { value: VariableType; name: string; description: string }[] = [
    { value: 'text', name: 'Text', description: 'Plain text field' },
    { value: 'number', name: 'Number', description: 'Numeric field' },
    { value: 'date', name: 'Date', description: 'Date field' },
    { value: 'currency', name: 'Currency', description: 'Currency field' },
    { value: 'boolean', name: 'Boolean', description: 'True/False field' }
  ];

  const predefinedVariables = [
    { name: '{{supplier_name}}', description: 'Supplier company name', type: 'text' },
    { name: '{{invoice_number}}', description: 'Invoice number', type: 'text' },
    { name: '{{invoice_amount}}', description: 'Invoice amount', type: 'currency' },
    { name: '{{due_date}}', description: 'Due date', type: 'date' },
    { name: '{{days_overdue}}', description: 'Days overdue', type: 'number' },
    { name: '{{company_name}}', description: 'Your company name', type: 'text' },
    { name: '{{payment_link}}', description: 'Payment link', type: 'text' },
    { name: '{{contact_email}}', description: 'Contact email', type: 'text' },
    { name: '{{contact_phone}}', description: 'Contact phone', type: 'text' }
  ];

  const handleAddTemplate = () => {
    if (newTemplate.name && newTemplate.subject && newTemplate.body) {
      onAddTemplate({
        name: newTemplate.name,
        description: newTemplate.description || '',
        type: newTemplate.type || 'reminder',
        language: newTemplate.language || 'en',
        subject: newTemplate.subject,
        body: newTemplate.body,
        isDefault: newTemplate.isDefault || false,
        isActive: newTemplate.isActive || true,
        variables: newTemplate.variables || []
      });
      setNewTemplate({
        name: '',
        description: '',
        type: 'reminder',
        language: 'en',
        subject: '',
        body: '',
        isDefault: false,
        isActive: true,
        variables: []
      });
      setIsAdding(false);
    }
  };

  const handleUpdateTemplate = (templateId: string, updates: Partial<MessageTemplate>) => {
    onUpdateTemplate(templateId, updates);
    setEditingTemplate(null);
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onAddTemplate({
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false
      });
    }
  };

  const addVariable = () => {
    setNewTemplate(prev => ({
      ...prev,
      variables: [
        ...(prev.variables || []),
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          description: '',
          type: 'text',
          isRequired: false,
          example: ''
        }
      ]
    }));
  };

  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    setNewTemplate(prev => ({
      ...prev,
      variables: prev.variables?.map((variable, i) => 
        i === index ? { ...variable, ...updates } : variable
      ) || []
    }));
  };

  const removeVariable = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      variables: prev.variables?.filter((_, i) => i !== index) || []
    }));
  };

  const insertVariable = (variable: string) => {
    setNewTemplate(prev => ({
      ...prev,
      body: (prev.body || '') + variable
    }));
  };

  const getTemplateIcon = (type: TemplateType) => {
    const templateType = templateTypes.find(tt => tt.value === type);
    return templateType?.icon || <FileText className="h-4 w-4" />;
  };

  const getTemplateName = (type: TemplateType) => {
    const templateType = templateTypes.find(tt => tt.value === type);
    return templateType?.name || type;
  };

  const getLanguageName = (code: string) => {
    const language = languages.find(l => l.code === code);
    return language?.name || code;
  };

  return (
    <div className="space-y-6">
      {/* Add New Template */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Message Templates
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
                  New Template
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Create customizable message templates for different notification types
          </p>
        </CardHeader>
        
        {isAdding && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={newTemplate.name || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Standard Payment Reminder"
                />
              </div>
              <div>
                <Label htmlFor="templateType">Template Type</Label>
                <select
                  id="templateType"
                  value={newTemplate.type || 'reminder'}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as TemplateType }))}
                  className="w-full p-2 border rounded-md"
                >
                  {templateTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateLanguage">Language</Label>
                <select
                  id="templateLanguage"
                  value={newTemplate.language || 'en'}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="templateDescription">Description</Label>
                <Input
                  id="templateDescription"
                  value={newTemplate.description || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this template's purpose"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="templateSubject">Subject</Label>
              <Input
                id="templateSubject"
                value={newTemplate.subject || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Payment Reminder - Invoice {{invoice_number}}"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Message Body</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Insert variables:</span>
                  <div className="flex flex-wrap gap-1">
                    {predefinedVariables.slice(0, 3).map((variable) => (
                      <Button
                        key={variable.name}
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable.name)}
                        className="text-xs h-6 px-2"
                      >
                        {variable.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea
                value={newTemplate.body || ''}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Dear {{supplier_name}},

This is a friendly reminder that payment for invoice {{invoice_number}} in the amount of {{invoice_amount}} is due on {{due_date}}.

Please remit payment at your earliest convenience.

Best regards,
{{company_name}}"
                className="w-full h-32 p-3 border rounded-md resize-none"
              />
              <div className="mt-2 text-xs text-gray-500">
                Available variables: {predefinedVariables.map(v => v.name).join(', ')}
              </div>
            </div>

            {/* Custom Variables */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Custom Variables</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVariable}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
              
              <div className="space-y-2">
                {newTemplate.variables?.map((variable, index) => (
                  <div key={variable.id} className="flex items-center gap-2 p-2 border rounded">
                    <Input
                      value={variable.name}
                      onChange={(e) => updateVariable(index, { name: e.target.value })}
                      placeholder="Variable name (e.g., {{custom_field}})"
                      className="flex-1"
                    />
                    <select
                      value={variable.type}
                      onChange={(e) => updateVariable(index, { type: e.target.value as VariableType })}
                      className="p-2 border rounded-md"
                    >
                      {variableTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={variable.example || ''}
                      onChange={(e) => updateVariable(index, { example: e.target.value })}
                      placeholder="Example value"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariable(index)}
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
                id="isDefault"
                checked={newTemplate.isDefault || false}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isDefault">Set as default template for this type</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={newTemplate.isActive || false}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isActive">Activate this template</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTemplate}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Existing Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Message Templates
              </h3>
              <p className="text-gray-600">
                Create your first message template to get started
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getTemplateIcon(template.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{template.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getTemplateName(template.type)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {getLanguageName(template.language)}
                      </Badge>
                      {template.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {!template.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Subject: {template.subject}</span>
                      <span>{template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreviewTemplate(template.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTemplate(template.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTemplate(template.id)}
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

export default MessageTemplates;
