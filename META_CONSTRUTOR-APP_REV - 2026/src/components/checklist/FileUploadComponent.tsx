import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChecklistAttachment } from "@/types/checklist";
import { Upload, X, File, Image, FileText, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploadComponentProps {
  attachments: ChecklistAttachment[];
  onAttachmentsChange: (attachments: ChecklistAttachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // em MB
  acceptedTypes?: string[];
  className?: string;
}

export function FileUploadComponent({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx"],
  className
}: FileUploadComponentProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateUpload = (file: File): Promise<ChecklistAttachment> => {
    return new Promise((resolve) => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        setUploadProgress(prev => ({ ...prev, [fileId]: Math.min(progress, 95) }));
        
        if (progress >= 95) {
          clearInterval(interval);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
            
            resolve({
              id: fileId,
              name: file.name,
              url: URL.createObjectURL(file), // Em produção seria a URL real do servidor
              type: file.type,
              size: file.size,
              uploadedAt: new Date().toISOString(),
              uploadedBy: "Usuário Atual" // Em produção viria do contexto de auth
            });
          }, 500);
        }
      }, 100);
    });
  };

  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Verificar limite de arquivos
    if (attachments.length + fileArray.length > maxFiles) {
      toast({
        title: "Limite de arquivos excedido",
        description: `Máximo de ${maxFiles} arquivos permitidos.`,
        variant: "destructive"
      });
      return;
    }

    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      // Verificar tamanho do arquivo
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de ${maxFileSize}MB.`,
          variant: "destructive"
        });
        continue;
      }

      // Verificar tipo de arquivo
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type || file.name.toLowerCase().endsWith(type);
      });

      if (!isValidType) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `${file.name} não é um tipo de arquivo válido.`,
          variant: "destructive"
        });
        continue;
      }

      validFiles.push(file);
    }

    // Upload dos arquivos válidos
    try {
      const uploadPromises = validFiles.map(file => simulateUpload(file));
      const uploadedFiles = await Promise.all(uploadPromises);
      
      onAttachmentsChange([...attachments, ...uploadedFiles]);
      
      toast({
        title: "Arquivos enviados",
        description: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Erro ao enviar os arquivos. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(att => att.id !== id));
    toast({
      title: "Arquivo removido",
      description: "O arquivo foi removido da lista de anexos.",
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-8 text-center">
          <Upload className={cn(
            "h-10 w-10 mx-auto mb-4 transition-colors",
            isDragOver ? "text-primary" : "text-muted-foreground"
          )} />
          <h3 className="text-lg font-medium mb-2">
            Enviar Anexos
          </h3>
          <p className="text-muted-foreground mb-4">
            Arraste e solte arquivos aqui ou clique para selecionar
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Máximo: {maxFiles} arquivos, {maxFileSize}MB cada</p>
            <p>Tipos aceitos: Imagens, PDF, DOC, XLS</p>
          </div>
          <Button variant="outline" size="sm" className="mt-4" type="button">
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivos
          </Button>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Enviando arquivo...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Anexos ({attachments.length})</h4>
            <Badge variant="outline">{attachments.length}/{maxFiles}</Badge>
          </div>
          
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(attachment.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)} • Enviado em {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {attachment.type.startsWith('image/') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = attachment.url;
                        link.download = attachment.name;
                        link.click();
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(attachment.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}