import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FAQ } from '@/components/FAQ';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Download,
  Upload,
  Save,
  Check,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';

type Theme = 'dark' | 'light' | 'system';

export default function Configuracoes() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Load settings from localStorage
  const [settings, setSettings] = useState({
    nome: localStorage.getItem('user_nome') || 'João Silva',
    email: localStorage.getItem('user_email') || 'joao.silva@metaconstrutor.com',
    cargo: localStorage.getItem('user_cargo') || 'Engenheiro Civil',
    empresa: localStorage.getItem('user_empresa') || 'MetaConstrutor Ltda',
    telefone: localStorage.getItem('user_telefone') || '(11) 99999-9999',
    theme: theme as Theme,
    notificacoes: {
      email: localStorage.getItem('notif_email') === 'true',
      push: localStorage.getItem('notif_push') === 'true',
      sms: localStorage.getItem('notif_sms') === 'true'
    },
    privacidade: {
      localizacao: localStorage.getItem('priv_localizacao') === 'true',
      analitcs: localStorage.getItem('priv_analytics') === 'true'
    }
  });

  useEffect(() => {
    // Load profile image from localStorage
    const savedImage = localStorage.getItem('profile_image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('user_nome', settings.nome);
      localStorage.setItem('user_email', settings.email);
      localStorage.setItem('user_cargo', settings.cargo);
      localStorage.setItem('user_empresa', settings.empresa);
      localStorage.setItem('user_telefone', settings.telefone);
      localStorage.setItem('notif_email', settings.notificacoes.email.toString());
      localStorage.setItem('notif_push', settings.notificacoes.push.toString());
      localStorage.setItem('notif_sms', settings.notificacoes.sms.toString());
      localStorage.setItem('priv_localizacao', settings.privacidade.localizacao.toString());
      localStorage.setItem('priv_analytics', settings.privacidade.analitcs.toString());
      
      // Apply theme change
      if (settings.theme !== theme) {
        setTheme(settings.theme);
        localStorage.setItem('theme', settings.theme);
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Configurações salvas!",
        description: "Suas alterações foram aplicadas com sucesso.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    toast({
      title: "Tema alterado!",
      description: `Tema ${newTheme === 'light' ? 'claro' : newTheme === 'dark' ? 'escuro' : 'do sistema'} aplicado com sucesso.`,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Apenas arquivos JPG e PNG são aceitos.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileImage(result);
      localStorage.setItem('profile_image', result);
      
      // Disparar evento customizado para atualizar o avatar em tempo real
      window.dispatchEvent(new CustomEvent('avatar-updated', {
        detail: { imageUrl: result }
      }));
      
      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleNotificationChange = (type: 'email' | 'push' | 'sms', value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificacoes: { ...prev.notificacoes, [type]: value }
    }));
  };

  const handlePrivacyChange = (type: 'localizacao' | 'analitcs', value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacidade: { ...prev.privacidade, [type]: value }
    }));
  };

  const handleExportData = async () => {
    try {
      toast({
        title: "Exportando dados...",
        description: "Preparando seus dados para download.",
      });

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock data export
      const data = {
        usuario: settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metaconstrutor-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Dados exportados!",
        description: "O arquivo foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Gerencie suas preferências e dados da conta</p>
          </div>
          <Button onClick={handleSaveSettings} loading={isLoading} className="btn-standard">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="privacidade">Privacidade</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil e dados de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {profileImage ? (
                      <AvatarImage src={profileImage} alt="Foto de perfil" />
                    ) : (
                      <AvatarFallback className="text-lg bg-gradient-to-r from-[#ff5722] to-[#ff7043] text-white">
                        {settings.nome.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <input
                        type="file"
                        id="profile-upload"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('profile-upload')?.click()}
                        className="btn-secondary-standard"
                      >
                        <Upload className="h-4 w-4" />
                        Alterar foto
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG até 2MB
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      value={settings.nome}
                      onChange={(e) => setSettings(prev => ({ ...prev, nome: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      value={settings.cargo}
                      onChange={(e) => setSettings(prev => ({ ...prev, cargo: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={settings.empresa}
                      onChange={(e) => setSettings(prev => ({ ...prev, empresa: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={settings.telefone}
                      onChange={(e) => setSettings(prev => ({ ...prev, telefone: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Tema e Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Tema da interface</Label>
                  <Select value={settings.theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    O tema será aplicado imediatamente em toda a aplicação
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Prévia do tema atual</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-2 bg-[#ff5722] rounded"></div>
                          <div className="h-2 bg-muted rounded w-3/4"></div>
                          <div className="h-2 bg-muted rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Configure como deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notificações por e-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações importantes por e-mail
                      </p>
                    </div>
                    <Switch
                      checked={settings.notificacoes.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notificações push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações no navegador
                      </p>
                    </div>
                    <Switch
                      checked={settings.notificacoes.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notificações por SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba alertas urgentes por SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.notificacoes.sms}
                      onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacidade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacidade e Dados
                </CardTitle>
                <CardDescription>
                  Gerencie suas preferências de privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Compartilhar localização</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que o app use sua localização para RDOs
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacidade.localizacao}
                      onCheckedChange={(checked) => handlePrivacyChange('localizacao', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Análise de uso</Label>
                      <p className="text-sm text-muted-foreground">
                        Ajude-nos a melhorar com dados anônimos de uso
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacidade.analitcs}
                      onCheckedChange={(checked) => handlePrivacyChange('analitcs', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Exportar dados</h4>
                  <p className="text-sm text-muted-foreground">
                    Baixe uma cópia de todos os seus dados armazenados
                  </p>
                  <Button variant="outline" onClick={handleExportData} className="btn-secondary-standard">
                    <Download className="h-4 w-4" />
                    Exportar meus dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <FAQ />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
