import { useState } from "react";
import { Camera, Save, User, HelpCircle, MessageSquare, Settings, LogOut, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Onboarding } from "@/components/Onboarding";

const Perfil = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Mock data - replace with actual data from auth system
  const [userData, setUserData] = useState({
    name: "João Silva",
    email: "joao.silva@metaconstrutor.com",
    phone: "(11) 99999-9999",
    role: "Engenheiro Civil",
    bio: "Especialista em gestão de obras com 10+ anos de experiência",
    avatar: "",
  });


  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as informações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {showTour && <Onboarding forceShow={true} onComplete={() => setShowTour(false)} />}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas informações pessoais
          </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais e foto de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(userData.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Alterar Foto
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Arquivos JPG, PNG até 5MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                value={userData.role}
                onChange={(e) => setUserData({...userData, role: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              placeholder="Conte um pouco sobre você e sua experiência"
              value={userData.bio}
              onChange={(e) => setUserData({...userData, bio: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {/* Links de Navegação */}
      <Card>
        <CardHeader>
          <CardTitle>Links Úteis</CardTitle>
          <CardDescription>
            Acesso rápido a configurações e suporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/configuracoes">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Configurações do Sistema
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowTour(true)}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Ver Tour do Sistema
            </Button>
            <Link to="/faq">
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="mr-2 h-4 w-4" />
                Perguntas Frequentes
              </Button>
            </Link>
            <Link to="/feedback">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Enviar Feedback
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default Perfil;