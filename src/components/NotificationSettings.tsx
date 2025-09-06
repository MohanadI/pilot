import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Mail, 
  Clock, 
  Users, 
  Settings,
  Plus,
  Trash2,
  Save,
  X
} from "lucide-react";
import type { NotificationSettings as NotificationSettingsType } from "@/types/email";

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onUpdateSettings: (updates: Partial<NotificationSettingsType>) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setIsEditing(false);
  };

  const addRecipient = (type: 'primary' | 'secondary' | 'managers') => {
    setLocalSettings(prev => ({
      ...prev,
      alertRecipients: {
        ...prev.alertRecipients,
        [type]: [...prev.alertRecipients[type], '']
      }
    }));
  };

  const updateRecipient = (type: 'primary' | 'secondary' | 'managers', index: number, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      alertRecipients: {
        ...prev.alertRecipients,
        [type]: prev.alertRecipients[type].map((email, i) => 
          i === index ? value : email
        )
      }
    }));
  };

  const removeRecipient = (type: 'primary' | 'secondary' | 'managers', index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      alertRecipients: {
        ...prev.alertRecipients,
        [type]: prev.alertRecipients[type].filter((_, i) => i !== index)
      }
    }));
  };

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

  return (
    <div className="space-y-6">
      {/* Alert Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert Types
            </CardTitle>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Settings
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Configure what types of alerts you want to receive
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="newInvoiceAlerts"
                checked={isEditing ? localSettings.newInvoiceAlerts : settings.newInvoiceAlerts}
                onChange={(e) => isEditing ? 
                  setLocalSettings(prev => ({ ...prev, newInvoiceAlerts: e.target.checked })) :
                  onUpdateSettings({ newInvoiceAlerts: e.target.checked })
                }
                disabled={!isEditing}
                className="rounded"
              />
              <Label htmlFor="newInvoiceAlerts">New Invoice Alerts</Label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="processingErrors"
                checked={isEditing ? localSettings.processingErrors : settings.processingErrors}
                onChange={(e) => isEditing ? 
                  setLocalSettings(prev => ({ ...prev, processingErrors: e.target.checked })) :
                  onUpdateSettings({ processingErrors: e.target.checked })
                }
                disabled={!isEditing}
                className="rounded"
              />
              <Label htmlFor="processingErrors">Processing Errors</Label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="dailyDigest"
                checked={isEditing ? localSettings.dailyDigest : settings.dailyDigest}
                onChange={(e) => isEditing ? 
                  setLocalSettings(prev => ({ ...prev, dailyDigest: e.target.checked })) :
                  onUpdateSettings({ dailyDigest: e.target.checked })
                }
                disabled={!isEditing}
                className="rounded"
              />
              <Label htmlFor="dailyDigest">Daily Digest</Label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="weeklyReport"
                checked={isEditing ? localSettings.weeklyReport : settings.weeklyReport}
                onChange={(e) => isEditing ? 
                  setLocalSettings(prev => ({ ...prev, weeklyReport: e.target.checked })) :
                  onUpdateSettings({ weeklyReport: e.target.checked })
                }
                disabled={!isEditing}
                className="rounded"
              />
              <Label htmlFor="weeklyReport">Weekly Report</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={isEditing ? localSettings.notificationMethods.email : settings.notificationMethods.email}
                onChange={(e) => isEditing ? 
                  setLocalSettings(prev => ({ 
                    ...prev, 
                    notificationMethods: { ...prev.notificationMethods, email: e.target.checked }
                  })) :
                  onUpdateSettings({ 
                    notificationMethods: { ...settings.notificationMethods, email: e.target.checked }
                  })
                }
                disabled={!isEditing}
                className="rounded"
              />
              <Label htmlFor="emailNotifications">Email</Label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="inAppNotifications"
                checked={isEditing ? localSettings.notificationMethods.inApp : settings.notificationMethods.inApp}
                onChange={(e) => isEditing ? 
                  setLocalSettings(prev => ({ 
                    ...prev, 
                    notificationMethods: { ...prev.notificationMethods, inApp: e.target.checked }
                  })) :
                  onUpdateSettings({ 
                    notificationMethods: { ...settings.notificationMethods, inApp: e.target.checked }
                  })
                }
                disabled={!isEditing}
                className="rounded"
              />
              <Label htmlFor="inAppNotifications">In-App</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Alert Recipients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Recipients */}
          <div>
            <Label className="text-sm font-medium">Primary Recipients</Label>
            <div className="space-y-2 mt-2">
              {(isEditing ? localSettings.alertRecipients.primary : settings.alertRecipients.primary).map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={email}
                    onChange={(e) => updateRecipient('primary', index, e.target.value)}
                    placeholder="email@company.com"
                    type="email"
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecipient('primary', index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRecipient('primary')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Primary Recipient
                </Button>
              )}
            </div>
          </div>

          {/* Secondary Recipients */}
          <div>
            <Label className="text-sm font-medium">Secondary Recipients</Label>
            <div className="space-y-2 mt-2">
              {(isEditing ? localSettings.alertRecipients.secondary : settings.alertRecipients.secondary).map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={email}
                    onChange={(e) => updateRecipient('secondary', index, e.target.value)}
                    placeholder="email@company.com"
                    type="email"
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecipient('secondary', index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRecipient('secondary')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Secondary Recipient
                </Button>
              )}
            </div>
          </div>

          {/* Manager Recipients */}
          <div>
            <Label className="text-sm font-medium">Manager Recipients</Label>
            <div className="space-y-2 mt-2">
              {(isEditing ? localSettings.alertRecipients.managers : settings.alertRecipients.managers).map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={email}
                    onChange={(e) => updateRecipient('managers', index, e.target.value)}
                    placeholder="manager@company.com"
                    type="email"
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRecipient('managers', index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRecipient('managers')}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manager Recipient
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="quietHoursEnabled"
              checked={isEditing ? localSettings.quietHours.enabled : settings.quietHours.enabled}
              onChange={(e) => isEditing ? 
                setLocalSettings(prev => ({ 
                  ...prev, 
                  quietHours: { ...prev.quietHours, enabled: e.target.checked }
                })) :
                onUpdateSettings({ 
                  quietHours: { ...settings.quietHours, enabled: e.target.checked }
                })
              }
              disabled={!isEditing}
              className="rounded"
            />
            <Label htmlFor="quietHoursEnabled">Enable quiet hours</Label>
          </div>
          
          {((isEditing ? localSettings.quietHours.enabled : settings.quietHours.enabled)) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quietStart">Start Time</Label>
                <Input
                  id="quietStart"
                  type="time"
                  value={isEditing ? localSettings.quietHours.start : settings.quietHours.start}
                  onChange={(e) => isEditing ? 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      quietHours: { ...prev.quietHours, start: e.target.value }
                    })) :
                    onUpdateSettings({ 
                      quietHours: { ...settings.quietHours, start: e.target.value }
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="quietEnd">End Time</Label>
                <Input
                  id="quietEnd"
                  type="time"
                  value={isEditing ? localSettings.quietHours.end : settings.quietHours.end}
                  onChange={(e) => isEditing ? 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      quietHours: { ...prev.quietHours, end: e.target.value }
                    })) :
                    onUpdateSettings({ 
                      quietHours: { ...settings.quietHours, end: e.target.value }
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={isEditing ? localSettings.quietHours.timezone : settings.quietHours.timezone}
                  onChange={(e) => isEditing ? 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      quietHours: { ...prev.quietHours, timezone: e.target.value }
                    })) :
                    onUpdateSettings({ 
                      quietHours: { ...settings.quietHours, timezone: e.target.value }
                    })
                  }
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
