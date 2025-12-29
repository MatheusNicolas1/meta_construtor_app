import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Settings, Calendar, ExternalLink } from "lucide-react";
import { IntegrationStatus, IntegrationConfig } from "@/types/integration";
import { useToast } from "@/hooks/use-toast";

// Tipo específico para Google Calendar
interface GoogleCalendarConfig extends IntegrationConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken: string;
  settings: {
    autoSync: boolean;
    syncCronograma: boolean;
    lembretesObra: boolean;
    defaultCalendarId?: string;
    timeZone?: string;
  };
}

interface GoogleCalendarConfigCardProps {
  config?: GoogleCalendarConfig;
  status?: IntegrationStatus;
  onSave: (config: GoogleCalendarConfig) => void;
  onTest: (config: GoogleCalendarConfig) => Promise<boolean>;
  onOAuthConnect: () => Promise<GoogleCalendarConfig>;
}

export const GoogleCalendarConfigCard = ({ config, status, onSave, onTest, onOAuthConnect }: GoogleCalendarConfigCardProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(!config?.clientId);
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState<GoogleCalendarConfig>({
    clientId: config?.clientId || '',
    clientSecret: config?.clientSecret || '',
    refreshToken: config?.refreshToken || '',
    accessToken: config?.accessToken || '',
    settings: {
      autoSync: config?.settings?.autoSync || true,
      syncCronograma: config?.settings?.syncCronograma || true,
      lembretesObra: config?.settings?.lembretesObra || true,
      defaultCalendarId: config?.settings?.defaultCalendarId || 'primary',
      timeZone: config?.settings?.timeZone || 'America/Sao_Paulo'
    }
  });

  const handleSave = async () => {
    try {
      if (!formData.clientId || !formData.clientSecret) {
        toast({
          title: "Campos obrigatórios",
          description: "Client ID e Client Secret são obrigatórios",
          variant: "destructive",
        });
        return;
      }

      await onSave(formData);
      setIsEditing(false);
      toast({
        title: "Configuração salva",
        description: "Integração com Google Calendar configurada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração",
        variant: "destructive",
      });
    }
  };

  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    try {
      const newConfig = await onOAuthConnect();
      setFormData(newConfig);
      toast({
        title: "Conectado com sucesso",
        description: "Google Calendar conectado via OAuth2",
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Falha ao conectar com o Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const success = await onTest(formData);
      toast({
        title: success ? "Teste realizado" : "Falha no teste",
        description: success 
          ? "Evento de teste criado no calendário" 
          : "Não foi possível criar evento de teste",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao testar a conexão",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return <Badge variant="secondary">Não configurado</Badge>;
    
    switch (status.isHealthy) {
      case true:
        return <Badge variant="default" className="bg-construction-green"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
      case false:
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const isConfigured = config?.accessToken && config?.refreshToken;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <CardTitle>Google Calendar Integration</CardTitle>
            {getStatusBadge()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="h-4 w-4 mr-1" />
            {isEditing ? 'Cancelar' : 'Configurar'}
          </Button>
        </div>
        <CardDescription>
          Configure a integração com Google Calendar para agendamentos automáticos, prazos e lembretes
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID *</Label>
              <Input
                id="clientId"
                placeholder="Client ID do Google Cloud Console"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret *</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Client Secret do Google Cloud Console"
                value={formData.clientSecret}
                onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
              />
            </div>

            {!isConfigured && (
              <Button 
                onClick={handleOAuthConnect}
                disabled={isConnecting || !formData.clientId || !formData.clientSecret}
                className="w-full gradient-construction border-0"
              >
                {isConnecting ? 'Conectando...' : 'Conectar com Google Calendar'}
              </Button>
            )}

            <div className="space-y-2">
              <Label htmlFor="defaultCalendarId">ID do Calendário Padrão</Label>
              <Input
                id="defaultCalendarId"
                placeholder="primary (ou ID específico do calendário)"
                value={formData.settings.defaultCalendarId}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  settings: { ...formData.settings, defaultCalendarId: e.target.value }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeZone">Fuso Horário</Label>
              <Input
                id="timeZone"
                placeholder="America/Sao_Paulo"
                value={formData.settings.timeZone}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  settings: { ...formData.settings, timeZone: e.target.value }
                })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoSync">Sincronização Automática</Label>
                <Switch
                  id="autoSync"
                  checked={formData.settings.autoSync}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      settings: { ...formData.settings, autoSync: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="syncCronograma">Cronogramas de Obra</Label>
                <Switch
                  id="syncCronograma"
                  checked={formData.settings.syncCronograma}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      settings: { ...formData.settings, syncCronograma: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="lembretesObra">Lembretes de Obra</Label>
                <Switch
                  id="lembretesObra"
                  checked={formData.settings.lembretesObra}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      settings: { ...formData.settings, lembretesObra: checked }
                    })
                  }
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleSave}
                className="gradient-construction border-0"
              >
                Salvar Configuração
              </Button>
              <Button 
                variant="outline" 
                onClick={handleTest}
                disabled={isTesting || !isConfigured}
              >
                {isTesting ? 'Testando...' : 'Criar Evento Teste'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {status && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{status.isHealthy ? 'Ativo' : 'Inativo'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última verificação</p>
                  <p className="font-medium">{new Date(status.lastCheck).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taxa de sucesso</p>
                  <p className="font-medium">{status.successRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Eventos criados</p>
                  <p className="font-medium">{status.errorCount || 0}</p>
                </div>
              </div>
            )}

            {config?.settings.defaultCalendarId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Calendário configurado</p>
                    <p className="text-sm text-muted-foreground">{config.settings.defaultCalendarId}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Abrir Calendar
                    </a>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch checked={config.settings.syncCronograma} disabled />
                    <Label className="text-sm">Cronogramas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch checked={config.settings.lembretesObra} disabled />
                    <Label className="text-sm">Lembretes</Label>
                  </div>
                </div>

                {config.settings.timeZone && (
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">Fuso horário configurado</Label>
                    <p className="text-sm text-muted-foreground mt-1">{config.settings.timeZone}</p>
                  </div>
                )}
              </div>
            )}

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Dica:</strong> Configure o Google Calendar API no Google Cloud Console com escopo calendar.events para habilitar a integração.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};