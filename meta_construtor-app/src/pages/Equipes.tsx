import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { EquipeExpandableCard } from "@/components/EquipeExpandableCard";
import { Users, Search, Plus } from "lucide-react";

const Equipes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estados para o formulário
  const [selectedFuncao, setSelectedFuncao] = useState("");
  const [selectedEquipe, setSelectedEquipe] = useState("");
  
  // Opções de função e equipe (inicializadas com valores dos dados existentes)
  const [funcoesDisponiveis, setFuncoesDisponiveis] = useState([
    "Engenheiro Civil",
    "Mestre de Obras", 
    "Pedreiro",
    "Eletricista",
    "Encanador",
    "Operador de Máquinas",
    "Servente"
  ]);
  
  const [equipesDisponiveis, setEquipesDisponiveis] = useState([
    "Equipe Estrutura",
    "Equipe Alvenaria", 
    "Equipe Elétrica",
    "Equipe Hidráulica",
    "Equipe Terraplanagem"
  ]);

  const equipes = [
    {
      id: 1,
      nome: "João Silva",
      funcao: "Engenheiro Civil",
      equipe: "Equipe Estrutura",
      obra: "Residencial Vista Verde",
      telefone: "(11) 99999-1111",
      email: "joao.silva@email.com",
      status: "Ativo"
    },
    {
      id: 2,
      nome: "Maria Santos",
      funcao: "Mestre de Obras",
      equipe: "Equipe Alvenaria",
      obra: "Comercial Center Norte",
      telefone: "(11) 99999-2222",
      email: "maria.santos@email.com",
      status: "Ativo"
    },
    {
      id: 3,
      nome: "Carlos Lima",
      funcao: "Eletricista",
      equipe: "Equipe Elétrica",
      obra: "Ponte Rio Azul",
      telefone: "(11) 99999-3333",
      email: "carlos.lima@email.com",
      status: "Férias"
    },
    {
      id: 4,
      nome: "Ana Costa",
      funcao: "Pedreiro",
      equipe: "Equipe Alvenaria",
      obra: "Hospital Regional Sul",
      telefone: "(11) 99999-4444",
      email: "ana.costa@email.com",
      status: "Ativo"
    },
    {
      id: 5,
      nome: "Roberto Oliveira",
      funcao: "Operador de Máquinas",
      equipe: "Equipe Terraplanagem",
      obra: "Residencial Vista Verde",
      telefone: "(11) 99999-5555",
      email: "roberto.oliveira@email.com",
      status: "Licença"
    }
  ];

  const filteredEquipes = equipes.filter(membro =>
    membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.equipe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.obra.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditMembro = (membro: any) => {
    console.log("Editando membro:", membro);
    // Implementar lógica de edição
  };

  const handleDeleteMembro = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este colaborador?")) {
      console.log("Excluindo membro:", id);
      // Implementar lógica de exclusão
    }
  };

  // Funções para adicionar novas opções
  const handleAddNovaFuncao = (novaFuncao: string) => {
    if (!funcoesDisponiveis.includes(novaFuncao)) {
      setFuncoesDisponiveis(prev => [...prev, novaFuncao]);
    }
  };

  const handleAddNovaEquipe = (novaEquipe: string) => {
    if (!equipesDisponiveis.includes(novaEquipe)) {
      setEquipesDisponiveis(prev => [...prev, novaEquipe]);
    }
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
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" placeholder="Nome do colaborador" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="funcao">Função</Label>
                  <AutocompleteInput
                    value={selectedFuncao}
                    onValueChange={setSelectedFuncao}
                    placeholder="Digite ou selecione uma função"
                    options={funcoesDisponiveis}
                    onAddNewOption={handleAddNovaFuncao}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipe">Equipe</Label>
                  <AutocompleteInput
                    value={selectedEquipe}
                    onValueChange={setSelectedEquipe}
                    placeholder="Digite ou selecione uma equipe"
                    options={equipesDisponiveis}
                    onAddNewOption={handleAddNovaEquipe}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obra">Obra Vinculada</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obra1">Residencial Vista Verde</SelectItem>
                    <SelectItem value="obra2">Comercial Center Norte</SelectItem>
                    <SelectItem value="obra3">Ponte Rio Azul</SelectItem>
                    <SelectItem value="obra4">Hospital Regional Sul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setSelectedFuncao("");
                setSelectedEquipe("");
              }}>
                Cancelar
              </Button>
              <Button className="gradient-construction border-0" onClick={() => {
                setIsDialogOpen(false);
                setSelectedFuncao("");
                setSelectedEquipe("");
              }}>
                Cadastrar
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar */}
        <div className="w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, função, equipe ou obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEquipes.map((membro) => (
            <EquipeExpandableCard
              key={membro.id}
              membro={membro}
              onEdit={handleEditMembro}
              onDelete={handleDeleteMembro}
            />
          ))}
        </div>

        {filteredEquipes.length === 0 && (
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