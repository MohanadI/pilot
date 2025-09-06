import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail,
  Slack,
  Smartphone,
  Monitor,
  Webhook,
  CheckCircle,
  X,
  Settings,
  Users,
  Crown,
  AlertCircle
} from "lucide-react";
import type { CommunicationChannel, ChannelType, ChannelConfiguration, ReminderPriority } from "@/types/reminder";

interface CommunicationChannelsProps {
  channels: CommunicationChannel[];
  onAddChannel: (channel: Omit<CommunicationChannel, 'id'>) => void;
  onUpdateChannel: (channelId: string, updates: Partial<CommunicationChannel>) => void;
  onRemoveChannel: (channelId: string) => void;
  onTestChannel: (channelId: string) => void;
}

const CommunicationChannels: React.FC<CommunicationChannelsProps> = ({
  channels,
  onAddChannel,
  onUpdateChannel,
  onRemoveChannel,
  onTestChannel
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingChannel, setEditingChannel] = useState<string | null>(null);
  const [newChannel, setNewChannel] = useState<Partial<CommunicationChannel>>({
    type: 'email',
    name: '',
    description: '',
    isEnabled: true,
    isPremium: false,
    configuration: {},
    recipients: [],
    priority: 'medium'
  });

  const channelTypes: { type: ChannelType; name: string; icon: React.ReactNode; description: string; isPremium: boolean }[] = [
    { type: 'email', name: 'Email', icon: <Mail className="h-4 w-4" />, description: 'Send via email', isPremium: false },
    { type: 'slack', name: 'Slack', icon: <Slack className="h-4 w-4" />, description: 'Post to Slack channels', isPremium: false },
    { type: 'sms', name: 'SMS', icon: <Smartphone className="h-4 w-4" />, description: 'Send SMS notifications', isPremium: true },
    { type: 'dashboard', name: 'Dashboard', icon: <Monitor className="h-4 w-4" />, description: 'Show in dashboard', isPremium: false },
    { type: 'webhook', name: 'Webhook', icon: <Webhook className="h-4 w-4" />, description: 'Send to custom webhook', isPremium: false }
  ];

  const priorities: { value: ReminderPriority; name: string; color: string; description: string }[] = [
    { value: 'low', name: 'Low', color: 'bg-gray-100 text-gray-800', description: 'Non-urgent notifications' },
    { value: 'medium', name: 'Medium', color: 'bg-blue-100 text-blue-800', description: 'Standard notifications' },
    { value: 'high', name: 'High', color: 'bg-orange-100 text-orange-800', description: 'Important notifications' },
    { value: 'urgent', name: 'Urgent', color: 'bg-red-100 text-red-800', description: 'Critical notifications' }
  ];

  const handleAddChannel = () => {
    if (newChannel.type && newChannel.name && newChannel.description) {
      onAddChannel({
        type: newChannel.type,
        name: newChannel.name,
        description: newChannel.description,
        isEnabled: newChannel.isEnabled || true,
        isPremium: newChannel.isPremium || false,
        configuration: newChannel.configuration || {},
        recipients: newChannel.recipients || [],
        priority: newChannel.priority || 'medium'
      });
      setNewChannel({
        type: 'email',
        name: '',
        description: '',
        isEnabled: true,
        isPremium: false,
        configuration: {},
        recipients: [],
        priority: 'medium'
      });
      setIsAdding(false);
    }
  };

  const handleUpdateChannel = (channelId: string, updates: Partial<CommunicationChannel>) => {
    onUpdateChannel(channelId, updates);
    setEditingChannel(null);
  };

  const addRecipient = () => {
    setNewChannel(prev => ({
      ...prev,
      recipients: [...(prev.recipients || []), '']
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setNewChannel(prev => ({
      ...prev,
      recipients: prev.recipients?.map((recipient, i) => 
        i === index ? value : recipient
      ) || []
    }));
  };

  const removeRecipient = (index: number) => {
    setNewChannel(prev => ({
      ...prev,
      recipients: prev.recipients?.filter((_, i) => i !== index) || []
    }));
  };

  const getChannelIcon = (type: ChannelType) => {
    const channelType = channelTypes.find(ct => ct.type === type);
    return channelType?.icon || <MessageSquare className="h-4 w-4" />;
  };

  const getChannelName = (type: ChannelType) => {
    const channelType = channelTypes.find(ct => ct.type === type);
    return channelType?.name || type;
  };

  const getPriorityColor = (priority: ReminderPriority) => {
    const priorityInfo = priorities.find(p => p.value === priority);
    return priorityInfo?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityName = (priority: ReminderPriority) => {
    const priorityInfo = priorities.find(p => p.value === priority);
    return priorityInfo?.name || priority;
  };

  const renderChannelConfiguration = (type: ChannelType) => {
    switch (type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpServer">SMTP Server</Label>
                <Input
                  id="smtpServer"
                  value={newChannel.configuration?.email?.smtpServer || ''}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      email: {
                        ...prev.configuration?.email,
                        smtpServer: e.target.value
                      }
                    }
                  }))}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtpPort">Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={newChannel.configuration?.email?.port || 587}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      email: {
                        ...prev.configuration?.email,
                        port: parseInt(e.target.value) || 587
                      }
                    }
                  }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpUsername">Username</Label>
                <Input
                  id="smtpUsername"
                  value={newChannel.configuration?.email?.username || ''}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      email: {
                        ...prev.configuration?.email,
                        username: e.target.value
                      }
                    }
                  }))}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="fromAddress">From Address</Label>
                <Input
                  id="fromAddress"
                  value={newChannel.configuration?.email?.fromAddress || ''}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      email: {
                        ...prev.configuration?.email,
                        fromAddress: e.target.value
                      }
                    }
                  }))}
                  placeholder="noreply@company.com"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useTLS"
                checked={newChannel.configuration?.email?.useTLS || false}
                onChange={(e) => setNewChannel(prev => ({
                  ...prev,
                  configuration: {
                    ...prev.configuration,
                    email: {
                      ...prev.configuration?.email,
                      useTLS: e.target.checked
                    }
                  }
                }))}
                className="rounded"
              />
              <Label htmlFor="useTLS">Use TLS encryption</Label>
            </div>
          </div>
        );
      
      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={newChannel.configuration?.slack?.webhookUrl || ''}
                onChange={(e) => setNewChannel(prev => ({
                  ...prev,
                  configuration: {
                    ...prev.configuration,
                    slack: {
                      ...prev.configuration?.slack,
                      webhookUrl: e.target.value
                    }
                  }
                }))}
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slackChannel">Channel</Label>
                <Input
                  id="slackChannel"
                  value={newChannel.configuration?.slack?.channel || ''}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      slack: {
                        ...prev.configuration?.slack,
                        channel: e.target.value
                      }
                    }
                  }))}
                  placeholder="#finance"
                />
              </div>
              <div>
                <Label htmlFor="slackUsername">Username</Label>
                <Input
                  id="slackUsername"
                  value={newChannel.configuration?.slack?.username || ''}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      slack: {
                        ...prev.configuration?.slack,
                        username: e.target.value
                      }
                    }
                  }))}
                  placeholder="Invoice Bot"
                />
              </div>
            </div>
          </div>
        );
      
      case 'sms':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Premium Feature</span>
              </div>
              <p className="text-xs text-yellow-800 mt-1">
                SMS notifications require a premium subscription
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smsProvider">Provider</Label>
                <select
                  id="smsProvider"
                  value={newChannel.configuration?.sms?.provider || 'twilio'}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      sms: {
                        ...prev.configuration?.sms,
                        provider: e.target.value as any
                      }
                    }
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="twilio">Twilio</option>
                  <option value="aws-sns">AWS SNS</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <Label htmlFor="smsApiKey">API Key</Label>
                <Input
                  id="smsApiKey"
                  type="password"
                  value={newChannel.configuration?.sms?.apiKey || ''}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      sms: {
                        ...prev.configuration?.sms,
                        apiKey: e.target.value
                      }
                    }
                  }))}
                  placeholder="Your API key"
                />
              </div>
            </div>
          </div>
        );
      
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={newChannel.configuration?.webhook?.url || ''}
                onChange={(e) => setNewChannel(prev => ({
                  ...prev,
                  configuration: {
                    ...prev.configuration,
                    webhook: {
                      ...prev.configuration?.webhook,
                      url: e.target.value
                    }
                  }
                }))}
                placeholder="https://your-api.com/webhook"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="webhookMethod">Method</Label>
                <select
                  id="webhookMethod"
                  value={newChannel.configuration?.webhook?.method || 'POST'}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      webhook: {
                        ...prev.configuration?.webhook,
                        method: e.target.value as any
                      }
                    }
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              <div>
                <Label htmlFor="webhookAuth">Authentication</Label>
                <select
                  id="webhookAuth"
                  value={newChannel.configuration?.webhook?.authentication?.type || 'bearer'}
                  onChange={(e) => setNewChannel(prev => ({
                    ...prev,
                    configuration: {
                      ...prev.configuration,
                      webhook: {
                        ...prev.configuration?.webhook,
                        authentication: {
                          ...prev.configuration?.webhook?.authentication,
                          type: e.target.value as any
                        }
                      }
                    }
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="api-key">API Key</option>
                </select>
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
      {/* Add New Channel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communication Channels
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
                  New Channel
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Configure how reminders are delivered to recipients
          </p>
        </CardHeader>
        
        {isAdding && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="channelType">Channel Type</Label>
                <select
                  id="channelType"
                  value={newChannel.type || 'email'}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, type: e.target.value as ChannelType }))}
                  className="w-full p-2 border rounded-md"
                >
                  {channelTypes.map(type => (
                    <option key={type.type} value={type.type}>
                      {type.name} {type.isPremium && '(Premium)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="channelPriority">Priority</Label>
                <select
                  id="channelPriority"
                  value={newChannel.priority || 'medium'}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, priority: e.target.value as ReminderPriority }))}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="channelName">Channel Name</Label>
                <Input
                  id="channelName"
                  value={newChannel.name || ''}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Accounting Team Email"
                />
              </div>
              <div>
                <Label htmlFor="channelDescription">Description</Label>
                <Input
                  id="channelDescription"
                  value={newChannel.description || ''}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this channel's purpose"
                />
              </div>
            </div>

            {/* Channel Configuration */}
            {newChannel.type && (
              <div>
                <Label>Configuration</Label>
                {renderChannelConfiguration(newChannel.type)}
              </div>
            )}

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
                  Add Recipient
                </Button>
              </div>
              
              <div className="space-y-2">
                {newChannel.recipients?.map((recipient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder={
                        newChannel.type === 'email' ? 'email@company.com' :
                        newChannel.type === 'slack' ? '@username or #channel' :
                        newChannel.type === 'sms' ? '+1234567890' :
                        'recipient'
                      }
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
                id="isEnabled"
                checked={newChannel.isEnabled || false}
                onChange={(e) => setNewChannel(prev => ({ ...prev, isEnabled: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isEnabled">Enable this channel</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddChannel}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Channel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Existing Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Active Channels ({channels.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {channels.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Communication Channels
              </h3>
              <p className="text-gray-600">
                Create your first communication channel to get started
              </p>
            </div>
          ) : (
            channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{channel.name}</span>
                      <Badge className={`text-xs ${getPriorityColor(channel.priority)}`}>
                        {getPriorityName(channel.priority)}
                      </Badge>
                      {channel.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {channel.isEnabled ? (
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
                    <p className="text-sm text-gray-600">{channel.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {channel.recipients.length} recipient{channel.recipients.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        {getChannelName(channel.type)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTestChannel(channel.id)}
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingChannel(channel.id)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveChannel(channel.id)}
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

export default CommunicationChannels;
