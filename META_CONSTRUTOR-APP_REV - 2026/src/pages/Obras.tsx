import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Plus } from "lucide-react";
import { ObraExpandableCard } from "@/components/ui/expandable-card";
import { NovaObraForm } from "@/components/NovaObraForm";
import { CreditsDisplay } from "@/components/CreditsDisplay";

const Obras = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const obras = [
    {
      id: 1,
      nome: "Residencial Vista Verde",
      localizacao: "Bairro Jardim das Flores, São Paulo - SP",
      responsavel: "Eng. João Silva",
      cliente: "Construtora ABC Ltda",
      tipo: "Residencial",
      progresso: 75,
      dataInicio: "2023-08-15",
      previsaoTermino: "2024-03-15",
      status: "Em andamento",
      atividades: 45,
      equipes: [
        { name: "João Silva" },
        { name: "Maria Santos" },
        { name: "Carlos Lima" },
        { name: "Ana Costa" }
      ],
      tarefasRecentes: [
        { title: "Fundação concluída", completed: true },
        { title: "Estrutura 60% concluída", completed: false },
        { title: "Instalações elétricas", completed: false }
      ]
    },
    {
      id: 2,
      nome: "Comercial Center Norte",
      localizacao: "Av. Paulista, 1000 - São Paulo - SP",
      responsavel: "Eng. Maria Santos",
      cliente: "Grupo Empresarial XYZ",
      tipo: "Comercial",
      progresso: 45,
      dataInicio: "2023-10-01",
      previsaoTermino: "2024-05-20",
      status: "Em andamento",
      atividades: 68,
      equipes: [
        { name: "Maria Santos" },
        { name: "Pedro Oliveira" },
        { name: "Lucas Ferreira" }
      ],
      tarefasRecentes: [
        { title: "Projeto arquitetônico aprovado", completed: true },
        { title: "Preparação do terreno", completed: true },
        { title: "Início da fundação", completed: false }
      ]
    },
    {
      id: 3,
      nome: "Ponte Rio Azul",
      localizacao: "Rod. BR-101, Km 45 - Rio de Janeiro - RJ",
      responsavel: "Eng. Carlos Lima",
      cliente: "Prefeitura Municipal",
      tipo: "Infraestrutura",
      progresso: 90,
      dataInicio: "2023-03-10",
      previsaoTermino: "2024-02-28",
      status: "Finalizando",
      atividades: 123,
      equipes: [
        { name: "Carlos Lima" },
        { name: "Roberto Silva" },
        { name: "Amanda Costa" },
        { name: "Felipe Santos" }
      ],
      tarefasRecentes: [
        { title: "Estrutura principal finalizada", completed: true },
        { title: "Pavimentação concluída", completed: true },
        { title: "Acabamentos finais", completed: false },
        { title: "Testes de carga", completed: false }
      ]
    },
    {
      id: 4,
      nome: "Hospital Regional Sul",
      localizacao: "Rua das Palmeiras, 500 - Porto Alegre - RS",
      responsavel: "Eng. Ana Costa",
      cliente: "Governo do Estado",
      tipo: "Institucional",
      progresso: 25,
      dataInicio: "2024-01-15",
      previsaoTermino: "2025-06-30",
      status: "Iniciando",
      atividades: 89,
      equipes: [
        { name: "Ana Costa" },
        { name: "Gabriel Rocha" },
        { name: "Carla Mendes" }
      ],
      tarefasRecentes: [
        { title: "Licenças aprovadas", completed: true },
        { title: "Terreno preparado", completed: false },
        { title: "Projeto executivo", completed: false }
      ]
    }
  ];

  const filteredObras = obras.filter(obra =>
    obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.localizacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em andamento":
        return "text-construction-orange";
      case "Finalizando":
        return "text-construction-green";
      case "Iniciando":
        return "text-construction-blue";
      default:
        return "text-muted-foreground";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="responsive-spacing">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">Gestão de Obras</h1>
            <p className="text-muted-foreground text-sm md:text-base">Gerencie todas as suas obras e projetos</p>
          </div>
          <Button 
            className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto sm:flex-shrink-0"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nova Obra</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>

        {/* Sistema de Créditos */}
        <CreditsDisplay />

      {/* Search Bar */}
      <div className="w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar obras, localização ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

        {/* Works Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredObras.map((obra) => (
          <ObraExpandableCard
            key={obra.id}
            id={obra.id}
            nome={obra.nome}
            localizacao={obra.localizacao}
            responsavel={obra.responsavel}
            cliente={obra.cliente}
            tipo={obra.tipo}
            progresso={obra.progresso}
            dataInicio={obra.dataInicio}
            previsaoTermino={obra.previsaoTermino}
            status={obra.status}
            atividades={obra.atividades}
            equipes={obra.equipes}
            tarefasRecentes={obra.tarefasRecentes}
          />
        ))}
        </div>

        {filteredObras.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-card-foreground">Nenhuma obra encontrada</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm ? "Tente ajustar os termos de busca" : "Comece cadastrando sua primeira obra"}
          </p>
        </div>
        )}

        <NovaObraForm 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
        />
      </div>
    </div>
  );
};

export default Obras;