
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MessageSquare, Cloud, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Integracoes() {
  const { toast } = useToast();
  
  const [integrations, setIntegrations] = useState({
    googleCalendar: {
      enabled: false,
      connected: false,
      apiKey: '',
      calendarId: '',
      syncPrazos: true,
      syncAtividades: false
    },
    whatsapp: {
      enabled: false,
      connected: false,
      token: '',
      phoneNumberId: '',
      alertasRDO: true,
      lembretesPrazos: true,
      statusObras: false
    },
    googleDrive: {
      enabled: false,
      connected: false,
      folderId: '',
      autoBackup: true,
      syncDocuments: true
    }
  });

  const handleToggleIntegration = (integration: string, enabled: boolean) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration as keyof typeof prev],
        enabled
      }
    }));
    
    toast({
      title: enabled ? "Integração Ativada" : "Integração Desativada",
      description: `${integration} foi ${enabled ? 'ativada' : 'desativada'} com sucesso.`,
    });
  };

  const handleConnect = async (integration: string) => {
    console.log(`Conectando ${integration}...`);
    
    // Simular processo de conexão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIntegrations(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration as keyof typeof prev],
        connected: true
      }
    }));
    
    toast({
      title: "Conexão Estabelecida",
      description: `${integration} foi conectado com sucesso!`,
    });
  };

  const getStatusBadge = (connected: boolean, enabled: boolean) => {
    if (!enabled) return <Badge variant="secondary">Desativado</Badge>;
    if (connected) return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
    return <Badge variant="destructive">Desconectado</Badge>;
  };

  const getStatusIcon = (connected: boolean, enabled: boolean) => {
    if (!enabled) return <XCircle className="h-5 w-5 text-gray-400" />;
    if (connected) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integrações</h1>
          <p className="text-muted-foreground">
            Configure e gerencie integrações externas do MetaConstrutor
          </p>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList>
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="calendar">Google Calendar</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp Business</TabsTrigger>
            <TabsTrigger value="storage">Armazenamento</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <div className="grid gap-4">
              {/* Google Calendar */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle>Google Calendar</CardTitle>
                        <CardDescription>Sincronize prazos e cronogramas das obras</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integrations.googleCalendar.connected, integrations.googleCalendar.enabled)}
                      {getStatusBadge(integrations.googleCalendar.connected, integrations.googleCalendar.enabled)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Sincronizar automaticamente atividades e prazos das obras
                    </p>
                    <Switch 
                      checked={integrations.googleCalendar.enabled}
                      onCheckedChange={(enabled) => handleToggleIntegration('googleCalendar', enabled)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Business */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-8 w-8 text-green-600" />
                      <div>
                        <CardTitle>WhatsApp Business</CardTitle>
                        <CardDescription>Envie alertas e notificações automáticas</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integrations.whatsapp.connected, integrations.whatsapp.enabled)}
                      {getStatusBadge(integrations.whatsapp.connected, integrations.whatsapp.enabled)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Notificações de RDO, lembretes de prazo e status das obras
                    </p>
                    <Switch 
                      checked={integrations.whatsapp.enabled}
                      onCheckedChange={(enabled) => handleToggleIntegration('whatsapp', enabled)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Google Drive */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cloud className="h-8 w-8 text-orange-600" />
                      <div>
                        <CardTitle>Google Drive</CardTitle>
                        <CardDescription>Backup automático e sincronização de documentos</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integrations.googleDrive.connected, integrations.googleDrive.enabled)}
                      {getStatusBadge(integrations.googleDrive.connected, integrations.googleDrive.enabled)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Armazenamento seguro e acesso online aos documentos das obras
                    </p>
                    <Switch 
                      checked={integrations.googleDrive.enabled}
                      onCheckedChange={(enabled) => handleToggleIntegration('googleDrive', enabled)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Google Calendar</CardTitle>
                <CardDescription>
                  Configure a sincronização com o Google Calendar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>API Key</Label>
                    <Input 
                      type="password"
                      placeholder="Sua chave da API do Google"
                      value={integrations.googleCalendar.apiKey}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        googleCalendar: { ...prev.googleCalendar, apiKey: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Calendar ID</Label>
                    <Input 
                      placeholder="ID do calendário"
                      value={integrations.googleCalendar.calendarId}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        googleCalendar: { ...prev.googleCalendar, calendarId: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Sincronizar prazos das atividades</Label>
                    <Switch 
                      checked={integrations.googleCalendar.syncPrazos}
                      onCheckedChange={(checked) => setIntegrations(prev => ({
                        ...prev,
                        googleCalendar: { ...prev.googleCalendar, syncPrazos: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Sincronizar criação de atividades</Label>
                    <Switch 
                      checked={integrations.googleCalendar.syncAtividades}
                      onCheckedChange={(checked) => setIntegrations(prev => ({
                        ...prev,
                        googleCalendar: { ...prev.googleCalendar, syncAtividades: checked }
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleConnect('googleCalendar')}
                  disabled={integrations.googleCalendar.connected}
                >
                  {integrations.googleCalendar.connected ? 'Conectado' : 'Conectar ao Google Calendar'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do WhatsApp Business</CardTitle>
                <CardDescription>
                  Configure as notificações automáticas via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Token de Acesso</Label>
                    <Input 
                      type="password"
                      placeholder="Token do WhatsApp Business API"
                      value={integrations.whatsapp.token}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, token: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Phone Number ID</Label>
                    <Input 
                      placeholder="ID do número de telefone"
                      value={integrations.whatsapp.phoneNumberId}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, phoneNumberId: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Alertas de RDO pendente</Label>
                    <Switch 
                      checked={integrations.whatsapp.alertasRDO}
                      onCheckedChange={(checked) => setIntegrations(prev => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, alertasRDO: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Lembretes de prazos</Label>
                    <Switch 
                      checked={integrations.whatsapp.lembretesPrazos}
                      onCheckedChange={(checked) => setIntegrations(prev => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, lembretesPrazos: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Status das obras</Label>
                    <Switch 
                      checked={integrations.whatsapp.statusObras}
                      onCheckedChange={(checked) => setIntegrations(prev => ({
                        ...prev,
                        whatsapp: { ...prev.whatsapp, statusObras: checked }
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleConnect('whatsapp')}
                  disabled={integrations.whatsapp.connected}
                >
                  {integrations.whatsapp.connected ? 'Conectado' : 'Conectar ao WhatsApp'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Armazenamento</CardTitle>
                <CardDescription>
                  Configure backup e sincronização de documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ID da Pasta no Google Drive</Label>
                  <Input 
                    placeholder="ID da pasta onde serão armazenados os documentos"
                    value={integrations.googleDrive.folderId}
                    onChange={(e) => setIntegrations(prev => ({
                      ...prev,
                      googleDrive: { ...prev.googleDrive, folderId: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Backup automático</Label>
                    <Switch 
                      checked={integrations.googleDrive.autoBackup}
                      onCheckedChange={(checked) => setIntegrations(prev => ({
                        ...prev,
                        googleDrive: { ...prev.googleDrive, autoBackup: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Sincronizar documentos</Label>
                    <Switch 
                      checked={integrations.googleDrive.syncDocuments}
                      onCheckedChange={(checked) => setIntegrations(prev => ({
                        ...prev,
                        googleDrive: { ...prev.googleDrive, syncDocuments: checked }
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleConnect('googleDrive')}
                  disabled={integrations.googleDrive.connected}
                >
                  {integrations.googleDrive.connected ? 'Conectado' : 'Conectar ao Google Drive'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
