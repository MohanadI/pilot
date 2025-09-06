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
  Play,
  Pause,
  Calendar,
  Mail,
  Settings,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import type { ScheduledExport, ExportFrequency } from "@/types/export";

interface ScheduledExportsProps {
  scheduledExports: ScheduledExport[];
  onAddScheduledExport: (export_: Omit<ScheduledExport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateScheduledExport: (exportId: string, updates: Partial<ScheduledExport>) => void;
  onRemoveScheduledExport: (exportId: string) => void;
  onToggleScheduledExport: (exportId: string) => void;
}

const ScheduledExports: React.FC<ScheduledExportsProps> = ({
  scheduledExports,
  onAddScheduledExport,
  onUpdateScheduledExport,
  onRemoveScheduledExport,
  onToggleScheduledExport
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingExport, setEditingExport] = useState<string | null>(null);
  const [newExport, setNewExport] = useState<Partial<ScheduledExport>>({
    name: '',
    description: '',
    format: 'csv',
    filters: [],
    schedule: {
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '09:00',
      timezone: 'UTC'
    },
    recipients: [],
    isActive: true
  });

  const frequencies: { value: ExportFrequency; name: string; description: string }[] = [
    { value: 'daily', name: 'Daily', description: 'Every day' },
    { value: 'weekly', name: 'Weekly', description: 'Every week' },
    { value: 'monthly', name: 'Monthly', description: 'Every month' },
    { value: 'quarterly', name: 'Quarterly', description: 'Every quarter' },
    { value: 'yearly', name: 'Yearly', description: 'Every year' }
  ];

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const handleAddScheduledExport = () => {
    if (newExport.name && newExport.format && newExport.schedule) {
      onAddScheduledExport({
        name: newExport.name,
        description: newExport.description || '',
        format: newExport.format,
        filters: newExport.filters || [],
        template: newExport.template,
        schedule: newExport.schedule,
        recipients: newExport.recipients || [],
        isActive: newExport.isActive || true
      });
      setNewExport({
        name: '',
        description: '',
        format: 'csv',
        filters: [],
        schedule: {
          frequency: 'monthly',
          dayOfMonth: 1,
          time: '09:00',
          timezone: 'UTC'
        },
        recipients: [],
        isActive: true
      });
      setIsAdding(false);
    }
  };

  const handleUpdateScheduledExport = (exportId: string, updates: Partial<ScheduledExport>) => {
    onUpdateScheduledExport(exportId, updates);
    setEditingExport(null);
  };

  const addRecipient = () => {
    setNewExport(prev => ({
      ...prev,
      recipients: [...(prev.recipients || []), '']
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setNewExport(prev => ({
      ...prev,
      recipients: prev.recipients?.map((email, i) => 
        i === index ? value : email
      ) || []
    }));
  };

  const removeRecipient = (index: number) => {
    setNewExport(prev => ({
      ...prev,
      recipients: prev.recipients?.filter((_, i) => i !== index) || []
    }));
  };

  const getFrequencyName = (frequency: ExportFrequency) => {
    const freq = frequencies.find(f => f.value === frequency);
    return freq?.name || frequency;
  };

  const getNextRunText = (export_: ScheduledExport) => {
    if (export_.nextRun) {
      return new Date(export_.nextRun).toLocaleString();
    }
    return 'Not scheduled';
  };

  const getLastRunText = (export_: ScheduledExport) => {
    if (export_.lastRun) {
      return new Date(export_.lastRun).toLocaleString();
    }
    return 'Never run';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      {/* Add New Scheduled Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Exports
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
                  New Schedule
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Set up automatic exports to run on a schedule
          </p>
        </CardHeader>
        
        {isAdding && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exportName">Export Name</Label>
                <Input
                  id="exportName"
                  value={newExport.name || ''}
                  onChange={(e) => setNewExport(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Invoice Report"
                />
              </div>
              <div>
                <Label htmlFor="exportFormat">Format</Label>
                <select
                  id="exportFormat"
                  value={newExport.format || 'csv'}
                  onChange={(e) => setNewExport(prev => ({ ...prev, format: e.target.value }))}
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
              <Label htmlFor="exportDescription">Description</Label>
              <Input
                id="exportDescription"
                value={newExport.description || ''}
                onChange={(e) => setNewExport(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this scheduled export"
              />
            </div>

            {/* Schedule Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium">Schedule Configuration</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <select
                    id="frequency"
                    value={newExport.schedule?.frequency || 'monthly'}
                    onChange={(e) => setNewExport(prev => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule!,
                        frequency: e.target.value as ExportFrequency
                      }
                    }))}
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
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newExport.schedule?.time || '09:00'}
                    onChange={(e) => setNewExport(prev => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule!,
                        time: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>

              {newExport.schedule?.frequency === 'weekly' && (
                <div>
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <select
                    id="dayOfWeek"
                    value={newExport.schedule?.dayOfWeek || 0}
                    onChange={(e) => setNewExport(prev => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule!,
                        dayOfWeek: parseInt(e.target.value)
                      }
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {newExport.schedule?.frequency === 'monthly' && (
                <div>
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={newExport.schedule?.dayOfMonth || 1}
                    onChange={(e) => setNewExport(prev => ({
                      ...prev,
                      schedule: {
                        ...prev.schedule!,
                        dayOfMonth: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={newExport.schedule?.timezone || 'UTC'}
                  onChange={(e) => setNewExport(prev => ({
                    ...prev,
                    schedule: {
                      ...prev.schedule!,
                      timezone: e.target.value
                    }
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Recipients</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Email
                </Button>
              </div>
              
              <div className="space-y-2">
                {newExport.recipients?.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={email}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder="email@company.com"
                      type="email"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecipient(index)}
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
                checked={newExport.isActive || false}
                onChange={(e) => setNewExport(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isActive">Activate this schedule</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddScheduledExport}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Existing Scheduled Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Active Schedules ({scheduledExports.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scheduledExports.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Scheduled Exports
              </h3>
              <p className="text-gray-600">
                Create your first scheduled export to automate your reports
              </p>
            </div>
          ) : (
            scheduledExports.map((export_) => (
              <div
                key={export_.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{export_.name}</span>
                      <Badge className={`text-xs ${getStatusColor(export_.isActive)}`}>
                        {getStatusIcon(export_.isActive)}
                        {getStatusText(export_.isActive)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {export_.format.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{export_.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {getFrequencyName(export_.schedule.frequency)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {export_.recipients.length} recipient{export_.recipients.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        {export_.schedule.time} {export_.schedule.timezone}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span>Last run: {getLastRunText(export_)}</span>
                      <span className="ml-4">Next run: {getNextRunText(export_)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleScheduledExport(export_.id)}
                  >
                    {export_.isActive ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingExport(export_.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveScheduledExport(export_.id)}
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

export default ScheduledExports;

