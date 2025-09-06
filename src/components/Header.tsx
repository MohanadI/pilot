import React from "react";
import { Receipt, Wifi } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  isMonitoringActive?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isMonitoringActive = true }) => {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">Invoice Pilot</span>
        </div>
        
        <div className="flex items-center gap-3">
          {isMonitoringActive && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-help">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email Monitoring Active</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
