import { useState, useEffect, useRef } from "react";
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
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Perfil = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, refreshSession } = useAuth();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    bio: "",
    avatar: "",
  });

  const [initialLoading, setInitialLoading] = useState(true);

  // Carregar dados reais do perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserData({
            name: data.name || user.name || "",
            email: user.email || "", // Email vem do Auth/User
            phone: data.phone || "",
            position: data.position || "",
            bio: data.bio || "",
            avatar: data.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar suas informações.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Na bucket avatars as vezes é na raiz ou pasta

      // Tentar bucket 'avatars' padrão primeiro
      let bucketName = 'avatars';
      let { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true });

      // Se falhar, tentar 'community_media' com pasta 'avatars'
      if (uploadError) {
        bucketName = 'community_media';
        const fallbackPath = `avatars/${fileName}`;
        const { error: fallbackError } = await supabase.storage
          .from(bucketName)
          .upload(fallbackPath, file, { upsert: true });

        if (fallbackError) {
          // Última tentativa: pasta 'perfil'
          const profilePath = `perfil/${fileName}`;
          const { error: profileError } = await supabase.storage
            .from(bucketName)
            .upload(profilePath, file, { upsert: true });

          if (profileError) throw uploadError; // Lança o erro original se todos falharem
        } else {
          // Sucesso no fallback (community_media/avatars)
          // Ajustar filePath para o getPublicUrl correto
          // Nota: filePath scope variable nao pode ser mudada, vamos usar a url direto
        }
      }

      // Simplificando a lógica para ser mais robusta:
      // Vamos tentar um, se der erro, lançamos erro, mas vamos mudar para 'avatars' PRIMEIRO como solicitado
    } catch (err) {
      // ...
    }

    // NOVA LÓGICA MAIS LIMPA
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Tentativa 1: Bucket 'avatars' (Padrão Supabase)
      let bucket = 'avatars';
      let path = fileName;

      let { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) {
        // Tentativa 2: Bucket 'community_media' pasta 'avatars'
        bucket = 'community_media';
        path = `avatars/${fileName}`;
        const { error: fallbackError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: true });

        if (fallbackError) throw fallbackError; // Se ambos falharem, é RLS mesmo
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUserData(prev => ({ ...prev, avatar: urlData.publicUrl }));
      await refreshSession();
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });

    } catch (error: any) {
      console.error("Erro no upload:", error);

      const isRLS = error.message?.includes("row-level security");
      const description = isRLS
        ? "Erro de permissão no banco de dados. Contate o administrador."
        : `Não foi possível atualizar a foto: ${error.message}`;

      toast({
        title: "Erro no upload",
        description,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          phone: userData.phone,
          bio: userData.bio,
          position: userData.position,
          // role: userData.role 
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshSession();

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
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
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                  {uploading ? "Enviando..." : "Alterar Foto"}
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
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  disabled={true}
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={userData.position}
                  onChange={(e) => setUserData({ ...userData, position: e.target.value })}
                  placeholder="Ex: Engenheiro Civil"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você e sua experiência"
                value={userData.bio}
                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
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