import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  Edit3, 
  Save, 
  X,
  Building,
  FileText,
  Calendar,
  Euro,
  Percent,
  Clock
} from "lucide-react";
import type { ExtractedField } from "@/types/upload";

interface FieldReviewProps {
  fields: ExtractedField[];
  onFieldUpdate: (fieldId: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const FieldReview: React.FC<FieldReviewProps> = ({
  fields,
  onFieldUpdate,
  onSave,
  onCancel,
  isSaving = false
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const fieldIcons: Record<string, React.ReactNode> = {
    supplier: <Building className="h-4 w-4" />,
    invoiceNumber: <FileText className="h-4 w-4" />,
    date: <Calendar className="h-4 w-4" />,
    amount: <Euro className="h-4 w-4" />,
    vat: <Percent className="h-4 w-4" />,
    dueDate: <Clock className="h-4 w-4" />
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return "High";
    if (confidence >= 0.7) return "Medium";
    return "Low";
  };

  const handleEdit = (field: ExtractedField) => {
    setEditingField(field.id);
    setEditValues(prev => ({
      ...prev,
      [field.id]: field.value
    }));
  };

  const handleSaveEdit = (fieldId: string) => {
    const newValue = editValues[fieldId];
    if (newValue !== undefined) {
      onFieldUpdate(fieldId, newValue);
    }
    setEditingField(null);
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[fieldId];
      return newValues;
    });
  };

  const handleCancelEdit = (fieldId: string) => {
    setEditingField(null);
    setEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[fieldId];
      return newValues;
    });
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const requiredFields = fields.filter(f => f.isRequired);
  const optionalFields = fields.filter(f => !f.isRequired);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Review Extracted Data
        </CardTitle>
        <p className="text-sm text-gray-600">
          Please review and confirm the extracted invoice data. Click on any field to edit if needed.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Fields */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            Required Fields
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  {fieldIcons[field.id] || <FileText className="h-4 w-4" />}
                  {field.label}
                  <Badge 
                    className={`text-xs ${getConfidenceColor(field.confidence)}`}
                  >
                    {getConfidenceText(field.confidence)} ({Math.round(field.confidence * 100)}%)
                  </Badge>
                </Label>
                
                {editingField === field.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editValues[field.id] || field.value}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(field.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelEdit(field.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                      field.confidence < 0.7 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                    }`}
                    onClick={() => field.isEditable && handleEdit(field)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{field.value}</span>
                      {field.isEditable && (
                        <Edit3 className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    {field.suggestions && field.suggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                          {field.suggestions.map((suggestion, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange(field.id, suggestion);
                                handleSaveEdit(field.id);
                              }}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optional Fields */}
        {optionalFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              Optional Fields
              <Badge variant="secondary" className="text-xs">Optional</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optionalFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {fieldIcons[field.id] || <FileText className="h-4 w-4" />}
                    {field.label}
                    <Badge 
                      className={`text-xs ${getConfidenceColor(field.confidence)}`}
                    >
                      {getConfidenceText(field.confidence)} ({Math.round(field.confidence * 100)}%)
                    </Badge>
                  </Label>
                  
                  {editingField === field.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editValues[field.id] || field.value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(field.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelEdit(field.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                        field.confidence < 0.7 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                      }`}
                      onClick={() => field.isEditable && handleEdit(field)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{field.value}</span>
                        {field.isEditable && (
                          <Edit3 className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Invoice
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldReview;
