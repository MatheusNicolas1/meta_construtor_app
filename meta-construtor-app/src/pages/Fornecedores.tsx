
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Building, Truck, FileText, Phone, Mail, Calendar, User } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  contato: string;
  telefone: string;
  email: string;
  servico: string;
  status: 'ativo' | 'inativo';
  dataUltimoContrato: string;
}

interface Contrato {
  id: number;
  fornecedorId: number;
  fornecedorNome: string;
  obra: string;
  servico: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  status: 'ativo' | 'vencido' | 'cancelado';
  arquivo?: string;
}

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([
    {
      id: 1,
      nome: 'Construtora Silva & Cia',
      cnpj: '12.345.678/0001-90',
      contato: 'João Silva',
      telefone: '(11) 99999-0001',
      email: 'joao@silvaecia.com',
      servico: 'Estrutura e Alvenaria',
      status: 'ativo',
      dataUltimoContrato: '2024-01-15'
    },
    {
      id: 2,
      nome: 'Elétrica Santos',
      cnpj: '98.765.432/0001-10',
      contato: 'Maria Santos',
      telefone: '(11) 99999-0002',
      email: 'maria@eletricasantos.com',
      servico: 'Instalações Elétricas',
      status: 'ativo',
      dataUltimoContrato: '2024-01-10'
    },
    {
      id: 3,
      nome: 'Hidráulica Express',
      cnpj: '11.222.333/0001-44',
      contato: 'Carlos Oliveira',
      telefone: '(11) 99999-0003',
      email: 'carlos@hidraulicaexpress.com',
      servico: 'Instalações Hidráulicas',
      status: 'inativo',
      dataUltimoContrato: '2023-12-20'
    }
  ]);

  const [contratos, setContratos] = useState<Contrato[]>([
    {
      id: 1,
      fornecedorId: 1,
      fornecedorNome: 'Construtora Silva & Cia',
      obra: 'Shopping Center Norte',
      servico: 'Estrutura Completa',
      valor: 250000,
      dataInicio: '2024-01-15',
      dataFim: '2024-06-15',
      status: 'ativo'
    },
    {
      id: 2,
      fornecedorId: 2,
      fornecedorNome: 'Elétrica Santos',
      obra: 'Residencial Jardins',
      servico: 'Instalação Elétrica Predial',
      valor: 85000,
      dataInicio: '2024-01-10',
      dataFim: '2024-04-10',
      status: 'ativo'
    }
  ]);

  const [isDialogFornecedorOpen, setIsDialogFornecedorOpen] = useState(false);
  const [isDialogContratoOpen, setIsDialogContratoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterServico, setFilterServico] = useState('all');

  const [newFornecedor, setNewFornecedor] = useState({
    nome: '',
    cnpj: '',
    contato: '',
    telefone: '',
    email: '',
    servico: '',
    status: 'ativo' as const
  });

  const [newContrato, setNewContrato] = useState({
    fornecedorId: 0,
    obra: '',
    servico: '',
    valor: 0,
    dataInicio: '',
    dataFim: ''
  });

  const obras = ['Shopping Center Norte', 'Residencial Jardins', 'Torre Empresarial'];
  const servicos = [
    'Estrutura e Alvenaria',
    'Instalações Elétricas', 
    'Instalações Hidráulicas',
    'Acabamentos',
    'Pintura',
    'Paisagismo',
    'Segurança',
    'Limpeza'
  ];

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchSearch = !searchTerm || 
      fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.cnpj.includes(searchTerm) ||
      fornecedor.contato.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || fornecedor.status === filterStatus;
    const matchServico = filterServico === 'all' || fornecedor.servico === filterServico;
    
    return matchSearch && matchStatus && matchServico;
  });

  const handleSubmitFornecedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fornecedor: Fornecedor = {
        id: fornecedores.length + 1,
        ...newFornecedor,
        dataUltimoContrato: new Date().toISOString().split('T')[0]
      };
      
      setFornecedores([...fornecedores, fornecedor]);
      setNewFornecedor({
        nome: '',
        cnpj: '',
        contato: '',
        telefone: '',
        email: '',
        servico: '',
        status: 'ativo'
      });
      setIsDialogFornecedorOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar fornecedor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitContrato = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fornecedor = fornecedores.find(f => f.id === newContrato.fornecedorId);
      if (!fornecedor) return;

      const contrato: Contrato = {
        id: contratos.length + 1,
        fornecedorNome: fornecedor.nome,
        ...newContrato,
        status: 'ativo'
      };
      
      setContratos([...contratos, contrato]);
      setNewContrato({
        fornecedorId: 0,
        obra: '',
        servico: '',
        valor: 0,
        dataInicio: '',
        dataFim: ''
      });
      setIsDialogContratoOpen(false);
    } catch (error) {
      console.error('Erro ao cadastrar contrato:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground">Gerencie fornecedores e contratos das suas obras</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogFornecedorOpen} onOpenChange={setIsDialogFornecedorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Fornecedor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Novo Fornecedor</DialogTitle>
                  <DialogDescription>Cadastre um novo fornecedor</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                  <LoadingSpinner size="lg" text="Cadastrando fornecedor..." />
                ) : (
                  <form onSubmit={handleSubmitFornecedor} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="nome">Nome da Empresa</Label>
                        <Input
                          id="nome"
                          value={newFornecedor.nome}
                          onChange={(e) => setNewFornecedor({ ...newFornecedor, nome: e.target.value })}
                          placeholder="Nome da empresa"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          value={newFornecedor.cnpj}
                          onChange={(e) => setNewFornecedor({ ...newFornecedor, cnpj: e.target.value })}
                          placeholder="00.000.000/0000-00"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="contato">Pessoa de Contato</Label>
                        <Input
                          id="contato"
                          value={newFornecedor.contato}
                          onChange={(e) => setNewFornecedor({ ...newFornecedor, contato: e.target.value })}
                          placeholder="Nome do responsável"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={newFornecedor.telefone}
                          onChange={(e) => setNewFornecedor({ ...newFornecedor, telefone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newFornecedor.email}
                          onChange={(e) => setNewFornecedor({ ...newFornecedor, email: e.target.value })}
                          placeholder="email@exemplo.com"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="servico">Tipo de Serviço</Label>
                        <Select value={newFornecedor.servico} onValueChange={(value) => setNewFornecedor({ ...newFornecedor, servico: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de serviço" />
                          </SelectTrigger>
                          <SelectContent>
                            {servicos.map((servico) => (
                              <SelectItem key={servico} value={servico}>
                                {servico}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogFornecedorOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Cadastrar Fornecedor</Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogContratoOpen} onOpenChange={setIsDialogContratoOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Contrato
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Novo Contrato</DialogTitle>
                  <DialogDescription>Cadastre um novo contrato com fornecedor</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                  <LoadingSpinner size="lg" text="Cadastrando contrato..." />
                ) : (
                  <form onSubmit={handleSubmitContrato} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fornecedor">Fornecedor</Label>
                        <Select 
                          value={newContrato.fornecedorId.toString()} 
                          onValueChange={(value) => setNewContrato({ ...newContrato, fornecedorId: Number(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {fornecedores.filter(f => f.status === 'ativo').map((fornecedor) => (
                              <SelectItem key={fornecedor.id} value={fornecedor.id.toString()}>
                                {fornecedor.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="obra-contrato">Obra</Label>
                        <Select value={newContrato.obra} onValueChange={(value) => setNewContrato({ ...newContrato, obra: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a obra" />
                          </SelectTrigger>
                          <SelectContent>
                            {obras.map((obra) => (
                              <SelectItem key={obra} value={obra}>
                                {obra}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="servico-contrato">Serviço Contratado</Label>
                        <Input
                          id="servico-contrato"
                          value={newContrato.servico}
                          onChange={(e) => setNewContrato({ ...newContrato, servico: e.target.value })}
                          placeholder="Descrição do serviço"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="valor">Valor (R$)</Label>
                        <Input
                          id="valor"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newContrato.valor}
                          onChange={(e) => setNewContrato({ ...newContrato, valor: Number(e.target.value) })}
                          placeholder="0,00"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="data-inicio">Data de Início</Label>
                        <Input
                          id="data-inicio"
                          type="date"
                          value={newContrato.dataInicio}
                          onChange={(e) => setNewContrato({ ...newContrato, dataInicio: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="data-fim">Data de Término</Label>
                        <Input
                          id="data-fim"
                          type="date"
                          value={newContrato.dataFim}
                          onChange={(e) => setNewContrato({ ...newContrato, dataFim: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogContratoOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Cadastrar Contrato</Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fornecedores</p>
                  <p className="text-2xl font-bold">{fornecedores.length}</p>
                </div>
                <Truck className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {fornecedores.filter(f => f.status === 'ativo').length}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contratos</p>
                  <p className="text-2xl font-bold text-blue-600">{contratos.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {contratos.reduce((acc, c) => acc + c.valor, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar fornecedores..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterServico} onValueChange={setFilterServico}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {servicos.map((servico) => (
                    <SelectItem key={servico} value={servico}>
                      {servico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="fornecedores" className="space-y-6">
          <TabsList>
            <TabsTrigger value="fornecedores" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Fornecedores
            </TabsTrigger>
            <TabsTrigger value="contratos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contratos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fornecedores">
            <Card>
              <CardHeader>
                <CardTitle>Fornecedores ({filteredFornecedores.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredFornecedores.length === 0 ? (
                  <EmptyState
                    icon={<Truck className="h-12 w-12" />}
                    title="Nenhum fornecedor encontrado"
                    description="Não há fornecedores cadastrados ou que correspondam aos filtros aplicados. Clique em 'Novo Fornecedor' para começar."
                    actionLabel="Limpar Filtros"
                    onAction={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterServico('all');
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredFornecedores.map((fornecedor) => (
                      <div key={fornecedor.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-lg">{fornecedor.nome}</h4>
                              <Badge variant={fornecedor.status === 'ativo' ? 'default' : 'secondary'}>
                                {fornecedor.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">CNPJ:</span>
                                <p className="font-medium">{fornecedor.cnpj}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  Contato:
                                </span>
                                <p className="font-medium">{fornecedor.contato}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  Telefone:
                                </span>
                                <p className="font-medium">{fornecedor.telefone}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  E-mail:
                                </span>
                                <p className="font-medium">{fornecedor.email}</p>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <Badge variant="outline">{fornecedor.servico}</Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                            <Button variant="outline" size="sm">
                              Contratos
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contratos">
            <Card>
              <CardHeader>
                <CardTitle>Contratos ({contratos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {contratos.length === 0 ? (
                  <EmptyState
                    icon={<FileText className="h-12 w-12" />}
                    title="Nenhum contrato encontrado"
                    description="Não há contratos cadastrados. Clique em 'Novo Contrato' para começar."
                    actionLabel="Novo Contrato"
                    onAction={() => setIsDialogContratoOpen(true)}
                  />
                ) : (
                  <div className="space-y-4">
                    {contratos.map((contrato) => (
                      <div key={contrato.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{contrato.fornecedorNome}</h4>
                              <Badge variant={contrato.status === 'ativo' ? 'default' : contrato.status === 'vencido' ? 'destructive' : 'secondary'}>
                                {contrato.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Obra:</span>
                                <p className="font-medium">{contrato.obra}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Serviço:</span>
                                <p className="font-medium">{contrato.servico}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Valor:</span>
                                <p className="font-medium text-green-600">R$ {contrato.valor.toLocaleString('pt-BR')}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Período:</span>
                                <p className="font-medium">
                                  {new Date(contrato.dataInicio).toLocaleDateString('pt-BR')} - {new Date(contrato.dataFim).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              Ver Contrato
                            </Button>
                            <Button variant="outline" size="sm">
                              Renovar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
