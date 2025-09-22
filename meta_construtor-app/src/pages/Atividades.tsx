import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Plus, Edit, Trash2 } from "lucide-react";
import { NovaAtividadeModal } from "@/components/NovaAtividadeModal";
import { useActivities } from "@/hooks/useActivities";

const Atividades = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { activities, deleteActivity } = useActivities();

  // Convert activities object to array for display
  const allActivities = Object.values(activities).flat().map(activity => ({
    id: activity.id,
    nome: activity.title,
    categoria: "Atividade", // Default category since Activity doesn't have this field
    unidadeMedida: "Un", // Default unit
    duracaoEstimada: "1 dia", // Default duration
    status: activity.status === "agendada" ? "Disponível" : 
            activity.status === "em_andamento" ? "Em Execução" :
            activity.status === "concluida" ? "Concluída" : "Pendente",
    descricao: activity.description,
    obra: activity.obra,
    data: activity.date,
    prioridade: activity.priority
  }));

  const filteredAtividades = allActivities.filter(atividade =>
    atividade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atividade.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atividade.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (atividade.obra && atividade.obra.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteActivity = (activityId: string, date: string) => {
    if (confirm("Tem certeza que deseja excluir esta atividade?")) {
      deleteActivity(activityId, date);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponível":
        return "bg-construction-blue text-white";
      case "Em Execução":
        return "bg-construction-orange text-white";
      case "Pendente":
        return "bg-yellow-500 text-white";
      case "Concluída":
        return "bg-construction-green text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="responsive-spacing">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">Gestão de Atividades</h1>
            <p className="text-muted-foreground text-sm md:text-base">Gerencie atividades padrão e vinculações com obras</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto sm:flex-shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nova Atividade</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
          
          <NovaAtividadeModal
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
          />
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar atividades, categoria ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Activities Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Lista de Atividades</CardTitle>
            <CardDescription>
              Atividades padrão cadastradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-muted-foreground">Categoria</TableHead>
                  <TableHead className="text-muted-foreground">Unidade</TableHead>
                  <TableHead className="text-muted-foreground">Duração</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAtividades.map((atividade) => (
                  <TableRow key={atividade.id}>
                    <TableCell className="font-medium text-card-foreground">
                      {atividade.nome}
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      {atividade.categoria}
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      {atividade.unidadeMedida}
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      {atividade.duracaoEstimada}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(atividade.status)}>
                        {atividade.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteActivity(atividade.id, atividade.data)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredAtividades.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-card-foreground">Nenhuma atividade encontrada</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? "Tente ajustar os termos de busca" : "Comece cadastrando sua primeira atividade"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Atividades;