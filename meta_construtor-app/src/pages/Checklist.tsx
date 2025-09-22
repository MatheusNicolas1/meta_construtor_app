import { useState } from "react";
import { NavigationSafety } from "@/utils/navigationSafety";
import { useNavigationTransition } from "@/hooks/useNavigationTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChecklistForm } from "@/components/checklist/ChecklistForm";
import { DigitalSignatureComponent } from "@/components/checklist/DigitalSignature";
import { Checklist as ChecklistType, ChecklistFormData, ChecklistFilters, ChecklistCategory, ChecklistStatus, DigitalSignature } from "@/types/checklist";
import { CheckSquare, Search, Plus, Filter, Calendar as CalendarIcon, Download, FileCheck, Users, AlertCircle, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const ChecklistPage = () => {
  const { toast } = useToast();
  const { navigate } = useNavigationTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  
  const [filters, setFilters] = useState<ChecklistFilters>({
    search: "",
    obra: "all",
    category: "all",
    status: "all",
    responsible: "all",
    dateRange: {}
  });

  // Mock data - em produção virão do backend
  const [checklists, setChecklists] = useState<ChecklistType[]>([
    {
      id: "checklist-1",
      title: "Checklist de Segurança - Início de Obra",
      category: "Segurança",
      description: "Verificações obrigatórias antes do início dos trabalhos",
      obra: { id: "obra-1", name: "Residencial Vista Verde" },
      responsible: { id: "resp-1", name: "João Silva", email: "joao@example.com", role: "Engenheiro Civil" },
      status: "Em Andamento",
      dueDate: "2024-02-15",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-16T14:30:00Z",
      startedAt: "2024-01-16T08:00:00Z",
      templateUsed: { id: "template-1", name: "Segurança no Início da Obra" },
      progress: { total: 5, completed: 3, percentage: 60 },
      items: [
        {
          id: "item-1",
          title: "Verificar EPIs da equipe",
          description: "Conferir se todos os trabalhadores possuem EPIs adequados",
          priority: "Crítica",
          status: "Concluído",
          requiresAttachment: true,
          isObligatory: true,
          attachments: [],
          completedAt: "2024-01-16T09:00:00Z",
          completedBy: "João Silva"
        },
        {
          id: "item-2",
          title: "Inspeção de equipamentos de segurança",
          priority: "Crítica",
          status: "Concluído",
          requiresAttachment: true,
          isObligatory: true,
          attachments: [],
          completedAt: "2024-01-16T10:00:00Z",
          completedBy: "João Silva"
        },
        {
          id: "item-3",
          title: "Verificar sinalização de segurança",
          priority: "Alta",
          status: "Concluído",
          requiresAttachment: false,
          isObligatory: true,
          attachments: [],
          completedAt: "2024-01-16T11:00:00Z",
          completedBy: "João Silva"
        },
        {
          id: "item-4",
          title: "Teste de equipamentos elétricos",
          priority: "Crítica",
          status: "Em andamento",
          requiresAttachment: true,
          isObligatory: true,
          attachments: []
        },
        {
          id: "item-5",
          title: "Verificar extintores de incêndio",
          priority: "Média",
          status: "Não iniciado",
          requiresAttachment: false,
          isObligatory: false,
          attachments: []
        }
      ]
    },
    {
      id: "checklist-2",
      title: "Checklist de Qualidade - Concretagem",
      category: "Qualidade",
      obra: { id: "obra-2", name: "Comercial Center Norte" },
      responsible: { id: "resp-2", name: "Maria Santos", email: "maria@example.com", role: "Técnica de Qualidade" },
      status: "Concluído",
      dueDate: "2024-01-20",
      createdAt: "2024-01-14T08:00:00Z",
      updatedAt: "2024-01-20T16:00:00Z",
      startedAt: "2024-01-19T07:30:00Z",
      completedAt: "2024-01-20T15:45:00Z",
      progress: { total: 4, completed: 4, percentage: 100 },
      signature: {
        id: "sig-1",
        signerName: "Maria Santos",
        signerEmail: "maria@example.com",
        signedAt: "2024-01-20T15:45:00Z",
        signatureData: "data:image/png;base64,..."
      },
      items: [
        {
          id: "item-6",
          title: "Verificar slump do concreto",
          priority: "Crítica",
          status: "Concluído",
          requiresAttachment: true,
          isObligatory: true,
          attachments: [],
          completedAt: "2024-01-20T08:00:00Z",
          completedBy: "Maria Santos"
        },
        {
          id: "item-7",
          title: "Conferir armação da estrutura",
          priority: "Crítica",
          status: "Concluído",
          requiresAttachment: true,
          isObligatory: true,
          attachments: [],
          completedAt: "2024-01-20T10:00:00Z",
          completedBy: "Maria Santos"
        },
        {
          id: "item-8",
          title: "Verificar nivelamento das formas",
          priority: "Alta",
          status: "Concluído",
          requiresAttachment: false,
          isObligatory: true,
          attachments: [],
          completedAt: "2024-01-20T12:00:00Z",
          completedBy: "Maria Santos"
        },
        {
          id: "item-9",
          title: "Coletar amostras para ensaio",
          priority: "Crítica",
          status: "Concluído",
          requiresAttachment: false,
          isObligatory: true,
          attachments: [],
          completedAt: "2024-01-20T14:00:00Z",
          completedBy: "Maria Santos"
        }
      ]
    }
  ]);

  const obras = [
    { id: "obra-1", name: "Residencial Vista Verde" },
    { id: "obra-2", name: "Comercial Center Norte" },
    { id: "obra-3", name: "Ponte Rio Azul" },
    { id: "obra-4", name: "Hospital Regional Sul" }
  ];

  const responsibles = [
    { id: "resp-1", name: "João Silva" },
    { id: "resp-2", name: "Maria Santos" },
    { id: "resp-3", name: "Carlos Lima" },
    { id: "resp-4", name: "Ana Costa" }
  ];

  const handleCreateChecklist = (formData: ChecklistFormData) => {
    // Mock creation - em produção faria uma chamada à API
    const newChecklist: ChecklistType = {
      id: `checklist-${Date.now()}`,
      title: formData.title,
      category: formData.category as ChecklistCategory,
      description: formData.description,
      obra: obras.find(o => o.id === formData.obraId)!,
      responsible: responsibles.find(r => r.id === formData.responsibleId)! as any,
      status: "Rascunho",
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: { 
        total: formData.items.length, 
        completed: 0, 
        percentage: 0 
      },
      items: formData.items,
      templateUsed: formData.templateId ? { id: formData.templateId, name: "Template Usado" } : undefined
    };

    setChecklists(prev => [newChecklist, ...prev]);

    toast({
      title: "Checklist criado",
      description: `O checklist "${formData.title}" foi criado com sucesso.`,
    });
  };

  const handleSignChecklist = (checklistId: string, signature: DigitalSignature) => {
    setChecklists(prev => prev.map(checklist => 
      checklist.id === checklistId 
        ? { 
            ...checklist, 
            signature, 
            status: "Concluído" as ChecklistStatus,
            completedAt: new Date().toISOString()
          }
        : checklist
    ));
  };

  const filteredChecklists = checklists.filter(checklist => {
    // Search filter
    const matchesSearch = !filters.search || 
      checklist.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      checklist.category?.toLowerCase().includes(filters.search.toLowerCase()) ||
      checklist.responsible.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      checklist.obra.name.toLowerCase().includes(filters.search.toLowerCase());

    // Category filter
    const matchesCategory = filters.category === "all" || checklist.category === filters.category;

    // Status filter
    const matchesStatus = filters.status === "all" || checklist.status === filters.status;

    // Obra filter
    const matchesObra = !filters.obra || filters.obra === "all" || checklist.obra.id === filters.obra;

    // Responsible filter
    const matchesResponsible = !filters.responsible || filters.responsible === "all" || checklist.responsible.id === filters.responsible;

    return matchesSearch && matchesCategory && matchesStatus && matchesObra && matchesResponsible;
  });

  const clearFilters = () => {
    setFilters({
      search: "",
      obra: "all",
      category: "all",
      status: "all",
      responsible: "all",
      dateRange: {}
    });
  };

  const hasActiveFilters = filters.search || (filters.obra && filters.obra !== "all") || filters.category !== "all" || 
                          filters.status !== "all" || (filters.responsible && filters.responsible !== "all");

  const activeChecklists = filteredChecklists.filter(c => 
    c.status === "Em Andamento" || c.status === "Rascunho" || c.status === "Pendente"
  );
  const completedChecklists = filteredChecklists.filter(c => c.status === "Concluído");
  const allChecklists = filteredChecklists;

  return (
    <div className="responsive-spacing">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">Gestão de Checklists</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Gerencie listas de verificação para controle de qualidade e segurança
            </p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto sm:flex-shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Novo Checklist</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="w-full transition-all duration-300 hover:shadow-lg bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </span>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar checklists..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value: ChecklistCategory | "all") => 
                    setFilters({ ...filters, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
                    <SelectItem value="Qualidade">Qualidade</SelectItem>
                    <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="Documentação">Documentação</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value: ChecklistStatus | "all") => 
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Rascunho">Rascunho</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Obra</Label>
                <Select 
                  value={filters.obra} 
                  onValueChange={(value) => setFilters({ ...filters, obra: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as obras</SelectItem>
                    {obras.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id}>
                        {obra.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select 
                  value={filters.responsible} 
                  onValueChange={(value) => setFilters({ ...filters, responsible: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os responsáveis</SelectItem>
                    {responsibles.map((responsible) => (
                      <SelectItem key={responsible.id} value={responsible.id}>
                        {responsible.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="transition-all duration-300 hover:shadow-lg bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{checklists.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold">{activeChecklists.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileCheck className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-bold">{completedChecklists.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsáveis</p>
                  <p className="text-2xl font-bold">{responsibles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checklists Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ativos ({activeChecklists.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Concluídos ({completedChecklists.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Todos ({allChecklists.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeChecklists.map((checklist) => (
                <ChecklistCard 
                  key={checklist.id} 
                  checklist={checklist} 
                  onSign={handleSignChecklist}
                />
              ))}
            </div>

            {activeChecklists.length === 0 && (
              <EmptyState 
                title="Nenhum checklist ativo"
                description="Todos os checklists foram concluídos ou não há checklists criados."
              />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {completedChecklists.map((checklist) => (
                <ChecklistCard 
                  key={checklist.id} 
                  checklist={checklist} 
                  onSign={handleSignChecklist}
                />
              ))}
            </div>

            {completedChecklists.length === 0 && (
              <EmptyState 
                title="Nenhum checklist concluído"
                description="Complete seus primeiros checklists para vê-los aqui."
              />
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {allChecklists.map((checklist) => (
                <ChecklistCard 
                  key={checklist.id} 
                  checklist={checklist} 
                  onSign={handleSignChecklist}
                />
              ))}
            </div>

            {allChecklists.length === 0 && (
              <EmptyState 
                title="Nenhum checklist encontrado"
                description="Tente ajustar os filtros ou crie seu primeiro checklist."
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Form Dialog */}
        <ChecklistForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreateChecklist}
        />
      </div>
    </div>
  );
};

// Componente de Card individual do Checklist
interface ChecklistCardProps {
  checklist: ChecklistType;
  onSign: (checklistId: string, signature: DigitalSignature) => void;
}

function ChecklistCard({ checklist, onSign }: ChecklistCardProps) {
  const { navigate } = useNavigationTransition();
  const getStatusIcon = (status: ChecklistStatus) => {
    switch (status) {
      case "Rascunho":
        return <FileCheck className="h-4 w-4" />;
      case "Em Andamento":
        return <Clock className="h-4 w-4" />;
      case "Concluído":
        return <CheckSquare className="h-4 w-4" />;
      case "Pendente":
        return <AlertCircle className="h-4 w-4" />;
      case "Cancelado":
        return <X className="h-4 w-4" />;
      default:
        return <FileCheck className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ChecklistStatus) => {
    switch (status) {
      case "Rascunho":
        return "secondary";
      case "Em Andamento":
        return "default";
      case "Concluído":
        return "default";
      case "Pendente":
        return "destructive";
      case "Cancelado":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="w-full cursor-pointer transition-all duration-300 hover:shadow-lg bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor(checklist.status) as any} className="flex items-center gap-1">
            {getStatusIcon(checklist.status)}
            {checklist.status}
          </Badge>
          <Badge variant="outline">{checklist.category}</Badge>
        </div>
        <CardTitle className="text-lg line-clamp-2">{checklist.title}</CardTitle>
        <CardDescription>
          <div className="space-y-1">
            <p className="font-medium">{checklist.obra.name}</p>
            <p className="text-sm">Responsável: {checklist.responsible.name}</p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{checklist.progress.percentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${checklist.progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {checklist.progress.completed} de {checklist.progress.total} itens concluídos
          </p>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>Prazo: {format(new Date(checklist.dueDate), "dd/MM/yyyy", { locale: ptBR })}</span>
        </div>

        {/* Template Used */}
        {checklist.templateUsed && (
          <div className="text-xs text-muted-foreground">
            Template: {checklist.templateUsed.name}
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(`/checklist/${checklist.id}`)}
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            Visualizar
          </Button>
          {checklist.status === "Em Andamento" && checklist.progress.percentage === 100 && !checklist.signature && (
            <DigitalSignatureComponent
              onSign={(signature) => onSign(checklist.id, signature)}
              signerName={checklist.responsible.name}
              signerEmail={checklist.responsible.email}
            />
          )}
          {checklist.status === "Concluído" && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Signature Info */}
        {checklist.signature && (
          <div className="bg-muted/30 p-2 rounded text-xs">
            <p className="font-medium">Assinado por: {checklist.signature.signerName}</p>
            <p className="text-muted-foreground">
              {format(new Date(checklist.signature.signedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Estado Vazio
interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

export default ChecklistPage;