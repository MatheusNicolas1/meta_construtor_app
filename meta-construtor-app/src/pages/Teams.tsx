import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Users, 
  User, 
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Colaborador {
  id: number;
  nome: string;
  funcao: string;
  telefone: string;
  email: string;
  status: 'ativo' | 'inativo';
  equipeId?: number;
}

interface Equipe {
  id: number;
  nome: string;
  lider: string;
  membros: number[];
  obraAtual?: string;
  status: 'ativa' | 'inativa' | 'disponivel';
  dataCriacao: string;
}

export default function Teams() {
  const { toast } = useToast();
  const [modalEquipeAberto, setModalEquipeAberto] = useState(false);
  const [modalColaboradorAberto, setModalColaboradorAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [visualizacao, setVisualizacao] = useState<'equipes' | 'colaboradores'>('equipes');

  const [formDataEquipe, setFormDataEquipe] = useState({
    nome: '',
    lider: '',
    membros: [] as number[],
    status: 'disponivel' as 'ativa' | 'inativa' | 'disponivel'
  });

  const [formDataColaborador, setFormDataColaborador] = useState({
    nome: '',
    funcao: '',
    telefone: '',
    email: '',
    status: 'ativo' as 'ativo' | 'inativo'
  });

  const [colaboradores] = useState<Colaborador[]>([
    {
      id: 1,
      nome: 'João Silva',
      funcao: 'Pedreiro',
      telefone: '(11) 99999-0001',
      email: 'joao@email.com',
      status: 'ativo',
      equipeId: 1
    },
    {
      id: 2,
      nome: 'Maria Santos',
      funcao: 'Servente',
      telefone: '(11) 99999-0002',
      email: 'maria@email.com',
      status: 'ativo',
      equipeId: 1
    },
    {
      id: 3,
      nome: 'Carlos Lima',
      funcao: 'Eletricista',
      telefone: '(11) 99999-0003',
      email: 'carlos@email.com',
      status: 'ativo',
      equipeId: 2
    },
    {
      id: 4,
      nome: 'Ana Costa',
      funcao: 'Engenheira',
      telefone: '(11) 99999-0004',
      email: 'ana@email.com',
      status: 'ativo'
    }
  ]);

  const [equipes] = useState<Equipe[]>([
    {
      id: 1,
      nome: 'Equipe Alpha',
      lider: 'João Silva',
      membros: [1, 2],
      obraAtual: 'Shopping Center Norte',
      status: 'ativa',
      dataCriacao: '2024-01-15'
    },
    {
      id: 2,
      nome: 'Equipe Beta',
      lider: 'Carlos Lima',
      membros: [3],
      obraAtual: 'Residencial Jardins',
      status: 'ativa',
      dataCriacao: '2024-01-20'
    },
    {
      id: 3,
      nome: 'Equipe Charlie',
      lider: 'Ana Costa',
      membros: [4],
      status: 'disponivel',
      dataCriacao: '2024-02-01'
    }
  ]);

  const funcoes = ['Pedreiro', 'Servente', 'Eletricista', 'Encanador', 'Pintor', 'Carpinteiro', 'Engenheiro', 'Mestre de Obras', 'Operador de Máquinas'];

  const colaboradoresDisponiveis = colaboradores.filter(c => !c.equipeId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': case 'ativo': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'disponivel': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'inativa': case 'inativo': return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const getMembrosEquipe = (membrosIds: number[]) => {
    return colaboradores.filter(c => membrosIds.includes(c.id));
  };

  const handleSalvarEquipe = () => {
    if (!formDataEquipe.nome || !formDataEquipe.lider) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome da equipe e selecione um líder.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Equipe criada!",
      description: `A equipe "${formDataEquipe.nome}" foi criada com sucesso.`
    });

    handleFecharModalEquipe();
  };

  const handleSalvarColaborador = () => {
    if (!formDataColaborador.nome || !formDataColaborador.funcao) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e a função do colaborador.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Colaborador cadastrado!",
      description: `${formDataColaborador.nome} foi cadastrado com sucesso.`
    });

    handleFecharModalColaborador();
  };

  const handleFecharModalEquipe = () => {
    setModalEquipeAberto(false);
    setFormDataEquipe({
      nome: '',
      lider: '',
      membros: [],
      status: 'disponivel'
    });
  };

  const handleFecharModalColaborador = () => {
    setModalColaboradorAberto(false);
    setFormDataColaborador({
      nome: '',
      funcao: '',
      telefone: '',
      email: '',
      status: 'ativo'
    });
  };

  const equipesFiltradasd = equipes.filter(equipe =>
    equipe.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    equipe.lider.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const colaboradoresFiltrados = colaboradores.filter(colaborador =>
    colaborador.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    colaborador.funcao.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <Layout>
      <div className="section-container animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          <div className="space-y-2">
            <h1 className="page-title">Equipes & Colaboradores</h1>
            <p className="page-description">
              Gerencie equipes e colaboradores do sistema
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={modalColaboradorAberto} onOpenChange={setModalColaboradorAberto}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <User className="h-4 w-4" />
                  Novo Colaborador
                </Button>
              </DialogTrigger>
            </Dialog>

            <Dialog open={modalEquipeAberto} onOpenChange={setModalEquipeAberto}>
              <DialogTrigger asChild>
                <Button className="btn-standard">
                  <Plus className="h-4 w-4" />
                  Nova Equipe
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Filtros e Visualização */}
        <Card className="card-standard">
          <CardContent className="card-content">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar equipes ou colaboradores..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={visualizacao === 'equipes' ? 'default' : 'outline'}
                  onClick={() => setVisualizacao('equipes')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Equipes
                </Button>
                <Button
                  variant={visualizacao === 'colaboradores' ? 'default' : 'outline'}
                  onClick={() => setVisualizacao('colaboradores')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Colaboradores
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Equipes */}
        {visualizacao === 'equipes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipesFiltradasd.map((equipe) => {
              const membros = getMembrosEquipe(equipe.membros);
              return (
                <Card key={equipe.id} className="card-standard">
                  <CardHeader className="card-header">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{equipe.nome}</CardTitle>
                      <Badge className={getStatusColor(equipe.status)}>
                        {equipe.status === 'ativa' ? 'Ativa' : equipe.status === 'disponivel' ? 'Disponível' : 'Inativa'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="card-content space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Líder:</span>
                        <span className="text-sm">{equipe.lider}</span>
                      </div>
                      
                      {equipe.obraAtual && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Obra:</span>
                          <span className="text-sm">{equipe.obraAtual}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Membros:</span>
                        <span className="text-sm">{membros.length}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Colaboradores:</span>
                      <div className="flex flex-wrap gap-2">
                        {membros.map((membro) => (
                          <div key={membro.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {membro.nome.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs">
                              <p className="font-medium">{membro.nome}</p>
                              <p className="text-muted-foreground">{membro.funcao}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Lista de Colaboradores */}
        {visualizacao === 'colaboradores' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colaboradoresFiltrados.map((colaborador) => (
              <Card key={colaborador.id} className="card-standard">
                <CardHeader className="card-header">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {colaborador.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{colaborador.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{colaborador.funcao}</p>
                    </div>
                    <Badge className={getStatusColor(colaborador.status)}>
                      {colaborador.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="card-content space-y-3">
                  {colaborador.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{colaborador.telefone}</span>
                    </div>
                  )}
                  
                  {colaborador.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{colaborador.email}</span>
                    </div>
                  )}

                  {colaborador.equipeId && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {equipes.find(e => e.id === colaborador.equipeId)?.nome || 'Equipe não encontrada'}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Nova Equipe */}
        <Dialog open={modalEquipeAberto} onOpenChange={setModalEquipeAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Equipe</DialogTitle>
              <DialogDescription>
                Crie uma nova equipe de trabalho
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeEquipe">Nome da Equipe *</Label>
                  <Input
                    id="nomeEquipe"
                    value={formDataEquipe.nome}
                    onChange={(e) => setFormDataEquipe({...formDataEquipe, nome: e.target.value})}
                    placeholder="Ex: Equipe Alpha"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lider">Líder da Equipe *</Label>
                  <Select value={formDataEquipe.lider} onValueChange={(value) => setFormDataEquipe({...formDataEquipe, lider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o líder" />
                    </SelectTrigger>
                    <SelectContent>
                      {colaboradores.map(colaborador => (
                        <SelectItem key={colaborador.id} value={colaborador.nome}>{colaborador.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Membros da Equipe</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {colaboradoresDisponiveis.map(colaborador => (
                    <div key={colaborador.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`membro-${colaborador.id}`}
                        checked={formDataEquipe.membros.includes(colaborador.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormDataEquipe({
                              ...formDataEquipe,
                              membros: [...formDataEquipe.membros, colaborador.id]
                            });
                          } else {
                            setFormDataEquipe({
                              ...formDataEquipe,
                              membros: formDataEquipe.membros.filter(id => id !== colaborador.id)
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`membro-${colaborador.id}`} className="text-sm">
                        {colaborador.nome} - {colaborador.funcao}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleFecharModalEquipe} className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSalvarEquipe} className="flex-1 btn-standard">
                Criar Equipe
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Novo Colaborador */}
        <Dialog open={modalColaboradorAberto} onOpenChange={setModalColaboradorAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Colaborador</DialogTitle>
              <DialogDescription>
                Cadastre um novo colaborador
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeColaborador">Nome Completo *</Label>
                  <Input
                    id="nomeColaborador"
                    value={formDataColaborador.nome}
                    onChange={(e) => setFormDataColaborador({...formDataColaborador, nome: e.target.value})}
                    placeholder="Nome do colaborador"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funcaoColaborador">Função *</Label>
                  <Select value={formDataColaborador.funcao} onValueChange={(value) => setFormDataColaborador({...formDataColaborador, funcao: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      {funcoes.map(funcao => (
                        <SelectItem key={funcao} value={funcao}>{funcao}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefoneColaborador">Telefone</Label>
                  <Input
                    id="telefoneColaborador"
                    value={formDataColaborador.telefone}
                    onChange={(e) => setFormDataColaborador({...formDataColaborador, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailColaborador">Email</Label>
                  <Input
                    id="emailColaborador"
                    type="email"
                    value={formDataColaborador.email}
                    onChange={(e) => setFormDataColaborador({...formDataColaborador, email: e.target.value})}
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleFecharModalColaborador} className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSalvarColaborador} className="flex-1 btn-standard">
                Cadastrar Colaborador
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
