
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
      const fileName = `${type}_${exportConfig.format}_${new Date().toISOString().split('T')[0]}.${exportConfig.format === 'pdf' ? 'pdf' : 'xlsx'}`;
      
      // Gerar conteúdo baseado no tipo e formato
      if (exportConfig.format === 'pdf') {
        await gerarPDF(fileName);
      } else {
        await gerarExcel(fileName);
      }
      
      toast({
        title: "Exportação Concluída",
        description: `Arquivo ${fileName} foi gerado com sucesso!`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const gerarPDF = async (fileName: string) => {
    // Cabeçalho padrão MetaConstrutor
    const cabecalho = `
METACONSTRUTOR - SISTEMA DE GESTÃO DE OBRAS
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
Empresa: MetaConstrutor Ltda
Responsável Técnico: João Silva (CREA: 123456)

==========================================
`;

    let conteudo = cabecalho;

    // Conteúdo específico baseado no tipo
    switch (type) {
      case 'relatorio':
        conteudo += `
RELATÓRIO GERAL DE OBRAS

Período: ${exportConfig.dateFrom} a ${exportConfig.dateTo}
Obras Selecionadas: ${exportConfig.obra === 'all' ? 'Todas' : 'Específica'}

${data ? JSON.stringify(data, null, 2) : 'Dados não disponíveis'}
`;
        break;
      case 'rdo':
        conteudo += `
RELATÓRIO DIÁRIO DE OBRA (RDO)

${data ? `
Obra: ${data.project || 'Não informado'}
Data: ${data.date || new Date().toLocaleDateString('pt-BR')}
Responsável: ${data.responsible || 'Não informado'}
Atividades: ${data.activities || 'Não informado'}
Clima: ${data.weather || 'Não informado'}
` : 'Dados do RDO não disponíveis'}
`;
        break;
      case 'obra':
        conteudo += `
RELATÓRIO DETALHADO DA OBRA

${data ? `
Nome: ${data.nome || 'Não informado'}
Endereço: ${data.endereco || 'Não informado'}
Responsável: ${data.responsavel || 'Não informado'}
Orçamento: ${data.orcamento ? new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(data.orcamento) : 'Não informado'}
Status: ${data.status || 'Não informado'}
Progresso: ${data.progresso || 0}%
` : 'Dados da obra não disponíveis'}
`;
        break;
      default:
        conteudo += `\nRELATÓRIO DE ${type.toUpperCase()}\n\nDados não disponíveis para este tipo de relatório.`;
    }

    conteudo += `\n\n==========================================\nEste documento foi gerado automaticamente pelo sistema MetaConstrutor\nwww.metaconstrutor.com`;

    // Criar e baixar arquivo
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gerarExcel = async (fileName: string) => {
    // Gerar dados estruturados para Excel
    let dadosExcel = '';
    
    // Cabeçalho CSV
    dadosExcel += 'METACONSTRUTOR - SISTEMA DE GESTAO DE OBRAS\n';
    dadosExcel += `Data de Emissao,${new Date().toLocaleDateString('pt-BR')}\n`;
    dadosExcel += 'Responsavel Tecnico,João Silva (CREA: 123456)\n\n';

    // Dados específicos baseado no tipo
    switch (type) {
      case 'relatorio':
        dadosExcel += 'Tipo,Nome,Status,Orcamento,Responsavel,Data Inicio\n';
        if (data && Array.isArray(data)) {
          data.forEach(item => {
            dadosExcel += `Obra,"${item.nome || ''}","${item.status || ''}","${item.orcamento || ''}","${item.responsavel || ''}","${item.dataInicio || ''}"\n`;
          });
        }
        break;
      case 'obra':
        dadosExcel += 'Campo,Valor\n';
        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            dadosExcel += `"${key}","${value}"\n`;
          });
        }
        break;
      default:
        dadosExcel += 'Informacao,Valor\n';
        dadosExcel += `"Tipo de Relatorio","${type}"\n`;
        dadosExcel += '"Status","Dados nao disponiveis"\n';
    }

    // Criar e baixar arquivo CSV (compatível com Excel)
    const blob = new Blob([dadosExcel], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.xlsx', '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
