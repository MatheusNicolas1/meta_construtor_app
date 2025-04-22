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

type TeamMember = {
  id: string;
  name: string;
  role: string;
  rdosGenerated: number;
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

const Equipe = () => {
  const isMobile = useIsMobile();
  const { locale, setLocale } = useLocale();
  const t = useTranslation(locale);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "collaborator"
  });

  useEffect(() => {
    // Mock data since we're not connecting to the backend yet
    const mockMembers = [
      {
        id: '1',
        name: 'Maria Gonçalves',
        role: t.teamPage.managers,
        rdosGenerated: 5
      },
      {
        id: '2',
        name: 'Matheus',
        role: t.teamPage.administrators,
        rdosGenerated: 3
      },
      {
        id: '3',
        name: 'João Silva',
        role: t.teamPage.collaborators,
        rdosGenerated: 8
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
      role: newMember.role === 'admin' ? t.teamPage.administrators : 
           newMember.role === 'manager' ? t.teamPage.managers : t.teamPage.collaborators,
      rdosGenerated: 0
    };
    
    // Add to members list
    setMembers([...members, member]);
    
    // Reset form and close modal
    setNewMember({ name: "", role: "collaborator" });
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-meta-orange mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.teamPage.title}</h1>
          <p className="text-meta-gray-dark dark:text-meta-gray mt-1">
            {locale === 'pt-BR' ? 'Gerencie sua equipe de trabalho' : 
             locale === 'en-US' ? 'Manage your work team' : 
             locale === 'es-ES' ? 'Gestiona tu equipo de trabajo' :
             locale === 'fr-FR' ? 'Gérez votre équipe de travail' :
             'Verwalten Sie Ihr Arbeitsteam'}
          </p>
        </div>
        <Button 
          className="bg-meta-orange hover:bg-meta-orange/90"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t.teamPage.newMember}
        </Button>
      </div>

      {/* Language Settings Section */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-meta-blue" />
            <h2 className="font-semibold text-xl">{t.teamPage.language}</h2>
          </div>
          <Separator className="my-4" />
          <div className="max-w-md">
            <p className="text-sm text-meta-gray-dark dark:text-meta-gray mb-4">
              {locale === 'pt-BR' ? 'Selecione o idioma de sua preferência:' : 
               locale === 'en-US' ? 'Select your preferred language:' : 
               locale === 'es-ES' ? 'Seleccione su idioma preferido:' :
               locale === 'fr-FR' ? 'Sélectionnez votre langue préférée:' :
               'Wählen Sie Ihre bevorzugte Sprache:'}
            </p>
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t.teamPage.selectLanguage} />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Section */}
      {isMobile ? (
        // Mobile layout with cards
        <div className="space-y-4">
          {members.map(member => (
            <Card key={member.id} className="w-full">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <div className="text-sm text-meta-gray-dark dark:text-meta-gray">
                    {member.role}
                  </div>
                  <div className="text-sm">
                    {member.rdosGenerated} {t.teamPage.rdosGenerated}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="h-11 w-20 flex-1"
                    onClick={() => handleEdit(member.id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t.common.edit}
                  </Button>
                  <Button 
                    size="sm"
                    variant="destructive" 
                    className="h-11 w-20 flex-1"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.common.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop layout with table
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.teamPage.name}</TableHead>
                <TableHead>{t.teamPage.role}</TableHead>
                <TableHead>{t.teamPage.rdosGenerated}</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.rdosGenerated}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm"
                        variant="outline" 
                        onClick={() => handleEdit(member.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t.common.edit}
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive" 
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t.common.delete}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

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

export default Equipe;
