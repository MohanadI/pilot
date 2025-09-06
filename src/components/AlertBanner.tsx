import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap } from "lucide-react";

interface AlertBannerProps {
  show: boolean;
  message: string;
  onClose?: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ 
  show, 
  message, 
  onClose
}) => {
  if (!show) return null;

  return (
    <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <Zap className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>New Invoice Detected</strong> - {message}
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Dismiss
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default AlertBanner;
