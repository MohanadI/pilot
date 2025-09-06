import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Mail, Download, Bell } from "lucide-react";

interface QuickActionsProps {
  onUploadInvoice?: () => void;
  onSetupEmailRules?: () => void;
  onExportData?: () => void;
  onReminderSettings?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onUploadInvoice,
  onSetupEmailRules,
  onExportData,
  onReminderSettings,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3"
          onClick={onUploadInvoice}
        >
          <Upload className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
          <span>Upload Invoice</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3"
          onClick={onSetupEmailRules}
        >
          <Mail className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
          <span>Setup Email Rules</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3"
          onClick={onExportData}
        >
          <Download className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
          <span>Export Data</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3"
          onClick={onReminderSettings}
        >
          <Bell className="h-4 w-4 mr-3 text-blue-600 dark:text-blue-400" />
          <span>Reminder Settings</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
