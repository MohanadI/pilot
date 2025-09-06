import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  ArrowLeft,
  ArrowRight,
  Clock,
  MessageSquare,
  AlertTriangle,
  Settings,
  CheckCircle,
  BarChart3
} from "lucide-react";
import TimingRules from "./TimingRules";
import CommunicationChannels from "./CommunicationChannels";
import MessageTemplates from "./MessageTemplates";
import EscalationWorkflow from "./EscalationWorkflow";
import type { 
  ReminderSettings,
  TimingRule,
  CommunicationChannel,
  MessageTemplate,
  EscalationRule,
  GlobalReminderSettings,
  ReminderStats
} from "@/types/reminder";

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: ReminderSettings) => void;
}

const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'timing' | 'channels' | 'templates' | 'escalation' | 'global'>('timing');
  const [timingRules, setTimingRules] = useState<TimingRule[]>([]);
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalReminderSettings>({
    timezone: 'UTC',
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    respectHolidays: true,
    maxDailyReminders: 100,
    batchProcessing: true,
    batchSize: 10,
    retryAttempts: 3,
    retryDelay: 5,
    loggingLevel: 'info'
  });

  const [stats] = useState<ReminderStats>({
    totalReminders: 1247,
    sentToday: 23,
    pendingReminders: 8,
    failedReminders: 2,
    overdueInvoices: 15,
    escalationTriggers: 3,
    averageResponseTime: 2.5,
    successRate: 94.2
  });

  const tabs = [
    { id: 'timing', name: 'Timing Rules', icon: Clock, description: 'Configure reminder timing' },
    { id: 'channels', name: 'Channels', icon: MessageSquare, description: 'Communication channels' },
    { id: 'templates', name: 'Templates', icon: Settings, description: 'Message templates' },
    { id: 'escalation', name: 'Escalation', icon: AlertTriangle, description: 'Escalation workflows' },
    { id: 'global', name: 'Global', icon: BarChart3, description: 'Global settings' }
  ];

  const handleAddTimingRule = (rule: Omit<TimingRule, 'id'>) => {
    const newRule: TimingRule = {
      ...rule,
      id: Math.random().toString(36).substr(2, 9)
    };
    setTimingRules(prev => [...prev, newRule]);
  };

  const handleUpdateTimingRule = (ruleId: string, updates: Partial<TimingRule>) => {
    setTimingRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const handleRemoveTimingRule = (ruleId: string) => {
    setTimingRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleAddChannel = (channel: Omit<CommunicationChannel, 'id'>) => {
    const newChannel: CommunicationChannel = {
      ...channel,
      id: Math.random().toString(36).substr(2, 9)
    };
    setChannels(prev => [...prev, newChannel]);
  };

  const handleUpdateChannel = (channelId: string, updates: Partial<CommunicationChannel>) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, ...updates } : channel
    ));
  };

  const handleRemoveChannel = (channelId: string) => {
    setChannels(prev => prev.filter(channel => channel.id !== channelId));
  };

  const handleTestChannel = (channelId: string) => {
    console.log('Testing channel:', channelId);
    // Simulate channel test
  };

  const handleAddTemplate = (template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: MessageTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleUpdateTemplate = (templateId: string, updates: Partial<MessageTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId ? { ...template, ...updates, updatedAt: new Date().toISOString() } : template
    ));
  };

  const handleRemoveTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      handleAddTemplate({
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false
      });
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    console.log('Previewing template:', templateId);
    // Simulate template preview
  };

  const handleAddEscalationRule = (rule: Omit<EscalationRule, 'id'>) => {
    const newRule: EscalationRule = {
      ...rule,
      id: Math.random().toString(36).substr(2, 9)
    };
    setEscalationRules(prev => [...prev, newRule]);
  };

  const handleUpdateEscalationRule = (ruleId: string, updates: Partial<EscalationRule>) => {
    setEscalationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const handleRemoveEscalationRule = (ruleId: string) => {
    setEscalationRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleSave = () => {
    const settings: ReminderSettings = {
      id: 'reminder-settings-001',
      name: 'Default Reminder Settings',
      description: 'Main reminder configuration',
      timingRules,
      communicationChannels: channels,
      messageTemplates: templates,
      escalationRules,
      globalSettings,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onSave) {
      onSave(settings);
    }
    onClose();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timing':
        return (
          <TimingRules
            timingRules={timingRules}
            onAddRule={handleAddTimingRule}
            onUpdateRule={handleUpdateTimingRule}
            onRemoveRule={handleRemoveTimingRule}
          />
        );
      
      case 'channels':
        return (
          <CommunicationChannels
            channels={channels}
            onAddChannel={handleAddChannel}
            onUpdateChannel={handleUpdateChannel}
            onRemoveChannel={handleRemoveChannel}
            onTestChannel={handleTestChannel}
          />
        );
      
      case 'templates':
        return (
          <MessageTemplates
            templates={templates}
            onAddTemplate={handleAddTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onRemoveTemplate={handleRemoveTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onPreviewTemplate={handlePreviewTemplate}
          />
        );
      
      case 'escalation':
        return (
          <EscalationWorkflow
            escalationRules={escalationRules}
            onAddRule={handleAddEscalationRule}
            onUpdateRule={handleUpdateEscalationRule}
            onRemoveRule={handleRemoveEscalationRule}
          />
        );
      
      case 'global':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Total Reminders</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{stats.totalReminders.toLocaleString()}</p>
                <p className="text-xs text-blue-700">All time</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Success Rate</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{stats.successRate}%</p>
                <p className="text-xs text-green-700">Last 30 days</p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Overdue Invoices</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">{stats.overdueInvoices}</p>
                <p className="text-xs text-orange-700">Currently overdue</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Global Settings</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Timezone</Label>
                    <select
                      value={globalSettings.timezone}
                      onChange={(e) => setGlobalSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label>Working Hours</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={globalSettings.workingHours.start}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, start: e.target.value }
                        }))}
                      />
                      <Input
                        type="time"
                        value={globalSettings.workingHours.end}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          workingHours: { ...prev.workingHours, end: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Max Daily Reminders</Label>
                    <Input
                      type="number"
                      value={globalSettings.maxDailyReminders}
                      onChange={(e) => setGlobalSettings(prev => ({ 
                        ...prev, 
                        maxDailyReminders: parseInt(e.target.value) || 100 
                      }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sent Today</span>
                    <span className="font-medium">{stats.sentToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium">{stats.pendingReminders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Failed</span>
                    <span className="font-medium text-red-600">{stats.failedReminders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-medium">{stats.averageResponseTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Escalation Triggers</span>
                    <span className="font-medium text-orange-600">{stats.escalationTriggers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Reminder Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-5">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{tab.name}</h3>
                  <p className="text-sm text-gray-600">{tab.description}</p>
                </div>
                {renderTabContent()}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => console.log('Test settings')}>
              Test Settings
            </Button>
            <Button onClick={handleSave}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderSettingsModal;
