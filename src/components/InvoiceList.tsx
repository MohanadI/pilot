import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt } from "lucide-react";
import type { Invoice } from "@/types/invoice";
import InvoiceItem from "./InvoiceItem";

interface InvoiceListProps {
  invoices: Invoice[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  activeTab,
  onTabChange,
}) => {
  const filteredInvoices = invoices.filter((invoice) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return invoice.status === "processing";
    if (activeTab === "processed") return invoice.status === "stored";
    if (activeTab === "overdue")
      return invoice.status === "overdue" || invoice.status === "reminder_sent";
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
          <Tabs
            value={activeTab}
            onValueChange={onTabChange}
            className="w-auto"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Processing</TabsTrigger>
              <TabsTrigger value="processed">Stored</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice, index) => (
              <InvoiceItem
                key={invoice.id}
                invoice={invoice}
                isLast={index === filteredInvoices.length - 1}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No invoices found
              </h3>
              <p className="text-muted-foreground">
                Invoices will appear here when detected in your email
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceList;
