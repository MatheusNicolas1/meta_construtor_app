import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EquipamentoExpandableCard } from "@/components/EquipamentoExpandableCard";
import { Wrench, Search, Plus } from "lucide-react";

const Equipamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const equipamentos = [
    {
      id: 1,
      nome: "Betoneira B-400",
      categoria: "Concreto",
      modelo: "B-400L",
      status: "Ativo",
      obra: "Residencial Vista Verde",
      localizacao: "Canteiro Central",
      proximaManutencao: "2024-02-15",
      observacoes: "Funcionando perfeitamente"
    },
    {
      id: 2,
      nome: "Grua Torre GTR-50",
      categoria: "Elevação",
      modelo: "GTR-50T",
      status: "Ativo",
      obra: "Comercial Center Norte",
      localizacao: "Torre 1",
      proximaManutencao: "2024-03-01",
      observacoes: "Revisão em dia"
    },
    {
      id: 3,
      nome: "Compressor AR-200",
      categoria: "Pneumático",
      modelo: "AR-200HP",
      status: "Manutenção",
      obra: "Ponte Rio Azul",
      localizacao: "Oficina",
      proximaManutencao: "2024-01-20",
      observacoes: "Troca de filtros necessária"
    },
    {
      id: 4,
      nome: "Escavadeira CAT-320",
      categoria: "Terraplanagem",
      modelo: "CAT320DL",
      status: "Disponível",
      obra: "Hospital Regional Sul",
      localizacao: "Pátio de Equipamentos",
      proximaManutencao: "2024-02-28",
      observacoes: "Pronto para uso"
    },
    {
      id: 5,
      nome: "Vibrador de Concreto VC-45",
      categoria: "Concreto",
      modelo: "VC-45mm",
      status: "Ativo",
      obra: "Residencial Vista Verde",
      localizacao: "Canteiro Laje 3º Andar",
      proximaManutencao: "2024-01-25",
      observacoes: "Em uso na concretagem"
    }
  ];

  const filteredEquipamentos = equipamentos.filter(equipamento =>
    equipamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipamento.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipamento.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipamento.obra.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditEquipamento = (equipamento: any) => {
    console.log("Editando equipamento:", equipamento);
    // Implementar lógica de edição
  };

  const handleDeleteEquipamento = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este equipamento?")) {
      console.log("Excluindo equipamento:", id);
      // Implementar lógica de exclusão
    }
  };

  return (
    <div className="responsive-spacing">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">Gestão de Equipamentos</h1>
            <p className="text-muted-foreground text-sm md:text-base">Controle e monitore todos os equipamentos das obras</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto sm:flex-shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Novo Equipamento</span>
                <span className="sm:hidden">Adicionar</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Cadastrar Novo Equipamento</DialogTitle>
              <DialogDescription>
                Adicione um novo equipamento ao inventário
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Equipamento</Label>
                <Input id="nome" placeholder="Ex: Betoneira B-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concreto">Concreto</SelectItem>
                      <SelectItem value="elevacao">Elevação</SelectItem>
                      <SelectItem value="pneumatico">Pneumático</SelectItem>
                      <SelectItem value="terraplanagem">Terraplanagem</SelectItem>
                      <SelectItem value="corte">Corte e Furação</SelectItem>
                      <SelectItem value="medicao">Medição</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" placeholder="Modelo do equipamento" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obra">Obra Vinculada</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="obra1">Residencial Vista Verde</SelectItem>
                    <SelectItem value="obra2">Comercial Center Norte</SelectItem>
                    <SelectItem value="obra3">Ponte Rio Azul</SelectItem>
                    <SelectItem value="obra4">Hospital Regional Sul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input id="localizacao" placeholder="Local atual do equipamento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manutencao">Próxima Manutenção</Label>
                  <Input id="manutencao" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input id="observacoes" placeholder="Observações sobre o equipamento" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="gradient-construction border-0" onClick={() => setIsDialogOpen(false)}>
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
              placeholder="Buscar por nome, categoria, status ou obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEquipamentos.map((equipamento) => (
            <EquipamentoExpandableCard
              key={equipamento.id}
              equipamento={equipamento}
              onEdit={handleEditEquipamento}
              onDelete={handleDeleteEquipamento}
            />
          ))}
        </div>

        {filteredEquipamentos.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-card-foreground">Nenhum equipamento encontrado</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? "Tente ajustar os termos de busca" : "Comece cadastrando seu primeiro equipamento"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipamentos;