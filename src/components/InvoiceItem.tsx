import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Eye, Zap, Database, AlertTriangle, Bell, Clock } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types/invoice";

interface InvoiceItemProps {
  invoice: Invoice;
  isLast?: boolean;
}

const InvoiceItem: React.FC<InvoiceItemProps> = ({ invoice, isLast = false }) => {
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "stored":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "reminder_sent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case "processing":
        return "Extracting";
      case "stored":
        return "Stored";
      case "overdue":
        return "Overdue";
      case "reminder_sent":
        return "Reminded";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case "processing":
        return <Zap className="h-3 w-3" />;
      case "stored":
        return <Database className="h-3 w-3" />;
      case "overdue":
        return <AlertTriangle className="h-3 w-3" />;
      case "reminder_sent":
        return <Bell className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div
      className={`p-4 hover:bg-slate-50 transition-colors ${
        !isLast ? "border-b" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-semibold text-slate-900">
                {invoice.supplier}
              </div>
              <div className="text-sm text-muted-foreground">
                {invoice.invoiceNumber} • {invoice.source} •{" "}
                {invoice.extractedAt}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Date:</span>
              <div className="font-medium">
                {new Date(invoice.date).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <div className="font-medium">
                €{invoice.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">VAT:</span>
              <div className="font-medium">
                €{invoice.vat.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Due:</span>
              <div className="font-medium">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <Badge
            className={`${getStatusColor(
              invoice.status
            )} flex items-center gap-1`}
          >
            {getStatusIcon(invoice.status)}
            {getStatusText(invoice.status)}
          </Badge>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItem;
