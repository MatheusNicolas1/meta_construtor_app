// Tipos para anexos e uploads no RDO
export type AttachmentType = 'image' | 'document';

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  mimeType: string;
  size: number; // em bytes
  url: string;
  thumbnailUrl?: string; // para imagens
  uploadedAt: string;
  uploadedBy: string;
  rdoId?: number; // se anexado a um RDO específico
}

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

// Configurações de upload
export const uploadConfig = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
};

export const isValidFileType = (file: File): boolean => {
  const allowedTypes = [
    ...uploadConfig.allowedImageTypes,
    ...uploadConfig.allowedDocumentTypes,
  ];
  return allowedTypes.includes(file.type);
};

export const getAttachmentType = (mimeType: string): AttachmentType => {
  if (uploadConfig.allowedImageTypes.includes(mimeType)) {
    return 'image';
  }
  return 'document';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};