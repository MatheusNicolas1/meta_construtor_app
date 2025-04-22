import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const { user } = useAuth();
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

  useEffect(() => {
    // Mock data since we're not connecting to the backend yet
    const mockMembers = [
      {
        id: '1',
        name: 'Maria Gonçalves',
        email: 'maria@exemplo.com',
        whatsapp: '+55 11 98765-4321',
        role: t.teamPage.managers,
        rdosGenerated: 5,
        avatar: ""
      },
      {
        id: '2',
        name: 'Matheus',
        email: 'matheus@exemplo.com',
        whatsapp: '+55 11 91234-5678',
        role: t.teamPage.administrators,
        rdosGenerated: 3,
        avatar: ""
      },
      {
        id: '3',
        name: 'João Silva',
        email: 'joao@exemplo.com',
        whatsapp: '+55 11 99876-5432',
        role: t.teamPage.collaborators,
        rdosGenerated: 8,
        avatar: ""
      }
    ];
    
    setMembers(mockMembers);
    setLoading(false);
  }, [locale, t]);

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
      role: newMember.role === 'admin' ? t.teamPage.administrators : 
           newMember.role === 'manager' ? t.teamPage.managers : t.teamPage.collaborators,
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

  const handleSaveProfile = () => {
    useToastToast({
      title: "Perfil atualizado",
      description: "Suas informações de perfil foram atualizadas com sucesso!",
    });
  };
  
  const handleInviteMember = () => {
    useToastToast({
      title: "Convite enviado",
      description: "O convite foi enviado para o e-mail fornecido.",
    });
  };
  
  const handleSavePreferences = () => {
    useToastToast({
      title: "Preferências salvas",
      description: "Suas preferências foram atualizadas com sucesso!",
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
        <h1 className="text-3xl font-bold">{locale === 'pt-BR' ? 'Configurações' : 
          locale === 'en-US' ? 'Settings' : 
          locale === 'es-ES' ? 'Configuración' :
          locale === 'fr-FR' ? 'Paramètres' :
          'Einstellungen'}</h1>
        
        <Tabs defaultValue="conta" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="conta">
              {locale === 'pt-BR' ? 'Conta' : 
              locale === 'en-US' ? 'Account' : 
              locale === 'es-ES' ? 'Cuenta' :
              locale === 'fr-FR' ? 'Compte' :
              'Konto'}
            </TabsTrigger>
            <TabsTrigger value="equipe">
              {locale === 'pt-BR' ? 'Equipe' : 
              locale === 'en-US' ? 'Team' : 
              locale === 'es-ES' ? 'Equipo' :
              locale === 'fr-FR' ? 'Équipe' :
              'Team'}
            </TabsTrigger>
            <TabsTrigger value="preferencias">
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
                <CardTitle>Perfil do Usuário</CardTitle>
                <CardDescription>
                  Gerencie suas informações de perfil e configurações de conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                    <AvatarFallback className="text-2xl">
                      {user?.email?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
        <div>
                    <Button variant="outline" className="mb-2">Alterar foto</Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF ou PNG. Tamanho máximo de 1MB.
          </p>
        </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input id="name" defaultValue={user?.user_metadata?.full_name || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" defaultValue={user?.user_metadata?.company || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" defaultValue={user?.user_metadata?.phone || ""} />
                  </div>
      </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notificações por email</Label>
                    <Switch id="notifications" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre atualizações de projetos, RDOs e análises.
                  </p>
          </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveProfile}>Salvar alterações</Button>
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
                    <div className="col-span-5">Usuário</div>
                    <div className="col-span-4">Email</div>
                    <div className="col-span-2">Função</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {members.map((member) => (
                    <div key={member.id} className="grid grid-cols-12 p-4 border-b last:border-0 items-center">
                      <div className="col-span-5 flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <div className="col-span-4 text-muted-foreground">{member.email}</div>
                      <div className="col-span-2">
                        <Badge variant={
                          member.role === "admin" ? "default" : 
                          member.role === "manager" ? "outline" : "secondary"
                        }>
                          {member.role}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(member.id)}>...</Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Convidar novos membros</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input placeholder="Endereço de email" type="email" className="flex-1" />
                    <Select defaultValue="editor">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="collaborator">Colaborador</SelectItem>
              </SelectContent>
            </Select>
                    <Button onClick={handleInviteMember}>Convidar</Button>
                  </div>
          </div>
        </CardContent>
      </Card>
          </TabsContent>
          
          <TabsContent value="preferencias">
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>
                  Personalize a aparência e o comportamento da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Aparência</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Tema</Label>
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
                  <h3 className="font-medium">Linguagem</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
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
                  <h3 className="font-medium">Exibição de dados</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Formato de data</Label>
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
                      <Label htmlFor="timeFormat">Formato de hora</Label>
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
                  <h3 className="font-medium">Comportamento</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="confirmActions">Confirmar ações importantes</Label>
                      <Switch id="confirmActions" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Exibir diálogos de confirmação para ações como exclusão e saída sem salvar
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoSave">Salvar automaticamente</Label>
                      <Switch id="autoSave" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Salvar alterações automaticamente enquanto você trabalha
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSavePreferences}>Salvar preferências</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Member Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
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
                <Label htmlFor="name">
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
                <Label htmlFor="email">
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
                <Label htmlFor="whatsapp">
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
                <Label htmlFor="role">
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {locale === 'pt-BR' ? 'Cancelar' : 
                 locale === 'en-US' ? 'Cancel' : 
                 'Cancelar'}
              </Button>
              <Button type="submit" className="bg-meta-orange hover:bg-meta-orange/90">
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
        <DialogContent>
          <DialogHeader>
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
                  <Label htmlFor="edit-name">
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
                  <Label htmlFor="edit-email">
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
                  <Label htmlFor="edit-whatsapp">
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
                  <Label htmlFor="edit-role">
                    {locale === 'pt-BR' ? 'Função' : 
                     locale === 'en-US' ? 'Role' : 
                     'Función'}
                  </Label>
                  <Select 
                    value={
                      currentMember.role === t.teamPage.administrators ? 'admin' :
                      currentMember.role === t.teamPage.managers ? 'manager' : 'collaborator'
                    } 
                    onValueChange={(value) => {
                      const newRole = value === 'admin' ? t.teamPage.administrators : 
                                     value === 'manager' ? t.teamPage.managers : t.teamPage.collaborators;
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
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  {locale === 'pt-BR' ? 'Cancelar' : 
                   locale === 'en-US' ? 'Cancel' : 
                   'Cancelar'}
                </Button>
                <Button type="submit" className="bg-meta-orange hover:bg-meta-orange/90">
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
        <AlertDialogContent>
          <AlertDialogHeader>
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
          <AlertDialogFooter>
            <AlertDialogCancel>
              {locale === 'pt-BR' ? 'Cancelar' : 
               locale === 'en-US' ? 'Cancel' : 
               'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
