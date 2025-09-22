import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Webhook, Plus, Edit, Trash2, Copy, TestTube } from "lucide-react";
import { WebhookConfig, IntegrationEvent } from "@/types/integration";
import { useToast } from "@/hooks/use-toast";

interface WebhookManagerProps {
  webhooks: WebhookConfig[];
  onSave: (webhook: WebhookConfig) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTest: (webhook: WebhookConfig) => Promise<boolean>;
}

export const WebhookManager = ({ webhooks, onSave, onDelete, onTest }: WebhookManagerProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  
  const availableEvents: IntegrationEvent[] = [
    'obra.created',
    'obra.updated', 
    'obra.completed',
    'rdo.created',
    'rdo.approved',
    'checklist.completed',
    'atividade.created',
    'atividade.completed',
    'colaborador.added',
    'equipe.created',
    'documento.uploaded',
    'notification.urgent',
    'report.daily',
    'report.weekly',
    'backup.completed'
  ];

  const [formData, setFormData] = useState<WebhookConfig>({
    id: '',
    name: '',
    url: '',
    method: 'POST',
    headers: {},
    events: [],
    isActive: true,
    secret: '',
    retryCount: 3,
    timeout: 30
  });

  const handleEdit = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setFormData(webhook);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingWebhook(null);
    setFormData({
      id: '',
      name: '',
      url: '',
      method: 'POST',
      headers: {},
      events: [],
      isActive: true,
      secret: '',
      retryCount: 3,
      timeout: 30
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.url) {
        toast({
          title: "Campos obrigatórios",
          description: "Nome e URL são obrigatórios",
          variant: "destructive",
        });
        return;
      }

      const webhookToSave = {
        ...formData,
        id: editingWebhook?.id || `webhook-${Date.now()}`
      };

      await onSave(webhookToSave);
      setIsDialogOpen(false);
      toast({
        title: "Webhook salvo",
        description: "Configuração do webhook salva com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o webhook",
        variant: "destructive",
      });
    }
  };

  const handleTest = async (webhook: WebhookConfig) => {
    setIsTesting(webhook.id);
    try {
      const success = await onTest(webhook);
      toast({
        title: success ? "Teste realizado" : "Falha no teste",
        description: success 
          ? "Webhook testado com sucesso" 
          : "Falha ao testar o webhook",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao testar o webhook",
        variant: "destructive",
      });
    } finally {
      setIsTesting(null);
    }
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada",
      description: "URL do webhook copiada para a área de transferência",
    });
  };

  const addHeader = () => {
    const key = prompt("Nome do header:");
    const value = prompt("Valor do header:");
    if (key && value) {
      setFormData({
        ...formData,
        headers: { ...formData.headers, [key]: value }
      });
    }
  };

  const removeHeader = (key: string) => {
    const { [key]: removed, ...rest } = formData.headers;
    setFormData({ ...formData, headers: rest });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Webhook className="h-5 w-5 text-construction-blue" />
              <CardTitle>Gerenciamento de Webhooks</CardTitle>
            </div>
            <Button onClick={handleNew} className="gradient-construction border-0">
              <Plus className="h-4 w-4 mr-1" />
              Novo Webhook
            </Button>
          </div>
          <CardDescription>
            Configure webhooks para receber eventos do sistema em tempo real
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Eventos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{webhook.url}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{webhook.events.length} eventos</Badge>
                  </TableCell>
                  <TableCell>
                    {webhook.isActive ? (
                      <Badge variant="default" className="bg-construction-green">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(webhook)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(webhook)}
                        disabled={isTesting === webhook.id}
                      >
                        <TestTube className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyWebhookUrl(webhook.url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(webhook.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {webhooks.length === 0 && (
            <div className="text-center py-8">
              <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum webhook configurado</p>
              <Button onClick={handleNew} variant="outline" className="mt-2">
                Criar primeiro webhook
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingWebhook ? 'Editar Webhook' : 'Novo Webhook'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Método</Label>
                <Select value={formData.method} onValueChange={(value: any) => setFormData({ ...formData, method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                placeholder="https://api.exemplo.com/webhook"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">Secret (opcional)</Label>
              <Input
                id="secret"
                placeholder="Secret para validação do webhook"
                value={formData.secret}
                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retryCount">Tentativas</Label>
                <Input
                  id="retryCount"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.retryCount}
                  onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (segundos)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="5"
                  max="300"
                  value={formData.timeout}
                  onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Webhook Ativo</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Eventos</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {availableEvents.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={event}
                      checked={formData.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, events: [...formData.events, event] });
                        } else {
                          setFormData({ ...formData, events: formData.events.filter(e => e !== event) });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={event} className="text-sm">{event}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Headers HTTP</Label>
                <Button variant="outline" size="sm" onClick={addHeader}>
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
              {Object.entries(formData.headers).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Input value={key} disabled className="flex-1" />
                  <Input value={value} disabled className="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => removeHeader(key)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="gradient-construction border-0">
                {editingWebhook ? 'Atualizar' : 'Criar'} Webhook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};