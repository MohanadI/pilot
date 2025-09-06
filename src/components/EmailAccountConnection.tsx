import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Plus,
  Trash2,
  Settings,
  RefreshCw
} from "lucide-react";
import type { EmailAccount, EmailProvider } from "@/types/email";

interface EmailAccountConnectionProps {
  accounts: EmailAccount[];
  onAddAccount: (provider: EmailProvider) => void;
  onRemoveAccount: (accountId: string) => void;
  onRefreshAccount: (accountId: string) => void;
  onUpdateAccount: (accountId: string, updates: Partial<EmailAccount>) => void;
}

const EmailAccountConnection: React.FC<EmailAccountConnectionProps> = ({
  accounts,
  onAddAccount,
  onRemoveAccount,
  onRefreshAccount,
  onUpdateAccount
}) => {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnect = async (provider: EmailProvider) => {
    setIsConnecting(provider);
    
    // Simulate OAuth connection
    setTimeout(() => {
      const newAccount: EmailAccount = {
        id: Math.random().toString(36).substr(2, 9),
        provider,
        email: `user@${provider === 'gmail' ? 'gmail.com' : provider === 'outlook' ? 'outlook.com' : 'company.com'}`,
        displayName: `User Account (${provider})`,
        isConnected: true,
        isActive: true,
        lastSync: new Date().toISOString(),
        connectionStatus: 'connected'
      };
      
      onAddAccount(provider);
      setIsConnecting(null);
    }, 2000);
  };

  const getProviderIcon = (provider: EmailProvider) => {
    switch (provider) {
      case 'gmail':
        return <Mail className="h-5 w-5 text-red-500" />;
      case 'outlook':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'exchange':
        return <Mail className="h-5 w-5 text-green-500" />;
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProviderName = (provider: EmailProvider) => {
    switch (provider) {
      case 'gmail': return 'Gmail';
      case 'outlook': return 'Outlook';
      case 'exchange': return 'Exchange';
      default: return provider;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'connecting': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Error';
      case 'connecting': return 'Connecting...';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-3 w-3" />;
      case 'disconnected': return <AlertCircle className="h-3 w-3" />;
      case 'error': return <AlertCircle className="h-3 w-3" />;
      case 'connecting': return <Loader2 className="h-3 w-3 animate-spin" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const providers: { provider: EmailProvider; name: string; description: string }[] = [
    {
      provider: 'gmail',
      name: 'Gmail',
      description: 'Connect your Gmail account for invoice monitoring'
    },
    {
      provider: 'outlook',
      name: 'Outlook',
      description: 'Connect your Outlook account for invoice monitoring'
    },
    {
      provider: 'exchange',
      name: 'Exchange',
      description: 'Connect your Exchange server for invoice monitoring'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Add New Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Connect Email Accounts
          </CardTitle>
          <p className="text-sm text-gray-600">
            Connect your email accounts to start monitoring for invoices
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map(({ provider, name, description }) => (
              <Card key={provider} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  {getProviderIcon(provider)}
                  <div>
                    <h3 className="font-medium">{name}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleConnect(provider)}
                  disabled={isConnecting === provider}
                  className="w-full"
                  variant="outline"
                >
                  {isConnecting === provider ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect {name}
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getProviderIcon(account.provider)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.displayName}</span>
                      <Badge
                        className={`text-xs ${getStatusColor(account.connectionStatus)}`}
                      >
                        {getStatusIcon(account.connectionStatus)}
                        {getStatusText(account.connectionStatus)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{account.email}</p>
                    {account.lastSync && (
                      <p className="text-xs text-gray-500">
                        Last sync: {new Date(account.lastSync).toLocaleString()}
                      </p>
                    )}
                    {account.error && (
                      <p className="text-xs text-red-600">{account.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRefreshAccount(account.id)}
                    disabled={account.connectionStatus === 'connecting'}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateAccount(account.id, { isActive: !account.isActive })}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveAccount(account.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Accounts State */}
      {accounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Email Accounts Connected
            </h3>
            <p className="text-gray-600 mb-4">
              Connect your email accounts to start monitoring for invoices
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailAccountConnection;
