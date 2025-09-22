import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RDONewForm } from "@/components/rdo/RDONewForm";
import { DatePicker } from "@/components/DatePicker";
import { RDOExpandableCard } from "@/components/RDOExpandableCard";
import { RDO, CreateRDOData } from "@/types/rdo";
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
  const [editingRDO, setEditingRDO] = useState<RDO | undefined>();

  // Mock data - in real app, this would be fetched from backend
  const rdos: RDO[] = [
    {
      id: 1,
      data: "2024-01-15",
      obraId: 1,
      obraNome: "Residencial Vista Verde",
      status: 'Aprovado' as const,
      criadoPorId: 'user-1',
      criadoPorNome: 'João Silva',
      aprovadoPorId: 'user-manager',
      aprovadoPorNome: 'Carlos Santos',
      dataAprovacao: '2024-01-15T18:00:00Z',
      atividadesRealizadas: [
        {
          id: 1,
          nome: "Concretagem de Laje",
          categoria: "Estrutura",
          quantidade: 120,
          unidadeMedida: "m²",
          percentualConcluido: 100,
          status: "Concluída"
        },
        {
          id: 2,
          nome: "Instalação Elétrica",
          categoria: "Instalações",
          quantidade: 50,
          unidadeMedida: "m",
          percentualConcluido: 60,
          status: "Em Andamento"
        }
      ],
      atividadesExtras: [],
      periodo: 'Manhã',
      clima: "Ensolarado",
      equipeOciosa: false,
      equipesPresentes: [
        {
          id: 1,
          nome: "João Silva",
          funcao: "Engenheiro Civil",
          horasTrabalho: 8,
          presente: true
        },
        {
          id: 2,
          nome: "Maria Santos",
          funcao: "Mestre de Obras",
          horasTrabalho: 8,
          presente: true
        }
      ],
      equipamentosUtilizados: [
        {
          id: 1,
          nome: "Betoneira B-400",
          categoria: "Concreto",
          horasUso: 6,
          status: "Operacional"
        }
      ],
      equipamentosQuebrados: [],
      acidentes: [],
      materiaisFalta: [],
      estoqueMateriais: [],
      observacoes: "Dia produtivo. Concretagem realizada sem intercorrências. Tempo bom para trabalho.",
      imagens: [],
      documentos: [],
      criadoEm: "2024-01-15T08:00:00Z",
      atualizadoEm: "2024-01-15T17:30:00Z"
    },
    {
      id: 2,
      data: "2024-01-14",
      obraId: 2,
      obraNome: "Comercial Center Norte",
      status: 'Aguardando aprovação' as const,
      criadoPorId: 'user-2',
      criadoPorNome: 'Maria Santos',
      atividadesRealizadas: [
        {
          id: 3,
          nome: "Escavação de Fundação",
          categoria: "Terraplanagem",
          quantidade: 80,
          unidadeMedida: "m³",
          percentualConcluido: 75,
          status: "Em Andamento"
        }
      ],
      atividadesExtras: [],
      periodo: 'Tarde',
      clima: "Parcialmente Nublado",
      equipeOciosa: false,
      equipamentosQuebrados: [],
      acidentes: [],
      materiaisFalta: [],
      estoqueMateriais: [],
      equipesPresentes: [
        {
          id: 3,
          nome: "Carlos Lima",
          funcao: "Operador de Máquinas",
          horasTrabalho: 8,
          presente: true
        }
      ],
      equipamentosUtilizados: [
        {
          id: 2,
          nome: "Escavadeira CAT-320",
          categoria: "Terraplanagem",
          horasUso: 7,
          status: "Operacional"
        }
      ],
      observacoes: "Escavação progredindo conforme cronograma. Solo com boa consistência.",
      imagens: [],
      documentos: [],
      criadoEm: "2024-01-14T08:00:00Z",
      atualizadoEm: "2024-01-14T17:00:00Z"
    },
    {
      id: 3,
      data: "2024-01-13",
      obraId: 1,
      obraNome: "Residencial Vista Verde",
      status: 'Em elaboração' as const,
      criadoPorId: 'user-3',
      criadoPorNome: 'Pedro Oliveira',
      atividadesRealizadas: [
        {
          id: 4,
          nome: "Alvenaria de Vedação",
          categoria: "Alvenaria",
          quantidade: 25,
          unidadeMedida: "m²",
          percentualConcluido: 30,
          status: "Iniciada"
        }
      ],
      atividadesExtras: [],
      periodo: 'Manhã',
      clima: "Ensolarado",
      equipeOciosa: false,
      equipesPresentes: [
        {
          id: 4,
          nome: "Ana Costa",
          funcao: "Pedreiro",
          horasTrabalho: 8,
          presente: true
        }
      ],
      equipamentosUtilizados: [],
      equipamentosQuebrados: [],
      acidentes: [],
      materiaisFalta: [],
      estoqueMateriais: [],
      observacoes: "Início da alvenaria do pavimento térreo. Material entregue conforme programado.",
      imagens: [],
      documentos: [],
      criadoEm: "2024-01-13T08:00:00Z",
      atualizadoEm: "2024-01-13T16:45:00Z"
    }
  ];

  const obras = [
    { id: 1, nome: "Residencial Vista Verde" },
    { id: 2, nome: "Comercial Center Norte" },
    { id: 3, nome: "Ponte Rio Azul" },
    { id: 4, nome: "Hospital Regional Sul" }
  ];

  const filteredRDOs = rdos.filter(rdo => {
    const matchesSearch = rdo.obraNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rdo.observacoes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObra = !selectedObra || selectedObra === "all" || rdo.obraId.toString() === selectedObra;
    const matchesDate = !selectedDate || rdo.data === selectedDate.toISOString().split('T')[0];
    
    return matchesSearch && matchesObra && matchesDate;
  });

  const handleCreateRDO = (data: CreateRDOData) => {
    console.log("Criando RDO:", data);
    // In real app, this would call an API
  };

  const handleEditRDO = (rdo: RDO) => {
    setEditingRDO(rdo);
    setIsFormOpen(true);
  };

  const handleDeleteRDO = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este RDO?")) {
      console.log("Excluindo RDO:", id);
      // In real app, this would call an API
    }
  };


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
            onClick={() => {
              setEditingRDO(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo RDO
          </Button>
        </div>
      </div>

      {/* Filters */}
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
                    <SelectItem key={obra.id} value={obra.id.toString()}>
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

      {/* RDO List */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1">
        {filteredRDOs.map((rdo) => (
          <RDOExpandableCard
            key={rdo.id}
            rdo={rdo}
            onEdit={handleEditRDO}
            onDelete={handleDeleteRDO}
          />
        ))}
      </div>

      {filteredRDOs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-card-foreground">Nenhum RDO encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || selectedObra || selectedDate 
              ? "Tente ajustar os filtros de busca" 
              : "Comece criando seu primeiro RDO"}
          </p>
          <div className="mt-6">
            <Button 
              className="gradient-construction border-0 hover:opacity-90"
              onClick={() => {
                setEditingRDO(undefined);
                setIsFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro RDO
            </Button>
          </div>
        </div>
      )}

      {/* RDO Form Dialog */}
      <RDONewForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRDO(undefined);
        }}
        onSubmit={handleCreateRDO}
        isEditing={!!editingRDO}
      />
    </div>
  );
};

export default RDOPage;