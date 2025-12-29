import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { EquipeExpandableCard } from "@/components/EquipeExpandableCard";
import { useEquipesSupabase } from "@/hooks/useEquipesSupabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Plus, Loader2 } from "lucide-react";

const Equipes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    funcao: "",
    telefone: "",
    email: "",
  });
  
  const { equipes, isLoading, createEquipe, deleteEquipe } = useEquipesSupabase();
  
  const [funcoesDisponiveis] = useState([
    "Engenheiro Civil",
    "Mestre de Obras", 
    "Pedreiro",
    "Eletricista",
    "Encanador",
    "Operador de Máquinas",
    "Servente"
  ]);

  const filteredEquipes = equipes.filter(membro =>
    membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.funcao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditMembro = (membro: any) => {
    console.log("Editando membro:", membro);
  };

  const handleDeleteMembro = (id: number | string) => {
    if (confirm("Tem certeza que deseja excluir este colaborador?")) {
      deleteEquipe.mutate(String(id));
    }
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.funcao) return;

    createEquipe.mutate({
      nome: formData.nome,
      funcao: formData.funcao,
      telefone: formData.telefone || undefined,
      email: formData.email || undefined,
    }, {
      onSuccess: () => {
        setFormData({ nome: "", funcao: "", telefone: "", email: "" });
        setIsDialogOpen(false);
      }
    });
  };

  return (
    <div className="responsive-spacing">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">Gestão de Equipes</h1>
            <p className="text-muted-foreground text-sm md:text-base">Gerencie colaboradores e equipes das obras</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto sm:flex-shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Novo Colaborador</span>
                <span className="sm:hidden">Adicionar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-card-foreground">Cadastrar Novo Colaborador</DialogTitle>
                <DialogDescription>
                  Adicione um novo membro à equipe
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input 
                    id="nome" 
                    placeholder="Nome do colaborador"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funcao">Função *</Label>
                  <AutocompleteInput
                    value={formData.funcao}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, funcao: value }))}
                    placeholder="Digite ou selecione uma função"
                    options={funcoesDisponiveis}
                    onAddNewOption={() => {}}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setFormData({ nome: "", funcao: "", telefone: "", email: "" });
                  }}
                  disabled={createEquipe.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  className="gradient-construction border-0" 
                  onClick={handleSubmit}
                  disabled={createEquipe.isPending}
                >
                  {createEquipe.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Cadastrar'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEquipes.map((membro) => (
              <EquipeExpandableCard
                key={membro.id}
                membro={{
                  id: membro.id,
                  nome: membro.nome,
                  funcao: membro.funcao,
                  equipe: '',
                  obra: '',
                  telefone: membro.telefone || '',
                  email: membro.email || '',
                  status: membro.ativo ? 'Ativo' : 'Inativo',
                }}
                onEdit={handleEditMembro}
                onDelete={handleDeleteMembro}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredEquipes.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-card-foreground">Nenhum colaborador encontrado</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? "Tente ajustar os termos de busca" : "Comece cadastrando seu primeiro colaborador"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipes;
