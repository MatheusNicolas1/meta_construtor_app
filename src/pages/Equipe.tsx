
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Edit, Trash2, Globe } from "lucide-react";
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

const Equipe = () => {
  const isMobile = useIsMobile();
  const { locale, setLocale } = useLocale();
  const t = useTranslation(locale);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

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
    console.log(`Edit member with id: ${id}`);
    // In a real app, this would open an edit modal or navigate to an edit page
  };

  const handleDelete = (id: string) => {
    console.log(`Delete member with id: ${id}`);
    // In a real app, this would show a confirmation dialog then delete on confirm
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
    </div>
  );
};

export default Equipe;
