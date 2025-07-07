
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  Calendar,
  DollarSign,
  MapPin,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Equipamento {
  id: number;
  nome: string;
  categoria: string;
  tipo: 'proprio' | 'alugado';
  valorDiario: number;
  status: 'disponivel' | 'em-uso' | 'manutencao' | 'quebrado';
  obraAtual?: string;
  dataAquisicao: string;
  proximaManutencao?: string;
  observacoes?: string;
}

export default function Equipment() {
  const { toast } = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [editandoEquipamento, setEditandoEquipamento] = useState<Equipamento | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    tipo: 'proprio' as 'proprio' | 'alugado',
    valorDiario: 0,
    status: 'disponivel' as 'disponivel' | 'em-uso' | 'manutencao' | 'quebrado',
    dataAquisicao: '',
    proximaManutencao: '',
    observacoes: ''
  });

  const [equipamentos] = useState<Equipamento[]>([
    {
      id: 1,
      nome: 'Betoneira 400L',
      categoria: 'Concreto',
      tipo: 'proprio',
      valorDiario: 80,
      status: 'em-uso',
      obraAtual: 'Shopping Center Norte',
      dataAquisicao: '2023-06-15',
      proximaManutencao: '2024-06-15',
      observacoes: 'Equipamento em bom estado'
    },
    {
      id: 2,
      nome: 'Guindaste 20t',
      categoria: 'Elevação',
      tipo: 'alugado',
      valorDiario: 350,
      status: 'em-uso',
      obraAtual: 'Torre Empresarial',
      dataAquisicao: '2024-01-10'
    },
    {
      id: 3,
      nome: 'Escavadeira Caterpillar',
      categoria: 'Terraplenagem',
      tipo: 'proprio',
      valorDiario: 450,
      status: 'manutencao',
      dataAquisicao: '2022-03-20',
      proximaManutencao: '2024-03-20',
      observacoes: 'Manutenção preventiva programada'
    },
    {
      id: 4,
      nome: 'Compressor 10HP',
      categoria: 'Pneumático',
      tipo: 'proprio',
      valorDiario: 120,
      status: 'disponivel',
      dataAquisicao: '2023-09-12'
    }
  ]);

  const categorias = ['Concreto', 'Elevação', 'Terraplenagem', 'Pneumático', 'Soldagem', 'Corte', 'Transporte'];

  const equipamentosFiltrados = equipamentos.filter(equipamento => {
    const matchesBusca = equipamento.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                        equipamento.categoria.toLowerCase().includes(termoBusca.toLowerCase());
    const matchesCategoria = filtroCategoria === 'todas' || equipamento.categoria === filtroCategoria;
    const matchesTipo = filtroTipo === 'todos' || equipamento.tipo === filtroTipo;
    const matchesStatus = filtroStatus === 'todos' || equipamento.status === filtroStatus;
    
    return matchesBusca && matchesCategoria && matchesTipo && matchesStatus;
  });

  const handleSalvar = () => {
    if (!formData.nome || !formData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e categoria do equipamento.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: editandoEquipamento ? "Equipamento atualizado!" : "Equipamento cadastrado!",
      description: `O equipamento "${formData.nome}" foi ${editandoEquipamento ? 'atualizado' : 'cadastrado'} com sucesso.`
    });

    handleFecharModal();
  };

  const handleEditar = (equipamento: Equipamento) => {
    setEditandoEquipamento(equipamento);
    setFormData({
      nome: equipamento.nome,
      categoria: equipamento.categoria,
      tipo: equipamento.tipo,
      valorDiario: equipamento.valorDiario,
      status: equipamento.status,
      dataAquisicao: equipamento.dataAquisicao,
      proximaManutencao: equipamento.proximaManutencao || '',
      observacoes: equipamento.observacoes || ''
    });
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setEditandoEquipamento(null);
    setFormData({
      nome: '',
      categoria: '',
      tipo: 'proprio',
      valorDiario: 0,
      status: 'disponivel',
      dataAquisicao: '',
      proximaManutencao: '',
      observacoes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'em-uso': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'manutencao': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'quebrado': return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'em-uso': return 'Em Uso';
      case 'manutencao': return 'Manutenção';
      case 'quebrado': return 'Quebrado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout>
      <div className="section-container animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          <div className="space-y-2">
            <h1 className="page-title">Equipamentos</h1>
            <p className="page-description">
              Gerencie equipamentos próprios e alugados
            </p>
          </div>
          
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <Button className="btn-standard">
                <Plus className="h-4 w-4" />
                Novo Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editandoEquipamento ? 'Editar Equipamento' : 'Novo Equipamento'}
                </DialogTitle>
                <DialogDescription>
                  {editandoEquipamento ? 'Atualize as informações do equipamento' : 'Cadastre um novo equipamento'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Equipamento *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: Betoneira 400L"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(categoria => (
                          <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value: 'proprio' | 'alugado') => setFormData({...formData, tipo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proprio">Próprio</SelectItem>
                        <SelectItem value="alugado">Alugado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valorDiario">Valor Diário (R$)</Label>
                    <Input
                      id="valorDiario"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valorDiario}
                      onChange={(e) => setFormData({...formData, valorDiario: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'disponivel' | 'em-uso' | 'manutencao' | 'quebrado') => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="em-uso">Em Uso</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="quebrado">Quebrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataAquisicao">Data de Aquisição</Label>
                    <Input
                      id="dataAquisicao"
                      type="date"
                      value={formData.dataAquisicao}
                      onChange={(e) => setFormData({...formData, dataAquisicao: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proximaManutencao">Próxima Manutenção</Label>
                    <Input
                      id="proximaManutencao"
                      type="date"
                      value={formData.proximaManutencao}
                      onChange={(e) => setFormData({...formData, proximaManutencao: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    placeholder="Observações sobre o equipamento"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleFecharModal} className="flex-1">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSalvar} className="flex-1 btn-standard">
                  {editandoEquipamento ? 'Atualizar' : 'Cadastrar'} Equipamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="card-standard">
          <CardContent className="card-content">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar equipamentos..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as categorias</SelectItem>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="proprio">Próprio</SelectItem>
                    <SelectItem value="alugado">Alugado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="em-uso">Em Uso</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="quebrado">Quebrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Equipamentos */}
        <Card className="card-standard">
          <CardHeader className="card-header">
            <CardTitle>Equipamentos Cadastrados ({equipamentosFiltrados.length})</CardTitle>
          </CardHeader>
          <CardContent className="card-content">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor/Dia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Obra Atual</TableHead>
                    <TableHead>Próx. Manutenção</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipamentosFiltrados.map((equipamento) => (
                    <TableRow key={equipamento.id}>
                      <TableCell className="font-medium">{equipamento.nome}</TableCell>
                      <TableCell>{equipamento.categoria}</TableCell>
                      <TableCell>
                        <Badge variant={equipamento.tipo === 'proprio' ? 'default' : 'secondary'}>
                          {equipamento.tipo === 'proprio' ? 'Próprio' : 'Alugado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {formatCurrency(equipamento.valorDiario)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(equipamento.status)}>
                          {getStatusText(equipamento.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {equipamento.obraAtual ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{equipamento.obraAtual}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {equipamento.proximaManutencao ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(equipamento.proximaManutencao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditar(equipamento)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {equipamentosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum equipamento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {termoBusca || filtroCategoria !== 'todas' || filtroTipo !== 'todos' || filtroStatus !== 'todos'
                    ? 'Ajuste os filtros ou cadastre um novo equipamento' 
                    : 'Comece cadastrando seu primeiro equipamento'}
                </p>
                <Button onClick={() => setModalAberto(true)} className="btn-standard">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Equipamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
