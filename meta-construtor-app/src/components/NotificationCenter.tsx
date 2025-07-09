import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, AlertTriangle, Clock, CheckCircle, X, RefreshCw } from 'lucide-react';

interface NotificacaoSimples {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  prioridade: string;
  lida: boolean;
  data_evento: string;
  created_at: string;
}

export function NotificationCenter() {
  const [notificacoes, setNotificacoes] = useState<NotificacaoSimples[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [contadorNaoLidas, setContadorNaoLidas] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const notificacaoesNaoLidas = notificacoes.filter(n => !n.lida);

  // Carregar notificações de exemplo (sem dependência do Supabase)
  useEffect(() => {
    const carregarNotificacoes = async () => {
      setCarregando(true);
      setErro(null);
      
      try {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Notificações de exemplo
        const exemplos: NotificacaoSimples[] = [
          {
            id: '1',
            titulo: 'RDO Aprovado',
            descricao: 'Seu RDO da obra Shopping Center foi aprovado',
            tipo: 'aprovacao',
            prioridade: 'baixa',
            lida: false,
            data_evento: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            titulo: 'Checklist Pendente',
            descricao: 'Checklist de segurança pendente para hoje',
            tipo: 'pendencia',
            prioridade: 'media',
            lida: false,
            data_evento: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            titulo: 'Nova Obra Cadastrada',
            descricao: 'Obra Residencial Jardins foi cadastrada no sistema',
            tipo: 'criacao',
            prioridade: 'baixa',
            lida: true,
            data_evento: new Date(Date.now() - 86400000).toISOString(),
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];

        setNotificacoes(exemplos);
        setContadorNaoLidas(exemplos.filter(n => !n.lida).length);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        setErro('Erro ao carregar notificações');
        setNotificacoes([]);
        setContadorNaoLidas(0);
      } finally {
        setCarregando(false);
      }
    };

    carregarNotificacoes();
  }, []);

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => 
      prev.map(n => 
        n.id === id ? { ...n, lida: true } : n
      )
    );
    setContadorNaoLidas(prev => Math.max(0, prev - 1));
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => 
      prev.map(n => ({ ...n, lida: true }))
    );
    setContadorNaoLidas(0);
  };

  const removerNotificacao = (id: string) => {
    const notificacaoRemovida = notificacoes.find(n => n.id === id);
    setNotificacoes(prev => prev.filter(n => n.id !== id));
    
    if (notificacaoRemovida && !notificacaoRemovida.lida) {
      setContadorNaoLidas(prev => Math.max(0, prev - 1));
    }
  };

  const recarregarNotificacoes = () => {
    setCarregando(true);
    setErro(null);
    
    setTimeout(() => {
      setCarregando(false);
    }, 1000);
  };

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'atraso':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pendencia':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'manutencao':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'aprovacao':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'criacao':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'finalizacao':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'destructive';
      case 'media':
        return 'secondary';
      case 'baixa':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-foreground focus:text-foreground border border-border/50 hover:bg-muted">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-foreground stroke-2" />
          {contadorNaoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold min-w-5 rounded-full bg-[#FF5722] text-white border-none"
            >
              {contadorNaoLidas > 9 ? '9+' : contadorNaoLidas}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Bell className="h-5 w-5" />
                Central de Notificações
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Gerencie suas notificações e alertas
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={recarregarNotificacoes}
                disabled={carregando}
                className="text-foreground border-border"
              >
                <RefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} />
              </Button>
              {notificacaoesNaoLidas.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={marcarTodasComoLidas}
                  className="text-foreground border-border"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="todas" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
              Todas ({carregando ? '...' : notificacoes.length})
            </TabsTrigger>
            <TabsTrigger value="nao-lidas" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
              Não Lidas ({carregando ? '...' : contadorNaoLidas})
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-3 mt-4">
            {carregando ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF5722]" />
                <p className="text-foreground">Carregando notificações...</p>
              </div>
            ) : erro ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{erro}</p>
                <Button onClick={recarregarNotificacoes} variant="outline" className="text-foreground border-border">
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <>
                {notificacoes.map((notificacao) => (
                  <Card key={notificacao.id} className={`${!notificacao.lida ? 'border-l-4 border-l-[#FF5722] bg-muted/30' : 'border-border'} bg-background`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getIconByType(notificacao.tipo)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={`font-medium truncate ${!notificacao.lida ? 'font-bold text-foreground' : 'text-foreground'}`}>
                                {notificacao.titulo}
                              </h4>
                              <Badge variant={getPriorityColor(notificacao.prioridade)} className="flex-shrink-0">
                                {notificacao.prioridade}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {notificacao.descricao}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                              <span className="flex-shrink-0">
                                {new Date(notificacao.data_evento).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {!notificacao.lida && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => marcarComoLida(notificacao.id)}
                              className="h-8 w-8 p-0 text-foreground hover:text-foreground"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removerNotificacao(notificacao.id)}
                            className="h-8 w-8 p-0 hover:text-destructive text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {notificacoes.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-foreground">Nenhuma notificação</h3>
                    <p className="text-muted-foreground">Você está em dia com todas as notificações</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="nao-lidas" className="space-y-3 mt-4">
            {carregando ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#FF5722]" />
                <p className="text-foreground">Carregando notificações...</p>
              </div>
            ) : (
              <>
                {notificacaoesNaoLidas.map((notificacao) => (
                  <Card key={notificacao.id} className="border-l-4 border-l-[#FF5722] bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getIconByType(notificacao.tipo)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold truncate text-foreground">{notificacao.titulo}</h4>
                              <Badge variant={getPriorityColor(notificacao.prioridade)} className="flex-shrink-0">
                                {notificacao.prioridade}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {notificacao.descricao}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                              <span className="flex-shrink-0">
                                {new Date(notificacao.data_evento).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => marcarComoLida(notificacao.id)}
                            className="h-8 w-8 p-0 text-foreground hover:text-foreground"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removerNotificacao(notificacao.id)}
                            className="h-8 w-8 p-0 hover:text-destructive text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {notificacaoesNaoLidas.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-foreground">Tudo em dia!</h3>
                    <p className="text-muted-foreground">Você não tem notificações pendentes</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-4 mt-4">
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Configurações de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Notificações de Atraso</p>
                    <p className="text-sm text-muted-foreground">Alertas quando projetos estão atrasados</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Notificações de Manutenção</p>
                    <p className="text-sm text-muted-foreground">Lembretes de manutenção preventiva</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">RDO Pendentes</p>
                    <p className="text-sm text-muted-foreground">Alertas de RDOs não enviados</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Notificações por E-mail</p>
                    <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
                  </div>
                  <input type="checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Notificações por WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Receber notificações via WhatsApp</p>
                  </div>
                  <input type="checkbox" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
