import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, AlertTriangle, Clock, CheckCircle, X, RefreshCw } from 'lucide-react';
import { notificacaoService, Notificacao } from '../services/notificacaoService';
import { useToast } from '../hooks/use-toast';

export function NotificationCenter() {
  const { toast } = useToast();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [contadorNaoLidas, setContadorNaoLidas] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);

  const notificacaoesNaoLidas = notificacoes.filter(n => !n.lida);

  // Carregar notificações do Supabase
  useEffect(() => {
    const carregarNotificacoes = async () => {
      try {
        setCarregando(true);
        const { data, error } = await notificacaoService.listarNotificacoes();
        
        if (error) {
          console.error('Erro ao carregar notificações:', error);
          toast({
            title: "Erro ao carregar notificações",
            description: "Não foi possível carregar as notificações. Tente novamente.",
            variant: "destructive"
          });
        } else {
          setNotificacoes(data);
          setContadorNaoLidas(data.filter(n => !n.lida).length);
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarNotificacoes();
  }, []);

  // Configurar assinatura para notificações em tempo real
  useEffect(() => {
    const configurarAssinatura = async () => {
      const { data: sub } = await notificacaoService.configurarAssinatura((novaNotificacao) => {
        setNotificacoes(prev => [novaNotificacao, ...prev]);
        setContadorNaoLidas(prev => prev + 1);
        
        // Mostrar toast para nova notificação
        toast({
          title: novaNotificacao.titulo,
          description: novaNotificacao.descricao,
          duration: 5000,
        });
      });
      
      setSubscription(sub);
    };

    configurarAssinatura();

    // Cleanup subscription
    return () => {
      if (subscription) {
        notificacaoService.removerAssinatura(subscription);
      }
    };
  }, []);

  const marcarComoLida = async (id: string) => {
    try {
      const { data, error } = await notificacaoService.marcarComoLida(id);
      
      if (error) {
        toast({
          title: "Erro ao marcar como lida",
          description: "Não foi possível marcar a notificação como lida.",
          variant: "destructive"
        });
      } else {
        setNotificacoes(notificacoes.map(n => 
          n.id === id ? { ...n, lida: true } : n
        ));
        setContadorNaoLidas(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const { data, error } = await notificacaoService.marcarTodasComoLidas();
      
      if (error) {
        toast({
          title: "Erro ao marcar todas como lidas",
          description: "Não foi possível marcar todas as notificações como lidas.",
          variant: "destructive"
        });
      } else {
        setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })));
        setContadorNaoLidas(0);
        toast({
          title: "Notificações marcadas como lidas",
          description: "Todas as notificações foram marcadas como lidas.",
        });
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const removerNotificacao = async (id: string) => {
    try {
      const { data, error } = await notificacaoService.removerNotificacao(id);
      
      if (error) {
        toast({
          title: "Erro ao remover notificação",
          description: "Não foi possível remover a notificação.",
          variant: "destructive"
        });
      } else {
        const notificacaoRemovida = notificacoes.find(n => n.id === id);
        setNotificacoes(notificacoes.filter(n => n.id !== id));
        
        if (notificacaoRemovida && !notificacaoRemovida.lida) {
          setContadorNaoLidas(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
    }
  };

  const recarregarNotificacoes = async () => {
    try {
      setCarregando(true);
      const { data, error } = await notificacaoService.listarNotificacoes();
      
      if (error) {
        toast({
          title: "Erro ao recarregar",
          description: "Não foi possível recarregar as notificações.",
          variant: "destructive"
        });
      } else {
        setNotificacoes(data);
        setContadorNaoLidas(data.filter(n => !n.lida).length);
        toast({
          title: "Notificações recarregadas",
          description: "Lista de notificações foi atualizada.",
        });
      }
    } catch (error) {
      console.error('Erro ao recarregar notificações:', error);
    } finally {
      setCarregando(false);
    }
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
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="h-5 w-5" />
          {contadorNaoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold min-w-5 rounded-full"
            >
              {contadorNaoLidas > 9 ? '9+' : contadorNaoLidas}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Central de Notificações
              </DialogTitle>
              <DialogDescription>
                Gerencie suas notificações e alertas
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={recarregarNotificacoes}
                disabled={carregando}
              >
                <RefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} />
              </Button>
              {notificacaoesNaoLidas.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={marcarTodasComoLidas}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todas">
              Todas ({carregando ? '...' : notificacoes.length})
            </TabsTrigger>
            <TabsTrigger value="nao-lidas">
              Não Lidas ({carregando ? '...' : contadorNaoLidas})
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-3 mt-4">
            {carregando ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Carregando notificações...</p>
              </div>
            ) : (
              <>
                {notificacoes.map((notificacao) => (
                  <Card key={notificacao.id} className={`${!notificacao.lida ? 'border-l-4 border-l-primary bg-muted/30' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getIconByType(notificacao.tipo)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={`font-medium truncate ${!notificacao.lida ? 'font-bold' : ''}`}>
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
                              <span className="truncate">
                                {notificacao.obra?.nome ? `Obra: ${notificacao.obra.nome}` : 
                                 notificacao.categoria === 'sistema' ? 'Sistema' : 
                                 notificacao.categoria === 'usuario' ? 'Usuário' : 'Geral'}
                              </span>
                              <span className="flex-shrink-0">{new Date(notificacao.data_evento).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {!notificacao.lida && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => marcarComoLida(notificacao.id)}
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removerNotificacao(notificacao.id)}
                            className="h-8 w-8 p-0 hover:text-destructive"
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
                    <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
                    <p className="text-muted-foreground">Você está em dia com todas as notificações</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="nao-lidas" className="space-y-3 mt-4">
            {carregando ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Carregando notificações...</p>
              </div>
            ) : (
              <>
                {notificacaoesNaoLidas.map((notificacao) => (
                  <Card key={notificacao.id} className="border-l-4 border-l-primary bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getIconByType(notificacao.tipo)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold truncate">{notificacao.titulo}</h4>
                              <Badge variant={getPriorityColor(notificacao.prioridade)} className="flex-shrink-0">
                                {notificacao.prioridade}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {notificacao.descricao}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                              <span className="truncate">
                                {notificacao.obra?.nome ? `Obra: ${notificacao.obra.nome}` : 
                                 notificacao.categoria === 'sistema' ? 'Sistema' : 
                                 notificacao.categoria === 'usuario' ? 'Usuário' : 'Geral'}
                              </span>
                              <span className="flex-shrink-0">{new Date(notificacao.data_evento).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => marcarComoLida(notificacao.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removerNotificacao(notificacao.id)}
                            className="h-8 w-8 p-0 hover:text-destructive"
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
                    <h3 className="text-lg font-medium mb-2">Tudo em dia!</h3>
                    <p className="text-muted-foreground">Você não tem notificações pendentes</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações de Atraso</p>
                    <p className="text-sm text-muted-foreground">Alertas quando projetos estão atrasados</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações de Manutenção</p>
                    <p className="text-sm text-muted-foreground">Lembretes de manutenção preventiva</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">RDO Pendentes</p>
                    <p className="text-sm text-muted-foreground">Alertas de RDOs não enviados</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por E-mail</p>
                    <p className="text-sm text-muted-foreground">Receber notificações por e-mail</p>
                  </div>
                  <input type="checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por WhatsApp</p>
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
