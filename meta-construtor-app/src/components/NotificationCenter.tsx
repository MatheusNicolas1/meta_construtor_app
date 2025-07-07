import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bell, AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';

interface Notificacao {
  id: number;
  titulo: string;
  descricao: string;
  tipo: 'atraso' | 'pendencia' | 'manutencao' | 'aprovacao' | 'info';
  obra: string;
  dataHora: string;
  lida: boolean;
  prioridade: 'alta' | 'media' | 'baixa';
}

export function NotificationCenter() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([
    {
      id: 1,
      titulo: 'Atraso na Entrega',
      descricao: 'Torre Empresarial está 3 dias atrasada no cronograma',
      tipo: 'atraso',
      obra: 'Torre Empresarial',
      dataHora: '2024-01-15T10:30:00',
      lida: false,
      prioridade: 'alta'
    },
    {
      id: 2,
      titulo: 'Manutenção Programada',
      descricao: 'Guindaste G1 precisa de manutenção preventiva',
      tipo: 'manutencao',
      obra: 'Shopping Center Norte',
      dataHora: '2024-01-15T09:15:00',
      lida: false,
      prioridade: 'media'
    },
    {
      id: 3,
      titulo: 'RDO Pendente',
      descricao: 'Equipe Alpha não enviou RDO de ontem',
      tipo: 'pendencia',
      obra: 'Residencial Jardins',
      dataHora: '2024-01-15T08:45:00',
      lida: true,
      prioridade: 'media'
    }
  ]);

  const notificacaoesNaoLidas = notificacoes.filter(n => !n.lida);

  const marcarComoLida = (id: number) => {
    setNotificacoes(notificacoes.map(n => 
      n.id === id ? { ...n, lida: true } : n
    ));
  };

  const removerNotificacao = (id: number) => {
    setNotificacoes(notificacoes.filter(n => n.id !== id));
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
          {notificacaoesNaoLidas.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold min-w-5 rounded-full"
            >
              {notificacaoesNaoLidas.length > 9 ? '9+' : notificacaoesNaoLidas.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Central de Notificações
          </DialogTitle>
          <DialogDescription>
            Gerencie suas notificações e alertas
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todas">
              Todas ({notificacoes.length})
            </TabsTrigger>
            <TabsTrigger value="nao-lidas">
              Não Lidas ({notificacaoesNaoLidas.length})
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-3 mt-4">
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
                          <span className="truncate">Obra: {notificacao.obra}</span>
                          <span className="flex-shrink-0">{new Date(notificacao.dataHora).toLocaleString('pt-BR')}</span>
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
          </TabsContent>

          <TabsContent value="nao-lidas" className="space-y-3 mt-4">
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
                          <span className="truncate">Obra: {notificacao.obra}</span>
                          <span className="flex-shrink-0">{new Date(notificacao.dataHora).toLocaleString('pt-BR')}</span>
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
