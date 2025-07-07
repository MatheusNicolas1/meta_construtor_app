
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, User, FileText, Edit, Trash, Check, AlertCircle, Download, Filter, Search } from 'lucide-react';

interface HistoricoAcao {
  id: string;
  usuario: string;
  acao: string;
  recurso: string;
  dataHora: string;
  ip: string;
  resultado: 'sucesso' | 'falha' | 'pendente';
  detalhes?: string;
}

export default function HistoricoAcoes() {
  const [filtroUsuario, setFiltroUsuario] = useState('all');
  const [filtroAcao, setFiltroAcao] = useState('all');
  const [filtroResultado, setFiltroResultado] = useState('all');
  const [busca, setBusca] = useState('');
  const [selectedAcao, setSelectedAcao] = useState<HistoricoAcao | null>(null);

  const historicoAcoes: HistoricoAcao[] = [
    {
      id: '1',
      usuario: 'João Silva',
      acao: 'Login',
      recurso: 'Sistema',
      dataHora: '2024-01-15 08:30:15',
      ip: '192.168.1.10',
      resultado: 'sucesso'
    },
    {
      id: '2',
      usuario: 'Maria Santos',
      acao: 'Criação de RDO',
      recurso: 'RDO #2024001',
      dataHora: '2024-01-15 09:15:30',
      ip: '192.168.1.15',
      resultado: 'sucesso',
      detalhes: 'RDO criado para obra Shopping Center Norte'
    },
    {
      id: '3',
      usuario: 'Carlos Oliveira',
      acao: 'Edição de Atividade',
      recurso: 'Atividade #001',
      dataHora: '2024-01-15 10:45:22',
      ip: '192.168.1.20',
      resultado: 'sucesso',
      detalhes: 'Status alterado de Pendente para Em Andamento'
    },
    {
      id: '4',
      usuario: 'Ana Costa',
      acao: 'Tentativa de Login',
      recurso: 'Sistema',
      dataHora: '2024-01-15 11:20:45',
      ip: '192.168.1.25',
      resultado: 'falha',
      detalhes: 'Senha incorreta'
    },
    {
      id: '5',
      usuario: 'João Silva',
      acao: 'Aprovação de RDO',
      recurso: 'RDO #2024001',
      dataHora: '2024-01-15 14:30:10',
      ip: '192.168.1.10',
      resultado: 'sucesso',
      detalhes: 'RDO aprovado e enviado para processamento'
    },
    {
      id: '6',
      usuario: 'Maria Santos',
      acao: 'Upload de Documento',
      recurso: 'Documento #DOC001',
      dataHora: '2024-01-15 15:45:33',
      ip: '192.168.1.15',
      resultado: 'sucesso',
      detalhes: 'Projeto arquitetônico.pdf - 2.3MB'
    },
    {
      id: '7',
      usuario: 'Carlos Oliveira',
      acao: 'Exclusão de Equipamento',
      recurso: 'Equipamento #EQP001',
      dataHora: '2024-01-15 16:20:18',
      ip: '192.168.1.20',
      resultado: 'sucesso',
      detalhes: 'Betoneira removida do sistema'
    }
  ];

  const usuarios = [...new Set(historicoAcoes.map(h => h.usuario))];
  const tiposAcao = [...new Set(historicoAcoes.map(h => h.acao))];

  const historicoFiltrado = historicoAcoes.filter(acao => {
    const matchUsuario = filtroUsuario === 'all' || acao.usuario === filtroUsuario;
    const matchAcao = filtroAcao === 'all' || acao.acao === filtroAcao;
    const matchResultado = filtroResultado === 'all' || acao.resultado === filtroResultado;
    const matchBusca = !busca || 
      acao.usuario.toLowerCase().includes(busca.toLowerCase()) ||
      acao.acao.toLowerCase().includes(busca.toLowerCase()) ||
      acao.recurso.toLowerCase().includes(busca.toLowerCase());
    
    return matchUsuario && matchAcao && matchResultado && matchBusca;
  });

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case 'sucesso':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'falha':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pendente':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResultadoColor = (resultado: string) => {
    switch (resultado) {
      case 'sucesso':
        return 'bg-green-100 text-green-800';
      case 'falha':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAcaoIcon = (acao: string) => {
    if (acao.includes('Login')) return <User className="h-4 w-4" />;
    if (acao.includes('RDO')) return <FileText className="h-4 w-4" />;
    if (acao.includes('Edição')) return <Edit className="h-4 w-4" />;
    if (acao.includes('Exclusão')) return <Trash className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const handleExportarHistorico = () => {
    console.log('Exportando histórico de ações...');
    // Implementar exportação em PDF/Excel
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Histórico de Ações</h1>
            <p className="text-muted-foreground">Registro completo de atividades dos usuários</p>
          </div>
          <Button onClick={handleExportarHistorico}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div>
                <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os usuários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario} value={usuario}>
                        {usuario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={filtroAcao} onValueChange={setFiltroAcao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    {tiposAcao.map((acao) => (
                      <SelectItem key={acao} value={acao}>
                        {acao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={filtroResultado} onValueChange={setFiltroResultado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os resultados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os resultados</SelectItem>
                    <SelectItem value="sucesso">Sucesso</SelectItem>
                    <SelectItem value="falha">Falha</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  setFiltroUsuario('all');
                  setFiltroAcao('all');
                  setFiltroResultado('all');
                  setBusca('');
                }}
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Atividades</CardTitle>
            <CardDescription>
              {historicoFiltrado.length} de {historicoAcoes.length} ações encontradas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {historicoFiltrado.map((acao) => (
              <div key={acao.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    {getAcaoIcon(acao.acao)}
                    {getResultadoIcon(acao.resultado)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{acao.acao}</h4>
                      <Badge className={getResultadoColor(acao.resultado)}>
                        {acao.resultado}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <span><strong>Usuário:</strong> {acao.usuario}</span>
                      <span><strong>Recurso:</strong> {acao.recurso}</span>
                      <span><strong>Data/Hora:</strong> {acao.dataHora}</span>
                      <span><strong>IP:</strong> {acao.ip}</span>
                    </div>
                    {acao.detalhes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Detalhes:</strong> {acao.detalhes}
                      </p>
                    )}
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Detalhes da Ação</DialogTitle>
                      <DialogDescription>
                        Informações completas sobre esta ação
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Usuário:</span>
                          <p className="text-muted-foreground">{acao.usuario}</p>
                        </div>
                        <div>
                          <span className="font-medium">Ação:</span>
                          <p className="text-muted-foreground">{acao.acao}</p>
                        </div>
                        <div>
                          <span className="font-medium">Recurso:</span>
                          <p className="text-muted-foreground">{acao.recurso}</p>
                        </div>
                        <div>
                          <span className="font-medium">Data/Hora:</span>
                          <p className="text-muted-foreground">{acao.dataHora}</p>
                        </div>
                        <div>
                          <span className="font-medium">IP:</span>
                          <p className="text-muted-foreground">{acao.ip}</p>
                        </div>
                        <div>
                          <span className="font-medium">Resultado:</span>
                          <Badge className={getResultadoColor(acao.resultado)}>
                            {acao.resultado}
                          </Badge>
                        </div>
                      </div>
                      {acao.detalhes && (
                        <div>
                          <span className="font-medium">Detalhes:</span>
                          <p className="text-muted-foreground mt-1">{acao.detalhes}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
