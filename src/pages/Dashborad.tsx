import { useState, useEffect } from "react";
import { Header, AlertBanner, StatsGrid, InvoiceList, Sidebar, UploadInvoiceModal, EmailSetupModal, ExportDataModal, ReminderSettingsModal } from "@/components";
import type { Invoice } from "@/types/invoice";
import type { EmailSetupState } from "@/types/email";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showAlert, setShowAlert] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEmailSetupOpen, setIsEmailSetupOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isReminderSettingsOpen, setIsReminderSettingsOpen] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setShowAlert((prev) => !prev);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const invoices: Invoice[] = [
    {
      id: 1,
      supplier: "Office Supplies Ltd",
      invoiceNumber: "INV-2025-001",
      date: "2025-09-01",
      amount: 1250.5,
      vat: 250.1,
      dueDate: "2025-09-30",
      status: "processing",
      extractedAt: "2 minutes ago",
      source: "Email (PDF)",
    },
    {
      id: 2,
      supplier: "Tech Solutions GmbH",
      invoiceNumber: "TS-5847",
      date: "2025-08-28",
      amount: 3200.0,
      vat: 640.0,
      dueDate: "2025-09-27",
      status: "stored",
      extractedAt: "1 hour ago",
      source: "Email (PDF)",
    },
    {
      id: 3,
      supplier: "Marketing Agency Pro",
      invoiceNumber: "MAP-2025-078",
      date: "2025-08-25",
      amount: 2800.75,
      vat: 560.15,
      dueDate: "2025-09-24",
      status: "overdue",
      extractedAt: "2 days ago",
      source: "Direct Upload",
    },
    {
      id: 4,
      supplier: "Cloud Services Inc",
      invoiceNumber: "CS-M-202509",
      date: "2025-09-01",
      amount: 89.99,
      vat: 18.0,
      dueDate: "2025-10-01",
      status: "reminder_sent",
      extractedAt: "yesterday",
      source: "Email (PDF)",
    },
  ];

  // Calculate statistics

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === "overdue" || inv.status === "reminder_sent")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const processedCount = invoices.filter(
    (inv) => inv.status === "stored"
  ).length;
  const overdueCount = invoices.filter(
    (inv) => inv.status === "overdue"
  ).length;

  // Event handlers
  const handleStorageConfigure = () => {
    console.log("Configure storage");
  };

  const handleUploadInvoice = () => {
    setIsUploadModalOpen(true);
  };

  const handleSetupEmailRules = () => {
    setIsEmailSetupOpen(true);
  };

  const handleExportData = () => {
    setIsExportModalOpen(true);
  };

  const handleReminderSettings = () => {
    setIsReminderSettingsOpen(true);
  };

  const handleInvoiceSaved = (newInvoice: Invoice) => {
    // In a real app, this would update the invoices state
    console.log("New invoice saved:", newInvoice);
    // You could add the new invoice to the invoices array here
  };

  const handleEmailSetupSaved = (setup: EmailSetupState) => {
    // In a real app, this would save the email configuration
    console.log("Email setup saved:", setup);
  };

  const handleExportDataSaved = (exportData: any) => {
    // In a real app, this would handle the export data
    console.log("Export data saved:", exportData);
  };

  const handleReminderSettingsSaved = (settings: any) => {
    // In a real app, this would save the reminder settings
    console.log("Reminder settings saved:", settings);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header isMonitoringActive={true} />
      
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <AlertBanner 
              show={showAlert}
              message="Extracting data from Office Supplies Ltd invoice..."
            />

            <StatsGrid
              totalInvoices={invoices.length}
              totalAmount={totalAmount}
              processedCount={processedCount}
              overdueCount={overdueCount}
              overdueAmount={overdueAmount}
            />

            <InvoiceList
              invoices={invoices}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Sidebar */}
          <Sidebar
            accuracyRate={95}
            isStorageConnected={true}
            lastSync="2 min ago"
            onStorageConfigure={handleStorageConfigure}
            onUploadInvoice={handleUploadInvoice}
            onSetupEmailRules={handleSetupEmailRules}
            onExportData={handleExportData}
            onReminderSettings={handleReminderSettings}
          />
        </div>
      </div>

      {/* Upload Invoice Modal */}
      <UploadInvoiceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onInvoiceSaved={handleInvoiceSaved}
      />

      {/* Email Setup Modal */}
      <EmailSetupModal
        isOpen={isEmailSetupOpen}
        onClose={() => setIsEmailSetupOpen(false)}
        onSave={handleEmailSetupSaved}
      />

      {/* Export Data Modal */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportDataSaved}
      />

      {/* Reminder Settings Modal */}
      <ReminderSettingsModal
        isOpen={isReminderSettingsOpen}
        onClose={() => setIsReminderSettingsOpen(false)}
        onSave={handleReminderSettingsSaved}
      />
    </div>
  );
};

export default Dashboard;
