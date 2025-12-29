import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Eye, Copy, Check } from "lucide-react";
import { AchievementsBadges } from "@/components/AchievementsBadges";
import { ReferralManager } from "@/components/ReferralManager";

const ConfigurarPerfil = () => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    company: "",
    position: "",
    is_public: false,
    hide_signature: false,
    slug: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          company: data.company || "",
          position: data.position || "",
          is_public: data.is_public || false,
          hide_signature: data.hide_signature || false,
          slug: data.slug || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar perfil");
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate slug if public and not set
      let slug = profile.slug;
      if (profile.is_public && !slug) {
        slug = generateSlug(profile.name);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio,
          company: profile.company,
          position: profile.position,
          is_public: profile.is_public,
          hide_signature: profile.hide_signature,
          slug: slug,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, slug });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      if (error.code === "23505") {
        toast.error("Este slug já está em uso. Tente outro nome.");
      } else {
        toast.error("Erro ao atualizar perfil");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyPublicUrl = () => {
    const url = `${window.location.origin}/perfil/${profile.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurar Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações de privacidade
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize seus dados de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={profile.position}
                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                placeholder="Ex: Engenheiro Civil"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              placeholder="Nome da sua empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Conte um pouco sobre você..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Privacidade</CardTitle>
          <CardDescription>
            Controle como suas informações são exibidas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-profile">Perfil Público</Label>
              <p className="text-sm text-muted-foreground">
                Permite que outras pessoas vejam seu perfil profissional
              </p>
            </div>
            <Switch
              id="public-profile"
              checked={profile.is_public}
              onCheckedChange={(checked) => setProfile({ ...profile, is_public: checked })}
            />
          </div>

          {profile.is_public && profile.slug && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <Label>Link do Perfil Público</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/perfil/${profile.slug}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`/perfil/${profile.slug}`, "_blank")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyPublicUrl}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hide-signature">Ocultar Assinatura em Relatórios</Label>
              <p className="text-sm text-muted-foreground">
                Não exibir suas informações nos relatórios gerados
              </p>
            </div>
            <Switch
              id="hide-signature"
              checked={profile.hide_signature}
              onCheckedChange={(checked) => setProfile({ ...profile, hide_signature: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>

      <AchievementsBadges />
      <ReferralManager />
    </div>
  );
};

export default ConfigurarPerfil;
