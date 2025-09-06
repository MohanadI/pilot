import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Settings } from "lucide-react";

interface StorageStatusProps {
  isConnected?: boolean;
  lastSync?: string;
  onConfigure?: () => void;
}

const StorageStatus: React.FC<StorageStatusProps> = ({
  isConnected = true,
  lastSync = "2 min ago",
  onConfigure,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Google Sheets
          </span>
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}></div>
            <span className="text-sm font-medium">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Last sync
          </span>
          <span className="text-sm font-medium">{lastSync}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onConfigure}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </CardContent>
    </Card>
  );
};

export default StorageStatus;
