import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RDONewForm } from "@/components/rdo/RDONewForm";
import { DatePicker } from "@/components/DatePicker";
import { RDOExpandableCard } from "@/components/RDOExpandableCard";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { useRDOs } from "@/hooks/useRDOs";
import { useObras } from "@/hooks/useObras";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Search,
  Plus,
  Download,
  Filter
} from "lucide-react";

const RDOPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedObra, setSelectedObra] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { rdos, isLoading, deleteRDO, createRDO } = useRDOs();
  const { obras } = useObras();

  const filteredRDOs = rdos.filter(rdo => {
    const obraNome = (rdo as any).obras?.nome || '';
    const matchesSearch = obraNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rdo.observacoes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObra = !selectedObra || selectedObra === "all" || rdo.obra_id === selectedObra;
    const matchesDate = !selectedDate || rdo.data === selectedDate.toISOString().split('T')[0];

    return matchesSearch && matchesObra && matchesDate;
  });

  const handleDeleteRDO = (id: number | string) => {
    if (confirm("Tem certeza que deseja excluir este RDO?")) {
      deleteRDO.mutate(String(id));
    }
  };

  // Map Supabase RDO to component format
  const mapRDOToComponent = (rdo: any) => ({
    id: rdo.id,
    data: rdo.data,
    obraId: rdo.obra_id,
    obraNome: rdo.obras?.nome || 'Obra não encontrada',
    status: rdo.status,
    criadoPorId: rdo.criado_por_id,
    criadoPorNome: 'Usuário',
    aprovadoPorId: rdo.aprovado_por_id,
    aprovadoPorNome: rdo.aprovado_por_id ? 'Aprovador' : undefined,
    dataAprovacao: rdo.data_aprovacao,
    atividadesRealizadas: [],
    atividadesExtras: [],
    periodo: rdo.periodo,
    clima: rdo.clima,
    equipeOciosa: rdo.equipe_ociosa,
    equipesPresentes: [],
    equipamentosUtilizados: [],
    equipamentosQuebrados: [],
    acidentes: [],
    materiaisFalta: [],
    estoqueMateriais: [],
    observacoes: rdo.observacoes || '',
    imagens: [],
    documentos: [],
    criadoEm: rdo.created_at,
    atualizadoEm: rdo.updated_at,
  });

  return (
    <div className="responsive-spacing">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Relatórios Diários de Obra (RDO)</h1>
          <p className="text-muted-foreground">Gerencie todos os relatórios diários das obras</p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button
            className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo RDO
          </Button>
        </div>
      </div>

      <CreditsDisplay />

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por obra ou observações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Obra</label>
              <Select value={selectedObra} onValueChange={setSelectedObra}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as obras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as obras</SelectItem>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Data</label>
              <DatePicker
                date={selectedDate}
                onDateChange={setSelectedDate}
                placeholder="Todas as datas"
                className="w-full"
              />
            </div>
            <div className="space-y-2 flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedObra("all");
                  setSelectedDate(undefined);
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
          {filteredRDOs.map((rdo) => (
            <RDOExpandableCard
              key={rdo.id}
              rdo={mapRDOToComponent(rdo)}
              onEdit={() => { }}
              onDelete={handleDeleteRDO}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredRDOs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-card-foreground">Nenhum RDO encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || selectedObra !== "all" || selectedDate
              ? "Tente ajustar os filtros de busca"
              : "Comece criando seu primeiro RDO"}
          </p>
          <div className="mt-6">
            <Button
              className="gradient-construction border-0 hover:opacity-90"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro RDO
            </Button>
          </div>
        </div>
      )}

      <RDONewForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (data) => {
          try {
            // Ensure correct types for createRDO
            await createRDO.mutateAsync({
              ...data,
              obra_id: data.obraId.toString(),
              // Add fallback for optional fields if needed by backend, though types should match
            });
            setIsFormOpen(false);
          } catch (error) {
            console.error("Error creating RDO:", error);
            // Toast is handled in useRDOs
          }
        }}
        isEditing={false}
      />
    </div>
  );
};

export default RDOPage;
