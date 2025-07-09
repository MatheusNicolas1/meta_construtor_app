import React, { useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, FileText, Download, Settings, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RDO {
  id: number;
  data: string;
  atividades: string;
  clima: string;
  equipe: number;
  imagens: number;
}

interface Obra {
  id: number;
  nome: string;
  endereco: string;
  responsavel: string;
  dataInicio: string;
  dataPrevisao: string;
}

interface MultiRdoExportProps {
  rdos: RDO[];
  obra: Obra;
}

export function MultiRdoExport({ rdos, obra }: MultiRdoExportProps) {
  const [selectedRdos, setSelectedRdos] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    titulo: `Relatório Consolidado - ${obra.nome}`,
    periodo: '',
    responsavel: obra.responsavel,
    crea: '',
    observacoes: '',
    formato: 'pdf',
    incluirCapa: true,
    incluirSumario: true,
    incluirImagens: true,
    incluirAssinaturas: true
  });

  const handleSelectRdo = (rdoId: number, checked: boolean) => {
    if (checked) {
      setSelectedRdos([...selectedRdos, rdoId]);
    } else {
      setSelectedRdos(selectedRdos.filter(id => id !== rdoId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRdos(rdos.map(rdo => rdo.id));
    } else {
      setSelectedRdos([]);
    }
  };

  const exportarRelatorio = () => {
    const rdosSelecionados = rdos.filter(rdo => selectedRdos.includes(rdo.id));
    
    // Gerar período automaticamente baseado nos RDOs selecionados
    const datas = rdosSelecionados.map(rdo => new Date(rdo.data));
    const dataInicio = new Date(Math.min(...datas.map(d => d.getTime())));
    const dataFim = new Date(Math.max(...datas.map(d => d.getTime())));
    const periodoAuto = `${format(dataInicio, 'dd/MM/yyyy')} - ${format(dataFim, 'dd/MM/yyyy')}`;

    const conteudoRelatorio = `
METACONSTRUTOR - SISTEMA DE GESTÃO DE OBRAS
${exportConfig.titulo}
Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}
${exportConfig.responsavel ? `Responsável Técnico: ${exportConfig.responsavel}` : ''}
${exportConfig.crea ? `CREA: ${exportConfig.crea}` : ''}

========== CAPA ==========

Obra: ${obra.nome}
Endereço: ${obra.endereco}
Período: ${exportConfig.periodo || periodoAuto}
Total de RDOs: ${rdosSelecionados.length}

========== SUMÁRIO ==========

${rdosSelecionados.map((rdo, index) => 
  `${index + 1}. RDO ${format(new Date(rdo.data), 'dd/MM/yyyy')} - ${rdo.atividades.substring(0, 50)}...`
).join('\n')}

========== RELATÓRIOS DIÁRIOS ==========

${rdosSelecionados.map((rdo, index) => `
RDO ${index + 1} - ${format(new Date(rdo.data), 'dd/MM/yyyy', { locale: ptBR })}
----------------------------------------
Data: ${format(new Date(rdo.data), 'dd/MM/yyyy')}
Condições Climáticas: ${rdo.clima}
Equipe: ${rdo.equipe} pessoas
Atividades Executadas: ${rdo.atividades}
Imagens: ${rdo.imagens} fotos anexas

`).join('\n')}

${exportConfig.observacoes ? `
========== OBSERVAÇÕES ==========

${exportConfig.observacoes}
` : ''}

========== ASSINATURAS ==========

_______________________________
Responsável Técnico
${exportConfig.responsavel}
${exportConfig.crea ? `CREA: ${exportConfig.crea}` : ''}

_______________________________
Fiscal da Obra
Data: ___/___/______

-----------------------------------------
Este documento foi gerado automaticamente pelo MetaConstrutor
Total de páginas: ${rdosSelecionados.length + 3}
    `.trim();

    const blob = new Blob([conteudoRelatorio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_Multi_RDO_${obra.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsModalOpen(false);
  };

  const rdosSelecionados = rdos.filter(rdo => selectedRdos.includes(rdo.id));

  return (
    <div className="space-y-4">
      {/* Controles de seleção */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <Checkbox
            id="select-all"
            checked={selectedRdos.length === rdos.length}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="font-medium">
            Selecionar todos ({rdos.length} RDOs)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedRdos.length} selecionado(s)
          </span>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={selectedRdos.length === 0}
                className="gradient-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Selecionados
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurar Exportação Multi-RDO
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título do Relatório</Label>
                    <Input
                      id="titulo"
                      value={exportConfig.titulo}
                      onChange={(e) => setExportConfig({...exportConfig, titulo: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodo">Período (opcional)</Label>
                    <Input
                      id="periodo"
                      placeholder="Será gerado automaticamente"
                      value={exportConfig.periodo}
                      onChange={(e) => setExportConfig({...exportConfig, periodo: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsavel">Responsável Técnico</Label>
                    <Input
                      id="responsavel"
                      value={exportConfig.responsavel}
                      onChange={(e) => setExportConfig({...exportConfig, responsavel: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crea">CREA (opcional)</Label>
                    <Input
                      id="crea"
                      placeholder="Ex: 123456/D"
                      value={exportConfig.crea}
                      onChange={(e) => setExportConfig({...exportConfig, crea: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações Gerais</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações adicionais que aparecerão no relatório..."
                    value={exportConfig.observacoes}
                    onChange={(e) => setExportConfig({...exportConfig, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="formato">Formato</Label>
                    <Select value={exportConfig.formato} onValueChange={(value) => setExportConfig({...exportConfig, formato: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="txt">Texto (.txt)</SelectItem>
                        <SelectItem value="pdf" disabled>PDF (em breve)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium mb-2">Resumo da Exportação</h4>
                  <div className="text-sm space-y-1">
                    <p>• {rdosSelecionados.length} RDOs selecionados</p>
                    <p>• Período: {rdosSelecionados.length > 0 ? 
                      `${format(new Date(Math.min(...rdosSelecionados.map(r => new Date(r.data).getTime()))), 'dd/MM/yyyy')} - ${format(new Date(Math.max(...rdosSelecionados.map(r => new Date(r.data).getTime()))), 'dd/MM/yyyy')}` 
                      : 'Nenhum RDO selecionado'}</p>
                    <p>• Capa, sumário e assinaturas incluídas</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={exportarRelatorio} className="gradient-primary">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de RDOs com checkboxes */}
      <div className="space-y-4">
        {rdos.map((rdo) => (
          <div key={rdo.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <Checkbox
              id={`rdo-${rdo.id}`}
              checked={selectedRdos.includes(rdo.id)}
              onCheckedChange={(checked) => handleSelectRdo(rdo.id, checked as boolean)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-[#ff5722]" />
                <span className="font-medium">
                  {format(new Date(rdo.data), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{rdo.atividades}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{rdo.equipe} pessoas</span>
              <span>{rdo.imagens} fotos</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                {rdo.clima}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 