
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Eye, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  equipmentId: string;
  equipmentName: string;
  equipmentData?: any;
}

export function QRCodeGenerator({ equipmentId, equipmentName, equipmentData }: QRCodeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();

  const generateQRCode = async () => {
    console.log('Gerando QR Code para equipamento:', equipmentId);
    
    // URL que será codificada no QR Code
    const equipmentUrl = `${window.location.origin}/equipment/${equipmentId}`;
    
    // Simular geração do QR Code (em produção, usaria uma biblioteca como qrcode)
    // Por ora, vamos usar um placeholder
    const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(equipmentUrl)}`;
    
    setQrCodeUrl(qrCodeDataUrl);
    
    toast({
      title: "QR Code Gerado",
      description: "QR Code do equipamento foi gerado com sucesso!",
    });
  };

  const handleDownloadQRCode = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode_${equipmentName.replace(/\s+/g, '_')}_${equipmentId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Concluído",
        description: "QR Code foi baixado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no Download",
        description: "Não foi possível baixar o QR Code.",
        variant: "destructive",
      });
    }
  };

  const handleViewEquipment = () => {
    window.open(`/equipment/${equipmentId}`, '_blank');
  };

  React.useEffect(() => {
    if (isOpen && !qrCodeUrl) {
      generateQRCode();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="mr-2 h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code - {equipmentName}
          </DialogTitle>
          <DialogDescription>
            Use este QR Code para acesso rápido às informações do equipamento em campo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {qrCodeUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt={`QR Code para ${equipmentName}`}
                  className="w-48 h-48"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Escaneie este código para acessar rapidamente os dados do equipamento
                </p>
                <Badge variant="outline" className="text-xs">
                  ID: {equipmentId}
                </Badge>
              </div>
              
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleViewEquipment}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleDownloadQRCode}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
              </div>
              
              <div className="bg-muted p-3 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                  <Smartphone className="h-4 w-4" />
                  <span>Como usar</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Imprima ou exiba este QR Code no equipamento. 
                  Qualquer pessoa com acesso ao sistema poderá escaneá-lo 
                  para ver status, localização e histórico.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <QrCode className="h-12 w-12 mx-auto mb-2 text-muted-foreground animate-pulse" />
                <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
