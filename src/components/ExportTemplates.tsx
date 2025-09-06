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
  X
} from "lucide-react";
import type { ExportTemplate, CustomField, FieldType } from "@/types/export";

interface ExportTemplatesProps {
  templates: ExportTemplate[];
  onAddTemplate: (template: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<ExportTemplate>) => void;
  onRemoveTemplate: (templateId: string) => void;
  onDuplicateTemplate: (templateId: string) => void;
}

const ExportTemplates: React.FC<ExportTemplatesProps> = ({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onRemoveTemplate,
  onDuplicateTemplate
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<ExportTemplate>>({
    name: '',
    description: '',
    format: 'csv',
    fields: [],
    customFields: [],
    isDefault: false,
    isActive: true
  });

  const availableFields = [
    'id', 'supplier', 'invoiceNumber', 'date', 'amount', 'vat', 'dueDate',
    'status', 'source', 'extractedAt', 'createdAt', 'updatedAt'
  ];

  const fieldTypes: { type: FieldType; name: string; description: string }[] = [
    { type: 'text', name: 'Text', description: 'Plain text field' },
    { type: 'number', name: 'Number', description: 'Numeric field' },
    { type: 'date', name: 'Date', description: 'Date field' },
    { type: 'currency', name: 'Currency', description: 'Currency field' },
    { type: 'boolean', name: 'Boolean', description: 'True/False field' }
  ];

  const handleAddTemplate = () => {
    if (newTemplate.name && newTemplate.format) {
      onAddTemplate({
        name: newTemplate.name,
        description: newTemplate.description || '',
        format: newTemplate.format,
        fields: newTemplate.fields || [],
        customFields: newTemplate.customFields || [],
        isDefault: newTemplate.isDefault || false,
        isActive: newTemplate.isActive || true
      });
      setNewTemplate({
        name: '',
        description: '',
        format: 'csv',
        fields: [],
        customFields: [],
        isDefault: false,
        isActive: true
      });
      setIsAdding(false);
    }
  };

  const handleUpdateTemplate = (templateId: string, updates: Partial<ExportTemplate>) => {
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

  const addCustomField = () => {
    setNewTemplate(prev => ({
      ...prev,
      customFields: [
        ...(prev.customFields || []),
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          type: 'text',
          isRequired: false
        }
      ]
    }));
  };

  const updateCustomField = (index: number, updates: Partial<CustomField>) => {
    setNewTemplate(prev => ({
      ...prev,
      customFields: prev.customFields?.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      ) || []
    }));
  };

  const removeCustomField = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      customFields: prev.customFields?.filter((_, i) => i !== index) || []
    }));
  };

  const toggleField = (field: string) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields?.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...(prev.fields || []), field]
    }));
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <FileText className="h-4 w-4 text-green-600" />;
      case 'excel': return <FileText className="h-4 w-4 text-green-600" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'json': return <FileText className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFormatName = (format: string) => {
    switch (format) {
      case 'csv': return 'CSV';
      case 'excel': return 'Excel';
      case 'pdf': return 'PDF';
      case 'json': return 'JSON';
      default: return format.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Template */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Templates
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
            Create custom export templates for different accounting systems
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
                  placeholder="e.g., QuickBooks Import"
                />
              </div>
              <div>
                <Label htmlFor="templateFormat">Format</Label>
                <select
                  id="templateFormat"
                  value={newTemplate.format || 'csv'}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                </select>
              </div>
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

            {/* Standard Fields */}
            <div>
              <Label>Standard Fields</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {availableFields.map(field => (
                  <div key={field} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`field-${field}`}
                      checked={newTemplate.fields?.includes(field) || false}
                      onChange={() => toggleField(field)}
                      className="rounded"
                    />
                    <Label htmlFor={`field-${field}`} className="text-sm">
                      {field}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Fields */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Custom Fields</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
              
              <div className="space-y-2">
                {newTemplate.customFields?.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 p-2 border rounded">
                    <Input
                      value={field.name}
                      onChange={(e) => updateCustomField(index, { name: e.target.value })}
                      placeholder="Field name"
                      className="flex-1"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateCustomField(index, { type: e.target.value as FieldType })}
                      className="p-2 border rounded-md"
                    >
                      {fieldTypes.map(type => (
                        <option key={type.type} value={type.type}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={field.formula || ''}
                      onChange={(e) => updateCustomField(index, { formula: e.target.value })}
                      placeholder="Formula (optional)"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomField(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
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
              <Label htmlFor="isDefault">Set as default template</Label>
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
                No Templates
              </h3>
              <p className="text-gray-600">
                Create your first export template to get started
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getFormatIcon(template.format)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{template.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getFormatName(template.format)}
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
                      <span>{template.fields.length} standard fields</span>
                      {template.customFields && template.customFields.length > 0 && (
                        <span>{template.customFields.length} custom fields</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
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
                    onClick={() => handleDuplicateTemplate(template.id)}
                  >
                    <Copy className="h-4 w-4" />
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

export default ExportTemplates;
