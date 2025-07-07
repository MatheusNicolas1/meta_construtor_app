
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
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  User,
  Building,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Atividade {
  id: number;
  nome: string;
  categoria: string;
  unidade: string;
  descricao: string;
  duracaoEstimada: number;
  status: 'ativa' | 'inativa';
  obraVinculada?: string;
  dataCriacao: string;
}

export default function Activities() {
  const { toast } = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [editandoAtividade, setEditandoAtividade] = useState<Atividade | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    unidade: 'm²',
    descricao: '',
    duracaoEstimada: 1,
    status: 'ativa' as 'ativa' | 'inativa'
  });

  const [atividades] = useState<Atividade[]>([
    {
      id: 1,
      nome: 'Fundação',
      categoria: 'Estrutural',
      unidade: 'm³',
      descricao: 'Escavação e concretagem da fundação',
      duracaoEstimada: 7,
      status: 'ativa',
      obraVinculada: 'Shopping Center Norte',
      dataCriacao: '2024-01-15'
    },
    {
      id: 2,
      nome: 'Alvenaria',
      categoria: 'Vedação',
      unidade: 'm²',
      descricao: 'Execução de paredes em blocos cerâmicos',
      duracaoEstimada: 14,
      status: 'ativa',
      obraVinculada: 'Residencial Jardins',
      dataCriacao: '2024-01-20'
    },
    {
      id: 3,
      nome: 'Instalações Elétricas',
      categoria: 'Instalações',
      unidade: 'ponto',
      descricao: 'Execução de pontos elétricos e passagem de fiação',
      duracaoEstimada: 10,
      status: 'ativa',
      dataCriacao: '2024-02-01'
    }
  ]);

  const categorias = ['Estrutural', 'Vedação', 'Instalações', 'Acabamento', 'Cobertura'];
  const unidades = ['m²', 'm³', 'un', 'kg', 'metro', 'ponto', 'vb'];

  const atividadesFiltradas = atividades.filter(atividade => {
    const matchesBusca = atividade.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                        atividade.categoria.toLowerCase().includes(termoBusca.toLowerCase());
    const matchesCategoria = filtroCategoria === 'todas' || atividade.categoria === filtroCategoria;
    return matchesBusca && matchesCategoria;
  });

  const handleSalvar = () => {
    if (!formData.nome || !formData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e categoria da atividade.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: editandoAtividade ? "Atividade atualizada!" : "Atividade criada!",
      description: `A atividade "${formData.nome}" foi ${editandoAtividade ? 'atualizada' : 'criada'} com sucesso.`
    });

    handleFecharModal();
  };

  const handleEditar = (atividade: Atividade) => {
    setEditandoAtividade(atividade);
    setFormData({
      nome: atividade.nome,
      categoria: atividade.categoria,
      unidade: atividade.unidade,
      descricao: atividade.descricao,
      duracaoEstimada: atividade.duracaoEstimada,
      status: atividade.status
    });
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setEditandoAtividade(null);
    setFormData({
      nome: '',
      categoria: '',
      unidade: 'm²',
      descricao: '',
      duracaoEstimada: 1,
      status: 'ativa'
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'ativa' 
      ? 'bg-green-500/20 text-green-700 dark:text-green-400'
      : 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
  };

  return (
    <Layout>
      <div className="section-container animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          <div className="space-y-2">
            <h1 className="page-title">Atividades</h1>
            <p className="page-description">
              Gerencie as atividades padrão do sistema
            </p>
          </div>
          
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <Button className="btn-standard">
                <Plus className="h-4 w-4" />
                Nova Atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editandoAtividade ? 'Editar Atividade' : 'Nova Atividade'}
                </DialogTitle>
                <DialogDescription>
                  {editandoAtividade ? 'Atualize as informações da atividade' : 'Cadastre uma nova atividade padrão'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Atividade *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: Fundação, Alvenaria..."
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
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select value={formData.unidade} onValueChange={(value) => setFormData({...formData, unidade: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map(unidade => (
                          <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duracao">Duração Estimada (dias)</Label>
                    <Input
                      id="duracao"
                      type="number"
                      min="1"
                      value={formData.duracaoEstimada}
                      onChange={(e) => setFormData({...formData, duracaoEstimada: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'ativa' | 'inativa') => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="inativa">Inativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descreva a atividade e suas características"
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
                  {editandoAtividade ? 'Atualizar' : 'Criar'} Atividade
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="card-standard">
          <CardContent className="card-content">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar atividades..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Atividades */}
        <Card className="card-standard">
          <CardHeader className="card-header">
            <CardTitle>Atividades Cadastradas ({atividadesFiltradas.length})</CardTitle>
          </CardHeader>
          <CardContent className="card-content">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Duração Est.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Obra Vinculada</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atividadesFiltradas.map((atividade) => (
                    <TableRow key={atividade.id}>
                      <TableCell className="font-medium">{atividade.nome}</TableCell>
                      <TableCell>{atividade.categoria}</TableCell>
                      <TableCell>{atividade.unidade}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {atividade.duracaoEstimada} dias
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(atividade.status)}>
                          {atividade.status === 'ativa' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {atividade.obraVinculada ? (
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{atividade.obraVinculada}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Não vinculada</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditar(atividade)}
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

            {atividadesFiltradas.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma atividade encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {termoBusca || filtroCategoria !== 'todas' 
                    ? 'Ajuste os filtros ou crie uma nova atividade' 
                    : 'Comece criando sua primeira atividade'}
                </p>
                <Button onClick={() => setModalAberto(true)} className="btn-standard">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Atividade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
