import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Download, 
  FileText, 
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import type { ExportPreview as ExportPreviewType, ExportFormat } from "@/types/export";

interface ExportPreviewProps {
  preview: ExportPreviewType;
  format: ExportFormat;
  onRefresh: () => void;
  onDownload: () => void;
  isRefreshing?: boolean;
  isDownloading?: boolean;
}

const ExportPreview: React.FC<ExportPreviewProps> = ({
  preview,
  format,
  onRefresh,
  onDownload,
  isRefreshing = false,
  isDownloading = false
}) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  const getFormatIcon = (format: ExportFormat) => {
    switch (format.extension) {
      case 'csv': return <FileText className="h-5 w-5 text-green-600" />;
      case 'xlsx': return <FileText className="h-5 w-5 text-green-600" />;
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />;
      case 'json': return <FileText className="h-5 w-5 text-blue-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getSampleDataRows = () => {
    if (showFullPreview) {
      return preview.sampleData;
    }
    return preview.sampleData.slice(0, 5);
  };

  const getColumnWidth = (column: string) => {
    const maxLength = Math.max(
      column.length,
      ...preview.sampleData.map(row => String(row[column] || '').length)
    );
    return Math.min(maxLength * 8, 150);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Export Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              className="min-w-[120px]"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Now
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Export Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            {getFormatIcon(format)}
            <div>
              <p className="text-sm font-medium text-blue-900">{format.name}</p>
              <p className="text-xs text-blue-700">{format.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Database className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                {preview.filteredRecords.toLocaleString()}
              </p>
              <p className="text-xs text-green-700">
                of {preview.totalRecords.toLocaleString()} records
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <FileText className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                {formatFileSize(preview.estimatedSize)}
              </p>
              <p className="text-xs text-yellow-700">Estimated size</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Clock className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                {formatTime(preview.estimatedTime)}
              </p>
              <p className="text-xs text-purple-700">Estimated time</p>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Data Preview</h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {preview.columns.length} columns
              </Badge>
              {preview.sampleData.length > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFullPreview(!showFullPreview)}
                >
                  {showFullPreview ? 'Show Less' : 'Show All'}
                </Button>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {preview.columns.map((column) => (
                      <th
                        key={column}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ minWidth: getColumnWidth(column) }}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSampleDataRows().map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {preview.columns.map((column) => (
                        <td
                          key={column}
                          className="px-3 py-2 text-sm text-gray-900"
                          style={{ minWidth: getColumnWidth(column) }}
                        >
                          <div className="truncate" style={{ maxWidth: getColumnWidth(column) }}>
                            {row[column] !== undefined ? String(row[column]) : '-'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {preview.sampleData.length > 5 && !showFullPreview && (
            <div className="text-center py-2 text-sm text-gray-500">
              Showing 5 of {preview.sampleData.length} sample records
            </div>
          )}
        </div>

        {/* Export Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Export Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Format:</p>
              <p className="font-medium">{format.name} ({format.extension.toUpperCase()})</p>
            </div>
            <div>
              <p className="text-gray-600">MIME Type:</p>
              <p className="font-medium">{format.mimeType}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Records:</p>
              <p className="font-medium">{preview.totalRecords.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Filtered Records:</p>
              <p className="font-medium">{preview.filteredRecords.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Columns:</p>
              <p className="font-medium">{preview.columns.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Estimated Size:</p>
              <p className="font-medium">{formatFileSize(preview.estimatedSize)}</p>
            </div>
          </div>
        </div>

        {/* Warnings and Notes */}
        {preview.filteredRecords < preview.totalRecords && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Filters Applied</h4>
            </div>
            <p className="text-sm text-yellow-800 mt-1">
              Your export will include {preview.filteredRecords.toLocaleString()} records out of {preview.totalRecords.toLocaleString()} total records due to applied filters.
            </p>
          </div>
        )}

        {preview.filteredRecords === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-900">No Data to Export</h4>
            </div>
            <p className="text-sm text-red-800 mt-1">
              No records match your current filters. Please adjust your filters or remove them to export data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportPreview;

