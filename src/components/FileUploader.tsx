import { useCallback, useState } from "react";
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UploadedFile, SupportedFileType } from "@/types/upload";

interface FileUploaderProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
}

const SUPPORTED_TYPES: SupportedFileType[] = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSizeInMB = 10
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_TYPES.includes(file.type as SupportedFileType)) {
      return `File type ${file.type} is not supported. Please upload PDF, JPG, or PNG files.`;
    }
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeInMB}MB.`;
    }
    return null;
  };

  const createUploadedFile = (file: File): UploadedFile => ({
    id: Math.random().toString(36).substr(2, 9),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'uploading',
    progress: 0,
    preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
  });

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: UploadedFile[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(createUploadedFile(file));
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles].slice(0, maxFiles);
      setUploadedFiles(newFiles);
      
      // Simulate upload progress
      newFiles.forEach(file => {
        if (file.status === 'uploading') {
          simulateUpload(file);
        }
      });
      
      onFilesSelected(newFiles);
    }
  }, [uploadedFiles, maxFiles, maxSizeInMB, onFilesSelected]);

  const simulateUpload = (file: UploadedFile) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(f => {
        if (f.id === file.id) {
          const newProgress = Math.min(f.progress + Math.random() * 30, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...f, progress: 100, status: 'completed' as const };
          }
          return { ...f, progress: newProgress };
        }
        return f;
      }));
    }, 200);
  };

  const removeFile = (fileId: string) => {
    const newFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500 dark:text-red-400" />;
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500 dark:text-blue-400" />;
    return <FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Upload Invoice Files
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
            Drag and drop your invoice files here, or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            Supports PDF, JPG, PNG files up to {maxSizeInMB}MB each
          </p>
          <Button onClick={() => document.getElementById('file-input')?.click()}>
            Choose Files
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center gap-3">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  getFileIcon(file.type)
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-1 h-1" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {file.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
