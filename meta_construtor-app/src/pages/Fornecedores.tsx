import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FornecedorExpandableCard } from "@/components/FornecedorExpandableCard";
import { Truck, Search, Plus } from "lucide-react";

const Fornecedores = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fornecedores = [
    {
      id: 1,
      nome: "Cimento Forte Ltda",
      categoria: "Materiais de Construção",
      cnpj: "12.345.678/0001-90",
      telefone: "(11) 3456-7890",
      email: "contato@cimentoforte.com.br",
      endereco: "Rua das Indústrias, 500 - São Paulo - SP",
      contato: "Carlos Silva",
      status: "Ativo",
      avaliacao: 4.5,
      observacoes: "Fornecedor confiável, entrega pontual",
      ultimoPedido: "2024-01-10",
      totalPedidos: 15
    },
    {
      id: 2,
      nome: "Aço & Ferro Distribuidora",
      categoria: "Estruturas Metálicas",
      cnpj: "98.765.432/0001-10",
      telefone: "(11) 2345-6789",
      email: "vendas@acoferro.com.br",
      endereco: "Av. Industrial, 1200 - Guarulhos - SP",
      contato: "Maria Santos",
      status: "Ativo",
      avaliacao: 4.8,
      observacoes: "Melhor preço da região para estruturas metálicas",
      ultimoPedido: "2024-01-12",
      totalPedidos: 8
    },
    {
      id: 3,
      nome: "Elétrica Total",
      categoria: "Materiais Elétricos",
      cnpj: "11.222.333/0001-44",
      telefone: "(11) 4567-8901",
      email: "orcamento@eletricatotal.com.br",
      endereco: "Rua dos Eletricistas, 250 - São Paulo - SP",
      contato: "João Oliveira",
      status: "Inativo",
      avaliacao: 3.2,
      observacoes: "Problemas com qualidade dos produtos",
      ultimoPedido: "2023-11-20",
      totalPedidos: 3
    },
    {
      id: 4,
      nome: "Hidráulica Pro",
      categoria: "Materiais Hidráulicos",
      cnpj: "55.666.777/0001-88",
      telefone: "(11) 5678-9012",
      email: "contato@hidraulicapro.com.br",
      endereco: "Av. das Águas, 800 - Osasco - SP",
      contato: "Ana Costa",
      status: "Ativo",
      avaliacao: 4.2,
      observacoes: "Bom atendimento, preços competitivos",
      ultimoPedido: "2024-01-14",
      totalPedidos: 12
    },
    {
      id: 5,
      nome: "Ferramentas & Equipamentos Ltda",
      categoria: "Ferramentas e Equipamentos",
      cnpj: "33.444.555/0001-66",
      telefone: "(11) 6789-0123",
      email: "aluguel@ferramentasequip.com.br",
      endereco: "Rua da Ferramenta, 350 - São Bernardo - SP",
      contato: "Roberto Lima",
      status: "Pendente",
      avaliacao: 4.0,
      observacoes: "Novo fornecedor, ainda em avaliação",
      ultimoPedido: null,
      totalPedidos: 0
    }
  ];

  const categorias = [
    "Materiais de Construção",
    "Estruturas Metálicas",
    "Materiais Elétricos",
    "Materiais Hidráulicos",
    "Ferramentas e Equipamentos",
    "Tintas e Acabamentos",
    "Madeira",
    "Serviços Especializados"
  ];

  const statusOptions = ["Ativo", "Inativo", "Pendente"];

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.contato.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || selectedCategoria === "all" || fornecedor.categoria === selectedCategoria;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || fornecedor.status === selectedStatus;
    
    return matchesSearch && matchesCategoria && matchesStatus;
  });

  const handleEditFornecedor = (fornecedor: any) => {
    console.log("Editando fornecedor:", fornecedor);
    // Implementar lógica de edição
  };

  const handleDeleteFornecedor = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      console.log("Excluindo fornecedor:", id);
      // Implementar lógica de exclusão
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground text-sm md:text-base">Gerencie sua rede de fornecedores e parceiros</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-construction border-0 hover:opacity-90 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Cadastrar Novo Fornecedor</DialogTitle>
              <DialogDescription>
                Adicione um novo fornecedor ao seu cadastro
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Empresa</Label>
                  <Input id="nome" placeholder="Ex: Cimento Forte Ltda" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contato">Contato Principal</Label>
                  <Input id="contato" placeholder="Nome do responsável" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="contato@empresa.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" placeholder="Rua, número - Cidade - Estado" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" placeholder="Informações adicionais sobre o fornecedor" />
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

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, categoria ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex items-end">
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setSelectedCategoria("all");
              setSelectedStatus("all");
            }}
            className="w-full"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredFornecedores.map((fornecedor) => (
          <FornecedorExpandableCard
            key={fornecedor.id}
            fornecedor={fornecedor}
            onEdit={handleEditFornecedor}
            onDelete={handleDeleteFornecedor}
          />
        ))}
      </div>

      {filteredFornecedores.length === 0 && (
        <div className="text-center py-12">
          <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-card-foreground">Nenhum fornecedor encontrado</h3>
          <p className="mt-2 text-muted-foreground">
            {searchTerm || selectedCategoria || selectedStatus 
              ? "Tente ajustar os filtros de busca" 
              : "Comece cadastrando seu primeiro fornecedor"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Fornecedores;