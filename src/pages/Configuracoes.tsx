import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Edit, Trash2, Globe, Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocale } from "@/contexts/LocaleContext";
import { useTranslation } from "@/locales/translations";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  rdosGenerated: number;
  avatar: string;
};

const languageOptions = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en-US', label: 'English' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' }
];

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'collaborator', label: 'Colaborador' }
];

const Configuracoes = () => {
  const isMobile = useIsMobile();
  const { locale, setLocale } = useLocale();
  const t = useTranslation(locale);
  const { user, refreshSession } = useAuth();
  const { toast: useToastToast } = useToast();
  const { setTheme, theme } = useTheme();
  const [activeTab, setActiveTab] = useState("conta");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    whatsapp: "",
    role: "collaborator"
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    avatar_url: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      // Carregar dados do usuário a partir dos metadados
      setProfileData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        company: user.user_metadata?.company || '',
        phone: user.user_metadata?.phone || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      });

      // Buscar dados adicionais da tabela profiles se necessário
      loadUserProfile(user.id);
    }
  }, [user]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        return;
      }

      if (data) {
        setProfileData(prevData => ({
          ...prevData,
          fullName: data.full_name || prevData.fullName,
          company: data.company || prevData.company,
          phone: data.phone || prevData.phone,
          avatar_url: data.avatar_url || prevData.avatar_url,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      // Verificar tamanho (máximo 1MB)
      if (file.size > 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 1MB");
        return;
      }

      // Verificar tipo
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error("Formato de arquivo não suportado. Use JPG, PNG ou GIF");
        return;
      }

      console.log("Iniciando upload de avatar...");
      
      // Upload para o Supabase Storage - usar pasta com ID do usuário
      const fileName = `${user.id}/avatar-${Date.now()}`;
      console.log("Caminho do arquivo:", fileName);
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) {
        console.error("Erro no upload:", error);
        throw error;
      }

      console.log("Upload realizado com sucesso:", data);

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (urlData) {
        console.log("URL pública obtida:", urlData.publicUrl);
        
        // Atualizar state
        setProfileData({
          ...profileData,
          avatar_url: urlData.publicUrl
        });

        toast.success("Foto atualizada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao atualizar foto. Tente novamente.");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSavingProfile(true);
    console.log("Salvando perfil com dados:", profileData);
    
    try {
      // Atualizar metadados no auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          company: profileData.company,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url
        }
      });

      if (authError) {
        console.error("Erro ao atualizar metadados do usuário:", authError);
        throw authError;
      }

      console.log("Metadados do usuário atualizados com sucesso");

      // Verificar se o perfil já existe e atualizar/criar na tabela profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      const profilePayload = {
        id: user.id,
        full_name: profileData.fullName,
        company: profileData.company,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url,
        updated_at: new Date().toISOString()
      };

      console.log("Payload para atualização do perfil:", profilePayload);
      
      let error;
      
      if (existingProfile) {
        console.log("Atualizando perfil existente");
        // Atualizar perfil existente
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profilePayload)
          .eq('id', user.id);
          
        error = updateError;
        
        if (updateError) {
          console.error("Erro ao atualizar perfil:", updateError);
        }
      } else {
        console.log("Criando novo perfil");
        // Criar novo perfil
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            ...profilePayload,
            created_at: new Date().toISOString()
          });
          
        error = insertError;
        
        if (insertError) {
          console.error("Erro ao criar perfil:", insertError);
        }
      }

      if (error) throw error;
      
      // Recarregar a sessão para obter os metadados atualizados
      await refreshSession();
      console.log("Sessão atualizada com sucesso");
      
      useToastToast({
        title: "Perfil atualizado",
        description: "Suas informações de perfil foram atualizadas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEdit = (id: string) => {
    const memberToEdit = members.find(member => member.id === id);
    if (memberToEdit) {
      setCurrentMember(memberToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const memberToDelete = members.find(member => member.id === id);
    if (memberToDelete) {
      setCurrentMember(memberToDelete);
      setIsDeleteAlertOpen(true);
    }
  };

  const confirmDelete = () => {
    if (currentMember) {
      // Filter out the member to delete
      const updatedMembers = members.filter(member => member.id !== currentMember.id);
      setMembers(updatedMembers);
      
      // Show success toast
      toast.success(locale === 'pt-BR' ? 'Membro removido com sucesso' : 
                    locale === 'en-US' ? 'Member successfully removed' : 
                    'Miembro eliminado con éxito');
      
      // Close dialog
      setIsDeleteAlertOpen(false);
      setCurrentMember(null);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentMember) {
      // Update the member in the list
      const updatedMembers = members.map(member => 
        member.id === currentMember.id ? currentMember : member
      );
      
      setMembers(updatedMembers);
      setIsEditModalOpen(false);
      
      // Show success message
      toast.success(locale === 'pt-BR' ? 'Membro atualizado com sucesso' : 
                    locale === 'en-US' ? 'Member successfully updated' : 
                    'Miembro actualizado con éxito');
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that name is not empty
    if (!newMember.name.trim()) {
      toast.error(locale === 'pt-BR' ? 'Por favor, insira um nome' : 
                  locale === 'en-US' ? 'Please enter a name' : 
                  'Por favor, introduzca un nombre');
      return;
    }
    
    // Create new member object
    const member: TeamMember = {
      id: Date.now().toString(), // Generate a unique ID
      name: newMember.name,
      email: newMember.email,
      whatsapp: newMember.whatsapp,
      role: newMember.role === 'admin' ? (locale === 'pt-BR' ? 'Administrador' : 
            locale === 'en-US' ? 'Administrator' : 
            locale === 'es-ES' ? 'Administrador' :
            locale === 'fr-FR' ? 'Administrateur' :
            'Administrator') : 
           newMember.role === 'manager' ? (locale === 'pt-BR' ? 'Gerente' : 
            locale === 'en-US' ? 'Manager' : 
            locale === 'es-ES' ? 'Gerente' :
            locale === 'fr-FR' ? 'Gérant' :
            'Manager') : 
           (locale === 'pt-BR' ? 'Colaborador' : 
            locale === 'en-US' ? 'Collaborator' : 
            locale === 'es-ES' ? 'Colaborador' :
            locale === 'fr-FR' ? 'Collaborateur' :
            'Collaborator'),
      rdosGenerated: 0,
      avatar: ""
    };
    
    // Add to members list
    setMembers([...members, member]);
    
    // Reset form and close modal
    setNewMember({ name: "", email: "", whatsapp: "", role: "collaborator" });
    setIsAddModalOpen(false);
    
    // Show success message
    toast.success(locale === 'pt-BR' ? 'Membro adicionado com sucesso' : 
                  locale === 'en-US' ? 'Member successfully added' : 
                  'Miembro añadido con éxito');
  };

  const handleLanguageChange = (value: string) => {
    const selectedLocale = value as 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE';
    setLocale(selectedLocale);
    localStorage.setItem('meta-constructor-locale', selectedLocale);
    
    // Show confirmation toast in the newly selected language
    const messages = {
      'pt-BR': 'Idioma alterado para Português',
      'en-US': 'Language changed to English',
      'es-ES': 'Idioma cambiado a Español',
      'fr-FR': 'Langue changée en Français',
      'de-DE': 'Sprache auf Deutsch geändert'
    };
    
    toast.success(messages[selectedLocale]);
  };

  const handleSavePreferences = () => {
    useToastToast({
      title: "Preferências salvas",
      description: "Suas preferências foram atualizadas com sucesso!",
    });
  };
  
  const handleInviteMember = () => {
    useToastToast({
      title: "Convite enviado",
      description: "O convite foi enviado para o e-mail fornecido.",
    });
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-meta-orange mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center sm:text-left">{locale === 'pt-BR' ? 'Configurações' : 
          locale === 'en-US' ? 'Settings' : 
          locale === 'es-ES' ? 'Configuración' :
          locale === 'fr-FR' ? 'Paramètres' :
          'Einstellungen'}</h1>
        
        <Tabs defaultValue="conta" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="conta" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              {locale === 'pt-BR' ? 'Conta' : 
              locale === 'en-US' ? 'Account' : 
              locale === 'es-ES' ? 'Cuenta' :
              locale === 'fr-FR' ? 'Compte' :
              'Konto'}
            </TabsTrigger>
            <TabsTrigger value="equipe" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              {locale === 'pt-BR' ? 'Equipe' : 
              locale === 'en-US' ? 'Team' : 
              locale === 'es-ES' ? 'Equipo' :
              locale === 'fr-FR' ? 'Équipe' :
              'Team'}
            </TabsTrigger>
            <TabsTrigger value="preferencias" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
              {locale === 'pt-BR' ? 'Preferências' : 
              locale === 'en-US' ? 'Preferences' : 
              locale === 'es-ES' ? 'Preferencias' :
              locale === 'fr-FR' ? 'Préférences' :
              'Einstellungen'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="conta">
            <Card>
              <CardHeader>
                <CardTitle className="text-center sm:text-left">Perfil do Usuário</CardTitle>
                <CardDescription className="text-center sm:text-left">
                  Gerencie suas informações de perfil e configurações de conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-8 items-center justify-center sm:justify-start">
                  <Avatar className="w-24 h-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <AvatarImage src={profileData.avatar_url || ""} />
                    <AvatarFallback className="text-2xl">
                      {profileData.fullName?.substring(0, 2).toUpperCase() || profileData.email?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <Button variant="outline" className="mb-2 w-full sm:w-auto" onClick={() => fileInputRef.current?.click()}>Alterar foto</Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF ou PNG. Tamanho máximo de 1MB.
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Label htmlFor="fullName" className="min-w-[150px] text-left">Nome completo</Label>
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      value={profileData.fullName} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Label htmlFor="email" className="min-w-[150px] text-left">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Label htmlFor="phone" className="min-w-[150px] text-left">Telefone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={profileData.phone} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Label htmlFor="company" className="min-w-[150px] text-left">Empresa</Label>
                    <Input 
                      id="company" 
                      value={profileData.company} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Label htmlFor="notifications" className="min-w-[150px] text-left">Notificações por email</Label>
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground text-left mr-2">
                      Receba notificações sobre atualizações de projetos, RDOs e análises.
                    </p>
                    <Switch id="notifications" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center sm:justify-end">
                <Button 
                  onClick={handleSaveProfile} 
                  className="w-full sm:w-auto" 
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Salvando...
                    </>
                  ) : 'Salvar alterações'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="equipe">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Equipe</CardTitle>
                <CardDescription>
                  Equipe Gerencie sua equipe de trabalho
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium">Membros da equipe</h3>
                    <p className="text-sm text-muted-foreground">
                      Gerencie quem tem acesso ao seu projeto
                    </p>
                  </div>
                  <Button onClick={() => setIsAddModalOpen(true)}>Adicionar membro</Button>
                </div>
                
                <div className="border rounded-lg">
                  <div className="grid grid-cols-12 p-4 border-b bg-muted font-medium">
                    <div className="col-span-12 sm:col-span-5">Usuário</div>
                    <div className="hidden md:block col-span-4">Email</div>
                    <div className="hidden sm:block sm:col-span-2 text-center sm:text-left">Função</div>
                    <div className="hidden sm:block sm:col-span-1 text-right">Ações</div>
                  </div>
                  
                  {members.map((member) => (
                    <div 
                      key={member.id} 
                      className="grid grid-cols-12 p-4 border-b last:border-0 items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors"
                      onClick={() => handleEdit(member.id)}
                    >
                      <div className="col-span-12 sm:col-span-5 flex items-center gap-3 justify-start">
                        <Avatar>
                          <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col w-full overflow-hidden">
                          <span className="font-medium truncate">{member.name}</span>
                          <span className={cn(
                            "text-xs mt-1 sm:hidden truncate",
                            member.role === 'Administrador' || member.role === 'Administrator' ? "text-meta-blue font-medium" : 
                            member.role === 'Gerente' || member.role === 'Manager' ? "text-meta-orange font-medium" : 
                            "text-muted-foreground"
                          )}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:block col-span-4 text-muted-foreground">{member.email}</div>
                      <div className="hidden sm:block sm:col-span-2 text-center sm:text-left">
                        <Badge variant={
                          member.role === 'Administrador' || member.role === 'Administrator' ? "default" : 
                          member.role === 'Gerente' || member.role === 'Manager' ? "outline" : "secondary"
                        }>
                          {member.role}
                        </Badge>
                      </div>
                      <div className="hidden sm:block sm:col-span-1 text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(member.id);
                        }}>...</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferencias">
            <Card>
              <CardHeader>
                <CardTitle className="text-center sm:text-left">Preferências</CardTitle>
                <CardDescription className="text-center sm:text-left">
                  Personalize a aparência e o comportamento da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-center md:text-left">Aparência</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="theme" className="block text-center md:text-left">Tema</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Selecione o tema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-center md:text-left">Linguagem</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="block text-center md:text-left">Idioma</Label>
                      <Select value={locale} onValueChange={handleLanguageChange}>
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                          <SelectItem value="fr-FR">Français</SelectItem>
                          <SelectItem value="de-DE">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-center md:text-left">Exibição de dados</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat" className="block text-center md:text-left">Formato de data</Label>
                      <Select defaultValue="dd-mm-yyyy">
                        <SelectTrigger id="dateFormat">
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeFormat" className="block text-center md:text-left">Formato de hora</Label>
                      <Select defaultValue="24h">
                        <SelectTrigger id="timeFormat">
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24 horas</SelectItem>
                          <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-center md:text-left">Comportamento</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="confirmActions" className="text-center md:text-left">Confirmar ações importantes</Label>
                      <Switch id="confirmActions" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                      Exibir diálogos de confirmação para ações como exclusão e saída sem salvar
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoSave" className="text-center md:text-left">Salvar automaticamente</Label>
                      <Switch id="autoSave" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                      Salvar alterações automaticamente enquanto você trabalha
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center sm:justify-end">
                <Button onClick={handleSavePreferences} className="w-full sm:w-auto">Salvar preferências</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Member Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader className="text-center sm:text-left">
            <DialogTitle>{locale === 'pt-BR' ? 'Adicionar Novo Membro' : 
                            locale === 'en-US' ? 'Add New Member' : 
                            'Añadir Nuevo Miembro'}</DialogTitle>
            <DialogDescription>
              {locale === 'pt-BR' ? 'Preencha os dados do novo membro da equipe' : 
                locale === 'en-US' ? 'Fill in the details of the new team member' : 
                'Rellene los detalles del nuevo miembro del equipo'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddMember}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="block text-center sm:text-left">
                  {locale === 'pt-BR' ? 'Nome' : 
                   locale === 'en-US' ? 'Name' : 
                   'Nombre'}
                </Label>
                <Input 
                  id="name" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder={locale === 'pt-BR' ? 'Digite o nome do membro' : 
                               locale === 'en-US' ? 'Enter member name' : 
                               'Escriba el nombre del miembro'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="block text-center sm:text-left">
                  {locale === 'pt-BR' ? 'E-mail' : 
                   locale === 'en-US' ? 'Email' : 
                   'Correo electrónico'}
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder={locale === 'pt-BR' ? 'Digite o e-mail do membro' : 
                               locale === 'en-US' ? 'Enter member email' : 
                               'Escriba el correo electrónico del miembro'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="block text-center sm:text-left">
                  {locale === 'pt-BR' ? 'WhatsApp' : 
                   locale === 'en-US' ? 'WhatsApp' : 
                   'WhatsApp'}
                </Label>
                <Input 
                  id="whatsapp" 
                  value={newMember.whatsapp}
                  onChange={(e) => setNewMember({...newMember, whatsapp: e.target.value})}
                  placeholder={locale === 'pt-BR' ? 'Digite o número de WhatsApp' : 
                               locale === 'en-US' ? 'Enter WhatsApp number' : 
                               'Escriba el número de WhatsApp'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="block text-center sm:text-left">
                  {locale === 'pt-BR' ? 'Função' : 
                   locale === 'en-US' ? 'Role' : 
                   'Función'}
                </Label>
                <Select 
                  value={newMember.role} 
                  onValueChange={(value) => setNewMember({...newMember, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'pt-BR' ? 'Selecione uma função' : 
                                             locale === 'en-US' ? 'Select a role' : 
                                             'Seleccione una función'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      {locale === 'pt-BR' ? 'Administrador' : 
                       locale === 'en-US' ? 'Administrator' : 
                       'Administrador'}
                    </SelectItem>
                    <SelectItem value="manager">
                      {locale === 'pt-BR' ? 'Gerente' : 
                       locale === 'en-US' ? 'Manager' : 
                       'Gerente'}
                    </SelectItem>
                    <SelectItem value="collaborator">
                      {locale === 'pt-BR' ? 'Colaborador' : 
                       locale === 'en-US' ? 'Collaborator' : 
                       'Colaborador'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto">
                {locale === 'pt-BR' ? 'Cancelar' : 
                 locale === 'en-US' ? 'Cancel' : 
                 'Cancelar'}
              </Button>
              <Button type="submit" className="bg-meta-orange hover:bg-meta-orange/90 w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                {locale === 'pt-BR' ? 'Adicionar' : 
                 locale === 'en-US' ? 'Add' : 
                 'Añadir'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader className="text-center sm:text-left">
            <DialogTitle>{locale === 'pt-BR' ? 'Editar Membro' : 
                            locale === 'en-US' ? 'Edit Member' : 
                            'Editar Miembro'}</DialogTitle>
            <DialogDescription>
              {locale === 'pt-BR' ? 'Altere os dados do membro da equipe' : 
                locale === 'en-US' ? 'Change the team member details' : 
                'Cambiar los detalles del miembro del equipo'}
            </DialogDescription>
          </DialogHeader>
          
          {currentMember && (
            <form onSubmit={handleSaveEdit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="block text-center sm:text-left">
                    {locale === 'pt-BR' ? 'Nome' : 
                     locale === 'en-US' ? 'Name' : 
                     'Nombre'}
                  </Label>
                  <Input 
                    id="edit-name" 
                    value={currentMember.name}
                    onChange={(e) => setCurrentMember({...currentMember, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="block text-center sm:text-left">
                    {locale === 'pt-BR' ? 'E-mail' : 
                     locale === 'en-US' ? 'Email' : 
                     'Correo electrónico'}
                  </Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    value={currentMember.email}
                    onChange={(e) => setCurrentMember({...currentMember, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-whatsapp" className="block text-center sm:text-left">
                    {locale === 'pt-BR' ? 'WhatsApp' : 
                     locale === 'en-US' ? 'WhatsApp' : 
                     'WhatsApp'}
                  </Label>
                  <Input 
                    id="edit-whatsapp" 
                    value={currentMember.whatsapp}
                    onChange={(e) => setCurrentMember({...currentMember, whatsapp: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="block text-center sm:text-left">
                    {locale === 'pt-BR' ? 'Função' : 
                     locale === 'en-US' ? 'Role' : 
                     'Función'}
                  </Label>
                  <Select 
                    value={
                      currentMember.role === 'Administrador' || currentMember.role === 'Administrator' ? 'admin' :
                      currentMember.role === 'Gerente' || currentMember.role === 'Manager' ? 'manager' : 'collaborator'
                    } 
                    onValueChange={(value) => {
                      let newRole = '';
                      if (value === 'admin') {
                        newRole = locale === 'pt-BR' ? 'Administrador' : 
                                  locale === 'en-US' ? 'Administrator' : 
                                  locale === 'es-ES' ? 'Administrador' :
                                  locale === 'fr-FR' ? 'Administrateur' :
                                  'Administrator';
                      } else if (value === 'manager') {
                        newRole = locale === 'pt-BR' ? 'Gerente' : 
                                  locale === 'en-US' ? 'Manager' : 
                                  locale === 'es-ES' ? 'Gerente' :
                                  locale === 'fr-FR' ? 'Gérant' :
                                  'Manager';
                      } else {
                        newRole = locale === 'pt-BR' ? 'Colaborador' : 
                                  locale === 'en-US' ? 'Collaborator' : 
                                  locale === 'es-ES' ? 'Colaborador' :
                                  locale === 'fr-FR' ? 'Collaborateur' :
                                  'Collaborator';
                      }
                      setCurrentMember({...currentMember, role: newRole});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        {locale === 'pt-BR' ? 'Administrador' : 
                         locale === 'en-US' ? 'Administrator' : 
                         'Administrador'}
                      </SelectItem>
                      <SelectItem value="manager">
                        {locale === 'pt-BR' ? 'Gerente' : 
                         locale === 'en-US' ? 'Manager' : 
                         'Gerente'}
                      </SelectItem>
                      <SelectItem value="collaborator">
                        {locale === 'pt-BR' ? 'Colaborador' : 
                         locale === 'en-US' ? 'Collaborator' : 
                         'Colaborador'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
                  {locale === 'pt-BR' ? 'Cancelar' : 
                   locale === 'en-US' ? 'Cancel' : 
                   'Cancelar'}
                </Button>
                <Button type="submit" className="bg-meta-orange hover:bg-meta-orange/90 w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {locale === 'pt-BR' ? 'Salvar' : 
                   locale === 'en-US' ? 'Save' : 
                   'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader className="text-center sm:text-left">
            <AlertDialogTitle>
              {locale === 'pt-BR' ? 'Confirmar Exclusão' : 
               locale === 'en-US' ? 'Confirm Deletion' : 
               'Confirmar Eliminación'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'pt-BR' ? `Tem certeza que deseja excluir ${currentMember?.name}? Esta ação não pode ser desfeita.` : 
               locale === 'en-US' ? `Are you sure you want to delete ${currentMember?.name}? This action cannot be undone.` : 
               `¿Está seguro de que desea eliminar a ${currentMember?.name}? Esta acción no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              {locale === 'pt-BR' ? 'Cancelar' : 
               locale === 'en-US' ? 'Cancel' : 
               'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              {locale === 'pt-BR' ? 'Excluir' : 
               locale === 'en-US' ? 'Delete' : 
               'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Configuracoes;
