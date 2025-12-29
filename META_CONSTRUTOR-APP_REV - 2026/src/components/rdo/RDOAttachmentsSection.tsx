import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Paperclip, 
  Upload, 
  Image, 
  FileText, 
  X, 
  Eye,
  Download 
} from "lucide-react";
import { RDOFormData } from "@/schemas/rdoSchema";
import { Attachment, UploadProgress, isValidFileType, formatFileSize } from "@/types/attachment";
import { toast } from "sonner";

interface RDOAttachmentsSectionProps {
  form: UseFormReturn<RDOFormData>;
}

// TODO: Implementar integração com Supabase Storage para upload real
export function RDOAttachmentsSection({ form }: RDOAttachmentsSectionProps) {
  const [imageAttachments, setImageAttachments] = useState<Attachment[]>([]);
  const [documentAttachments, setDocumentAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  // Mock function - substituir pela integração real com Supabase
  const handleFileUpload = async (files: FileList, targetType?: 'image' | 'document') => {
    const validFiles = Array.from(files).filter(file => {
      if (!isValidFileType(file)) {
        toast.error(`Tipo de arquivo não suportado: ${file.name}`);
        return false;
      }
      if (file.size > 20 * 1024 * 1024) { // 20MB
        toast.error(`Arquivo muito grande: ${file.name} (máx. 20MB)`);
        return false;
      }
      
      // Filtrar por tipo se especificado
      if (targetType) {
        const isImage = file.type.startsWith('image/');
        if (targetType === 'image' && !isImage) {
          toast.error(`Apenas imagens são aceitas nesta seção: ${file.name}`);
          return false;
        }
        if (targetType === 'document' && isImage) {
          toast.error(`Apenas documentos são aceitos nesta seção: ${file.name}`);
          return false;
        }
      }
      
      return true;
    });

    // Simular upload
    for (const file of validFiles) {
      const progressId = `upload-${Date.now()}-${Math.random()}`;
      
      // Adicionar à lista de progresso
      setUploadProgress(prev => [...prev, {
        id: progressId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]);

      // Simular progresso de upload
      const simulateUpload = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Finalizar upload
            setUploadProgress(prev => 
              prev.map(p => p.id === progressId 
                ? { ...p, progress: 100, status: 'completed' as const }
                : p
              )
            );

            // Adicionar aos anexos
            const mockAttachment: Attachment = {
              id: `attachment-${Date.now()}`,
              name: file.name,
              type: file.type.startsWith('image/') ? 'image' : 'document',
              mimeType: file.type,
              size: file.size,
              url: URL.createObjectURL(file), // Mock URL
              uploadedAt: new Date().toISOString(),
              uploadedBy: 'mock-user-id'
            };

            // Adicionar à lista correta baseado no tipo
            if (mockAttachment.type === 'image') {
              setImageAttachments(prev => [...prev, mockAttachment]);
            } else {
              setDocumentAttachments(prev => [...prev, mockAttachment]);
            }

            // Remover da lista de progresso após 2s
            setTimeout(() => {
              setUploadProgress(prev => prev.filter(p => p.id !== progressId));
            }, 2000);

            toast.success(`Arquivo enviado: ${file.name}`);
          } else {
            setUploadProgress(prev => 
              prev.map(p => p.id === progressId ? { ...p, progress } : p)
            );
          }
        }, 200);
      };

      simulateUpload();
    }
  };

  const removeAttachment = (attachmentId: string, type: 'image' | 'document') => {
    if (type === 'image') {
      setImageAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } else {
      setDocumentAttachments(prev => prev.filter(a => a.id !== attachmentId));
    }
    toast.success("Anexo removido");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Anexos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção de Imagens */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Image className="h-5 w-5 text-blue-500" />
            Imagens
          </h3>
          
          {/* Área de Upload para Imagens */}
          <div
            className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors bg-blue-50/50"
            onDragOver={handleDragOver}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                handleFileUpload(files, 'image');
              }
            }}
          >
            <Image className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <p className="text-sm text-muted-foreground mb-3">
              Arraste imagens aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Suportados: JPEG, PNG, GIF, WebP (máx. 20MB)
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.jpg,.jpeg,.png,.gif,.webp';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files, 'image');
                };
                input.click();
              }}
            >
              <Image className="h-4 w-4 mr-2" />
              Selecionar Imagens
            </Button>
          </div>

          {/* Lista de Imagens */}
          {imageAttachments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Imagens Anexadas ({imageAttachments.length})</h4>
              {imageAttachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50/30">
                  <div className="flex-shrink-0">
                    <Image className="h-8 w-8 text-blue-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      Imagem
                    </Badge>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeAttachment(attachment.id, 'image')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seção de Documentos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            Documentos
          </h3>
          
          {/* Área de Upload para Documentos */}
          <div
            className="border-2 border-dashed border-green-200 rounded-lg p-6 text-center hover:border-green-300 transition-colors bg-green-50/50"
            onDragOver={handleDragOver}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                handleFileUpload(files, 'document');
              }
            }}
          >
            <FileText className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <p className="text-sm text-muted-foreground mb-3">
              Arraste documentos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Suportados: PDF, DOC, DOCX, XLS, XLSX, TXT (máx. 20MB)
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files, 'document');
                };
                input.click();
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Selecionar Documentos
            </Button>
          </div>

          {/* Lista de Documentos */}
          {documentAttachments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Documentos Anexados ({documentAttachments.length})</h4>
              {documentAttachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-3 p-3 border border-green-200 rounded-lg bg-green-50/30">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      Documento
                    </Badge>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeAttachment(attachment.id, 'document')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progresso de Upload */}
        {uploadProgress.map((upload) => (
          <div key={upload.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium truncate">{upload.fileName}</span>
              <span className="text-xs text-muted-foreground">{upload.progress}%</span>
            </div>
            <Progress value={upload.progress} className="h-2" />
          </div>
        ))}

        {/* TODO: Implementar após integração com Supabase */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
          💡 <strong>Próximos passos:</strong> Integração com Supabase Storage para upload real de arquivos
        </div>
      </CardContent>
    </Card>
  );
}