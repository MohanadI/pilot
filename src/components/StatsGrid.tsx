import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, CheckCircle, AlertTriangle, Clock } from "lucide-react";

interface StatsGridProps {
  totalInvoices: number;
  totalAmount: number;
  processedCount: number;
  overdueCount: number;
  overdueAmount: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  totalInvoices,
  totalAmount,
  processedCount,
  overdueCount,
  overdueAmount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            INVOICES THIS MONTH
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {totalInvoices}
          </div>
          <p className="text-xs text-muted-foreground">
            €{totalAmount.toLocaleString()} total
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            AUTO-PROCESSED
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {processedCount}
          </div>
          <p className="text-xs text-muted-foreground">
            95% accuracy rate
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            OVERDUE INVOICES
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            {overdueCount}
          </div>
          <p className="text-xs text-muted-foreground">
            €{overdueAmount.toLocaleString()} amount
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            TIME SAVED
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">2.5h</div>
          <p className="text-xs text-muted-foreground">This week</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsGrid;
