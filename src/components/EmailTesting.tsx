import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Euro,
  Calendar,
  Building,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import type { EmailTestResult } from "@/types/email";

interface EmailTestingProps {
  testResults: EmailTestResult[];
  onSendTestEmail: (testEmail: string) => void;
  onRefreshResults: () => void;
}

const EmailTesting: React.FC<EmailTestingProps> = ({
  testResults,
  onSendTestEmail,
  onRefreshResults
}) => {
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async () => {
    if (testEmail.trim()) {
      setIsSending(true);
      await onSendTestEmail(testEmail.trim());
      setTestEmail('');
      setIsSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'error': return 'Error';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'processing': return <Clock className="h-3 w-3 animate-spin" />;
      case 'error': return <AlertCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Send Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Test Email Processing
          </CardTitle>
          <p className="text-sm text-gray-600">
            Send a test email to verify your email rules are working correctly
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testEmail">Test Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                type="email"
                className="flex-1"
              />
              <Button
                onClick={handleSendTest}
                disabled={!testEmail.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Send a test email to this address with an invoice attachment to verify:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Email monitoring is working</li>
              <li>Supplier rules are applied correctly</li>
              <li>Folder rules are functioning</li>
              <li>AI extraction is processing properly</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Test Results ({testResults.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshResults}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {testResults.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Test Results
              </h3>
              <p className="text-gray-600">
                Send a test email to see the processing results here
              </p>
            </div>
          ) : (
            testResults.map((result) => (
              <div
                key={result.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.testEmail}</span>
                        <Badge className={`text-xs ${getStatusColor(result.processingStatus)}`}>
                          {getStatusIcon(result.processingStatus)}
                          {getStatusText(result.processingStatus)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        From: {result.sender} • {new Date(result.receivedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">{result.subject}</p>
                    <Badge className={`text-xs ${getConfidenceColor(result.confidence)}`}>
                      {getConfidenceText(result.confidence)} ({Math.round(result.confidence * 100)}%)
                    </Badge>
                  </div>
                </div>

                {/* Extracted Data */}
                {result.extractedData && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Extracted Data</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Supplier</p>
                          <p className="text-sm font-medium">{result.extractedData.supplier}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Invoice #</p>
                          <p className="text-sm font-medium">{result.extractedData.invoiceNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-sm font-medium">€{result.extractedData.amount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-medium">{result.extractedData.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {result.errors && result.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-red-900 mb-2">Processing Errors</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Processing Status */}
                {result.processingStatus === 'processing' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-800">Processing email and extracting data...</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTesting;
