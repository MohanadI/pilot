import ProcessingStatus from "./ProcessingStatus";
import StorageStatus from "./StorageStatus";
import QuickActions from "./QuickActions";

interface SidebarProps {
  accuracyRate?: number;
  isStorageConnected?: boolean;
  lastSync?: string;
  onStorageConfigure?: () => void;
  onUploadInvoice?: () => void;
  onSetupEmailRules?: () => void;
  onExportData?: () => void;
  onReminderSettings?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  accuracyRate = 95,
  isStorageConnected = true,
  lastSync = "2 min ago",
  onStorageConfigure,
  onUploadInvoice,
  onSetupEmailRules,
  onExportData,
  onReminderSettings,
}) => {
  return (
    <div className="space-y-6">
      <ProcessingStatus accuracyRate={accuracyRate} />
      <StorageStatus 
        isConnected={isStorageConnected}
        lastSync={lastSync}
        onConfigure={onStorageConfigure}
      />
      <QuickActions
        onUploadInvoice={onUploadInvoice}
        onSetupEmailRules={onSetupEmailRules}
        onExportData={onExportData}
        onReminderSettings={onReminderSettings}
      />
    </div>
  );
};

export default Sidebar;
