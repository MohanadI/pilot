export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  isEditable: boolean;
  isRequired: boolean;
  suggestions?: string[];
}

export interface ExtractionResult {
  id: string;
  fileId: string;
  status: 'extracting' | 'review' | 'completed' | 'error';
  progress: number;
  fields: ExtractedField[];
  rawData?: any;
  error?: string;
}

export interface UploadModalState {
  isOpen: boolean;
  files: UploadedFile[];
  currentExtraction?: ExtractionResult;
  step: 'upload' | 'processing' | 'review' | 'completed';
}

export type SupportedFileType = 'application/pdf' | 'image/jpeg' | 'image/jpg' | 'image/png';
export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'reviewing' | 'saving' | 'completed' | 'error';
