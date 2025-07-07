
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileSpreadsheet, LoaderIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  type: 'relatorio' | 'rdo' | 'atividade' | 'obra';
  data?: any;
  className?: string;
}

export function ExportButton({ type, data, className }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: 'pdf',
    obra: 'all',
    periodo: '30',
    incluirFotos: true,
    incluirGraficos: true,
    dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0]
  });
  
  const { toast } = useToast();

  const obras = [
    { id: 'all', nome: 'Todas as obras' },
    { id: '1', nome: 'Shopping Center Norte' },
    { id: '2', nome: 'Residencial Jardins' },
    { id: '3', nome: 'Torre Empresarial' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    console.log('Exportando:', { type, config: exportConfig, data });
    
    try {
      // Simular processamento de exportação
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simular download do arquivo
      const fileName = `${type}_${exportConfig.format}_${new Date().toISOString().split('T')[0]}.${exportConfig.format === 'pdf' ? 'pdf' : 'xlsx'}`;
      
      toast({
        title: "Exportação Concluída",
        description: `Arquivo ${fileName} foi gerado com sucesso!`,
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'relatorio': return 'Exportar Relatório';
      case 'rdo': return 'Exportar RDO';
      case 'atividade': return 'Exportar Atividades';
      case 'obra': return 'Exportar Dados da Obra';
      default: return 'Exportar';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Configure as opções de exportação e escolha o formato desejado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Formato</Label>
              <Select value={exportConfig.format} onValueChange={(value) => setExportConfig({...exportConfig, format: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Obra</Label>
              <Select value={exportConfig.obra} onValueChange={(value) => setExportConfig({...exportConfig, obra: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Inicial</Label>
              <Input 
                type="date" 
                value={exportConfig.dateFrom}
                onChange={(e) => setExportConfig({...exportConfig, dateFrom: e.target.value})}
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input 
                type="date" 
                value={exportConfig.dateTo}
                onChange={(e) => setExportConfig({...exportConfig, dateTo: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="incluirFotos" 
                checked={exportConfig.incluirFotos}
                onCheckedChange={(checked) => setExportConfig({...exportConfig, incluirFotos: checked as boolean})}
              />
              <Label htmlFor="incluirFotos">Incluir fotos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="incluirGraficos" 
                checked={exportConfig.incluirGraficos}
                onCheckedChange={(checked) => setExportConfig({...exportConfig, incluirGraficos: checked as boolean})}
              />
              <Label htmlFor="incluirGraficos">Incluir gráficos</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
