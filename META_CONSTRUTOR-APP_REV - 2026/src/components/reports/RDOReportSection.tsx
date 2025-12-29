import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Wrench,
  Package,
  Camera,
  FileText,
  Clock
} from "lucide-react";
import { RDO } from "@/types/rdo";

interface RDOReportSectionProps {
  rdos: RDO[];
  selectedObra?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function RDOReportSection({ rdos, selectedObra, dateRange }: RDOReportSectionProps) {
  // Filter RDOs based on obra and date range
  const filteredRDOs = rdos.filter(rdo => {
    const matchesObra = !selectedObra || selectedObra === "all" || rdo.obraId.toString() === selectedObra;
    const rdoDate = new Date(rdo.data);
    const matchesDate = !dateRange || (rdoDate >= dateRange.start && rdoDate <= dateRange.end);
    return matchesObra && matchesDate;
  });

  // Calculate productivity metrics
  const totalActivities = filteredRDOs.reduce((sum, rdo) => sum + rdo.atividadesRealizadas.length, 0);
  const completedActivities = filteredRDOs.reduce((sum, rdo) => 
    sum + rdo.atividadesRealizadas.filter(a => a.status === "Concluída").length, 0
  );
  const extraActivities = filteredRDOs.reduce((sum, rdo) => sum + rdo.atividadesExtras.length, 0);
  const productivityRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  // Calculate idle time
  const totalIdleTime = filteredRDOs.reduce((sum, rdo) => 
    sum + (rdo.equipeOciosa ? (rdo.tempoOcioso || 0) : 0), 0
  );

  // Equipment analysis
  const totalEquipmentUsage = filteredRDOs.reduce((sum, rdo) => sum + rdo.equipamentosUtilizados.length, 0);
  const brokenEquipment = filteredRDOs.reduce((sum, rdo) => sum + rdo.equipamentosQuebrados.length, 0);

  // Safety analysis
  const totalAccidents = filteredRDOs.reduce((sum, rdo) => sum + rdo.acidentes.length, 0);
  const severeAccidents = filteredRDOs.reduce((sum, rdo) => 
    sum + rdo.acidentes.filter(a => a.gravidade === "Grave").length, 0
  );

  // Material shortages
  const materialShortages = filteredRDOs.reduce((sum, rdo) => sum + rdo.materiaisFalta.length, 0);
  const stockAlerts = filteredRDOs.reduce((sum, rdo) => 
    sum + rdo.estoqueMateriais.filter(m => m.alertaEstoqueMinimo).length, 0
  );

  // Attachments count
  const totalImages = filteredRDOs.reduce((sum, rdo) => sum + rdo.imagens.length, 0);
  const totalDocuments = filteredRDOs.reduce((sum, rdo) => sum + rdo.documentos.length, 0);

  if (filteredRDOs.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center">
            <ClipboardList className="mr-2 h-5 w-5 text-construction-blue" />
            Informações do RDO
          </CardTitle>
          <CardDescription>Dados consolidados dos Relatórios Diários de Obra</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            Nenhum RDO encontrado para o período selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-card-foreground flex items-center">
          <ClipboardList className="mr-2 h-5 w-5 text-construction-blue" />
          Informações do RDO
        </CardTitle>
        <CardDescription>
          Dados consolidados de {filteredRDOs.length} relatórios diários no período
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Productivity Section */}
        <div>
          <h4 className="font-medium text-card-foreground mb-3 flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-construction-green" />
            Produtividade Avançada
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Taxa de Conclusão</span>
                <Badge className="bg-construction-green text-white">
                  {productivityRate.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={productivityRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {completedActivities} de {totalActivities} atividades concluídas
              </p>
            </div>
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Atividades Extras</span>
                <span className="text-lg font-bold text-construction-blue">{extraActivities}</span>
              </div>
              <p className="text-xs text-muted-foreground">Atividades não previstas realizadas</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Tempo Ocioso</span>
                <span className="text-lg font-bold text-construction-orange">{totalIdleTime}h</span>
              </div>
              <p className="text-xs text-muted-foreground">Total de horas de ociosidade</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Equipment Section */}
        <div>
          <h4 className="font-medium text-card-foreground mb-3 flex items-center">
            <Wrench className="mr-2 h-4 w-4 text-construction-orange" />
            Equipamentos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Equipamentos Utilizados</span>
                <span className="text-lg font-bold text-construction-green">{totalEquipmentUsage}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total de utilizações registradas</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Quebras/Falhas</span>
                <span className="text-lg font-bold text-red-500">{brokenEquipment}</span>
              </div>
              <p className="text-xs text-muted-foreground">Equipamentos com problemas</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Safety Section */}
        <div>
          <h4 className="font-medium text-card-foreground mb-3 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
            Segurança
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total de Acidentes</span>
                <span className="text-lg font-bold text-red-500">{totalAccidents}</span>
              </div>
              <p className="text-xs text-muted-foreground">Ocorrências registradas no período</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Acidentes Graves</span>
                <span className="text-lg font-bold text-red-600">{severeAccidents}</span>
              </div>
              <p className="text-xs text-muted-foreground">Acidentes de alta gravidade</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Materials Section */}
        <div>
          <h4 className="font-medium text-card-foreground mb-3 flex items-center">
            <Package className="mr-2 h-4 w-4 text-construction-blue" />
            Materiais
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Faltas de Material</span>
                <span className="text-lg font-bold text-construction-orange">{materialShortages}</span>
              </div>
              <p className="text-xs text-muted-foreground">Materiais em falta registrados</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Alertas de Estoque</span>
                <span className="text-lg font-bold text-red-500">{stockAlerts}</span>
              </div>
              <p className="text-xs text-muted-foreground">Itens com estoque mínimo atingido</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Attachments Section */}
        <div>
          <h4 className="font-medium text-card-foreground mb-3 flex items-center">
            <Camera className="mr-2 h-4 w-4 text-construction-green" />
            Anexos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Imagens</span>
                <span className="text-lg font-bold text-construction-green">{totalImages}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total de imagens anexadas</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Documentos</span>
                <span className="text-lg font-bold text-construction-blue">{totalDocuments}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total de documentos anexados</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent Observations */}
        <div>
          <h4 className="font-medium text-card-foreground mb-3 flex items-center">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
            Observações Recentes
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {filteredRDOs
              .filter(rdo => rdo.observacoes.trim().length > 0)
              .slice(0, 5)
              .map((rdo, index) => (
                <div key={index} className="bg-muted/20 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-card-foreground">{rdo.obraNome}</span>
                    <span className="text-xs text-muted-foreground">{new Date(rdo.data).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rdo.observacoes}</p>
                </div>
              ))}
            {filteredRDOs.filter(rdo => rdo.observacoes.trim().length > 0).length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma observação registrada no período.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}