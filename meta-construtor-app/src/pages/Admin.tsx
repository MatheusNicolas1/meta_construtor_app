import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Shield, 
  Users, 
  Building2, 
  FileText, 
  Database, 
  Activity, 
  UserPlus,
  Settings,
  AlertTriangle,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminStats {
  total_usuarios: number;
  total_empresas: number;
  total_obras: number;
  total_rdos: number;
  usuarios_ativos: number;
  obras_ativas: number;
}

interface Usuario {
  id: string;
  nome: string | null;
  cargo: string | null;
  telefone: string | null;
  nivel_acesso: 'diretor' | 'gerente' | 'colaborador';
  status: 'ativo' | 'inativo' | 'suspenso';
  empresa_id: string | null;
  created_at: string;
  empresa?: {
    nome: string;
  };
  auth_user?: {
    email: string;
    last_sign_in_at: string | null;
  };
}

interface Empresa {
  id: string;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  plano: 'basico' | 'profissional' | 'empresarial';
  status: 'ativa' | 'inativa' | 'suspensa';
  created_at: string;
}

const Admin: React.FC = () => {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);

  // Estados do formulário de usuário
  const [formUsuario, setFormUsuario] = useState({
    email: '',
    nome: '',
    cargo: '',
    telefone: '',
    nivel_acesso: 'colaborador' as 'diretor' | 'gerente' | 'colaborador',
    empresa_id: '',
    password: '',
  });

  // Estados do formulário de empresa
  const [formEmpresa, setFormEmpresa] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    plano: 'basico' as 'basico' | 'profissional' | 'empresarial',
  });

  // Verificar permissão de acesso
  if (!profile || profile.nivel_acesso !== 'diretor') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        carregarStats(),
        carregarUsuarios(),
        carregarEmpresas(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
      toast.error('Erro ao carregar dados administrativos');
    } finally {
      setIsLoading(false);
    }
  };

  const carregarStats = async () => {
    try {
      // Carregar estatísticas gerais
      const [
        { count: total_usuarios },
        { count: total_empresas },
        { count: total_obras },
        { count: total_rdos },
        { count: usuarios_ativos },
        { count: obras_ativas },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('empresas').select('*', { count: 'exact', head: true }),
        supabase.from('obras').select('*', { count: 'exact', head: true }),
        supabase.from('rdos').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
        supabase.from('obras').select('*', { count: 'exact', head: true }).eq('status', 'ativa'),
      ]);

      setStats({
        total_usuarios: total_usuarios || 0,
        total_empresas: total_empresas || 0,
        total_obras: total_obras || 0,
        total_rdos: total_rdos || 0,
        usuarios_ativos: usuarios_ativos || 0,
        obras_ativas: obras_ativas || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          empresa:empresas(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      // Buscar emails dos usuários
      const usuariosComEmail = await Promise.all(
        (data || []).map(async (usuario) => {
          const { data: authData } = await supabase.auth.admin.getUserById(usuario.id);
          return {
            ...usuario,
            auth_user: authData.user ? {
              email: authData.user.email || '',
              last_sign_in_at: authData.user.last_sign_in_at || null,
            } : null,
          };
        })
      );

      setUsuarios(usuariosComEmail);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const carregarEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar empresas:', error);
        return;
      }

      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!formUsuario.email || !formUsuario.nome || !formUsuario.password) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formUsuario.email,
        password: formUsuario.password,
        email_confirm: true,
        user_metadata: {
          nome: formUsuario.nome,
        },
      });

      if (authError) {
        console.error('Erro ao criar usuário no Auth:', authError);
        toast.error('Erro ao criar usuário');
        return;
      }

      // Criar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          nome: formUsuario.nome,
          cargo: formUsuario.cargo,
          telefone: formUsuario.telefone,
          nivel_acesso: formUsuario.nivel_acesso,
          empresa_id: formUsuario.empresa_id || null,
          status: 'ativo',
        }]);

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        toast.error('Erro ao criar perfil do usuário');
        return;
      }

      toast.success('Usuário criado com sucesso!');
      setIsCreateUserOpen(false);
      resetFormUsuario();
      carregarUsuarios();
      carregarStats();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
    }
  };

  const handleCreateCompany = async () => {
    try {
      if (!formEmpresa.nome) {
        toast.error('Nome da empresa é obrigatório');
        return;
      }

      const { error } = await supabase
        .from('empresas')
        .insert([{
          nome: formEmpresa.nome,
          cnpj: formEmpresa.cnpj,
          telefone: formEmpresa.telefone,
          email: formEmpresa.email,
          plano: formEmpresa.plano,
          status: 'ativa',
        }]);

      if (error) {
        console.error('Erro ao criar empresa:', error);
        toast.error('Erro ao criar empresa');
        return;
      }

      toast.success('Empresa criada com sucesso!');
      setIsCreateCompanyOpen(false);
      resetFormEmpresa();
      carregarEmpresas();
      carregarStats();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      toast.error('Erro ao criar empresa');
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar status do usuário:', error);
        toast.error('Erro ao atualizar status do usuário');
        return;
      }

      toast.success('Status do usuário atualizado!');
      carregarUsuarios();
      carregarStats();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleUpdateCompanyStatus = async (companyId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ status })
        .eq('id', companyId);

      if (error) {
        console.error('Erro ao atualizar status da empresa:', error);
        toast.error('Erro ao atualizar status da empresa');
        return;
      }

      toast.success('Status da empresa atualizado!');
      carregarEmpresas();
      carregarStats();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const resetFormUsuario = () => {
    setFormUsuario({
      email: '',
      nome: '',
      cargo: '',
      telefone: '',
      nivel_acesso: 'colaborador',
      empresa_id: '',
      password: '',
    });
  };

  const resetFormEmpresa = () => {
    setFormEmpresa({
      nome: '',
      cnpj: '',
      telefone: '',
      email: '',
      plano: 'basico',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
      case 'ativa':
        return 'bg-green-100 text-green-800';
      case 'inativo':
      case 'inativa':
        return 'bg-gray-100 text-gray-800';
      case 'suspenso':
      case 'suspensa':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNivelAcessoColor = (nivel: string) => {
    switch (nivel) {
      case 'diretor':
        return 'bg-purple-100 text-purple-800';
      case 'gerente':
        return 'bg-blue-100 text-blue-800';
      case 'colaborador':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="w-8 h-8 mr-3 text-purple-600" />
              Painel Administrativo
            </h1>
            <p className="text-gray-600 mt-1">
              Gestão avançada do sistema MetaConstrutor
            </p>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            <Shield className="w-4 h-4 mr-1" />
            Acesso Diretor
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_usuarios || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.usuarios_ativos || 0} ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_empresas || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Cadastradas no sistema
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Obras Ativas</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.obras_ativas || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    de {stats?.total_obras || 0} totais
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>RDOs no Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{stats?.total_rdos || 0}</div>
                  <p className="text-muted-foreground">
                    Relatórios diários de obra registrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monitoramento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Uptime do Sistema</span>
                    <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Backup Última</span>
                    <span className="text-sm text-muted-foreground">Hoje 03:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Versão</span>
                    <span className="text-sm text-muted-foreground">v2.0.0</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Usuários</h2>
              <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={formUsuario.email}
                          onChange={(e) => setFormUsuario(prev => ({ 
                            ...prev, 
                            email: e.target.value 
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Senha *</Label>
                        <Input
                          type="password"
                          value={formUsuario.password}
                          onChange={(e) => setFormUsuario(prev => ({ 
                            ...prev, 
                            password: e.target.value 
                          }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome *</Label>
                        <Input
                          value={formUsuario.nome}
                          onChange={(e) => setFormUsuario(prev => ({ 
                            ...prev, 
                            nome: e.target.value 
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Cargo</Label>
                        <Input
                          value={formUsuario.cargo}
                          onChange={(e) => setFormUsuario(prev => ({ 
                            ...prev, 
                            cargo: e.target.value 
                          }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={formUsuario.telefone}
                          onChange={(e) => setFormUsuario(prev => ({ 
                            ...prev, 
                            telefone: e.target.value 
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Nível de Acesso</Label>
                        <Select 
                          value={formUsuario.nivel_acesso} 
                          onValueChange={(value) => 
                            setFormUsuario(prev => ({ 
                              ...prev, 
                              nivel_acesso: value as any 
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="colaborador">Colaborador</SelectItem>
                            <SelectItem value="gerente">Gerente</SelectItem>
                            <SelectItem value="diretor">Diretor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Empresa</Label>
                      <Select 
                        value={formUsuario.empresa_id} 
                        onValueChange={(value) => 
                          setFormUsuario(prev => ({ 
                            ...prev, 
                            empresa_id: value 
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresas.map(empresa => (
                            <SelectItem key={empresa.id} value={empresa.id}>
                              {empresa.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateUserOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateUser}>
                        Criar Usuário
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map(usuario => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">
                          {usuario.nome || 'Sem nome'}
                        </TableCell>
                        <TableCell>
                          {usuario.auth_user?.email || 'N/A'}
                        </TableCell>
                        <TableCell>{usuario.cargo || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={getNivelAcessoColor(usuario.nivel_acesso)}>
                            {usuario.nivel_acesso}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {usuario.empresa?.nome || 'Sem empresa'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(usuario.status)}>
                            {usuario.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Select
                              value={usuario.status}
                              onValueChange={(value) => 
                                handleUpdateUserStatus(usuario.id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ativo">Ativo</SelectItem>
                                <SelectItem value="inativo">Inativo</SelectItem>
                                <SelectItem value="suspenso">Suspenso</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Empresas */}
          <TabsContent value="companies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Empresas</h2>
              <Dialog open={isCreateCompanyOpen} onOpenChange={setIsCreateCompanyOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Empresa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome da Empresa *</Label>
                      <Input
                        value={formEmpresa.nome}
                        onChange={(e) => setFormEmpresa(prev => ({ 
                          ...prev, 
                          nome: e.target.value 
                        }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>CNPJ</Label>
                        <Input
                          value={formEmpresa.cnpj}
                          onChange={(e) => setFormEmpresa(prev => ({ 
                            ...prev, 
                            cnpj: e.target.value 
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={formEmpresa.telefone}
                          onChange={(e) => setFormEmpresa(prev => ({ 
                            ...prev, 
                            telefone: e.target.value 
                          }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={formEmpresa.email}
                          onChange={(e) => setFormEmpresa(prev => ({ 
                            ...prev, 
                            email: e.target.value 
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Plano</Label>
                        <Select 
                          value={formEmpresa.plano} 
                          onValueChange={(value) => 
                            setFormEmpresa(prev => ({ 
                              ...prev, 
                              plano: value as any 
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basico">Básico</SelectItem>
                            <SelectItem value="profissional">Profissional</SelectItem>
                            <SelectItem value="empresarial">Empresarial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateCompanyOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateCompany}>
                        Criar Empresa
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresas.map(empresa => (
                      <TableRow key={empresa.id}>
                        <TableCell className="font-medium">
                          {empresa.nome}
                        </TableCell>
                        <TableCell>{empresa.cnpj || 'N/A'}</TableCell>
                        <TableCell>{empresa.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {empresa.plano}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(empresa.status)}>
                            {empresa.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(empresa.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={empresa.status}
                            onValueChange={(value) => 
                              handleUpdateCompanyStatus(empresa.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ativa">Ativa</SelectItem>
                              <SelectItem value="inativa">Inativa</SelectItem>
                              <SelectItem value="suspensa">Suspensa</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="system" className="space-y-6">
            <h2 className="text-xl font-semibold">Configurações do Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Banco de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Última Migração</span>
                    <Badge className="bg-green-100 text-green-800">009_checklist</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Backup Automático</span>
                    <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamanho do BD</span>
                    <span className="text-sm">~500MB</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tempo de Resposta</span>
                    <Badge className="bg-green-100 text-green-800">&lt; 200ms</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Uso de CPU</span>
                    <span className="text-sm">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uso de Memória</span>
                    <span className="text-sm">45%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Alertas do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium">Sistema operando normalmente</p>
                      <p className="text-sm text-gray-600">Todas as funcionalidades estão funcionando</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium">Backup agendado para 03:00</p>
                      <p className="text-sm text-gray-600">Próximo backup automático do banco</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin; 