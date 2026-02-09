import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Shield, Mail, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/components/auth/AuthContext";
import { useRequireOrg } from "@/hooks/requireOrg";

const AdminManagers = () => {
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { orgId, isLoading: orgLoading } = useRequireOrg();

  const isSuperAdmin = user?.email === 'matheusnicolas.org@gmail.com';

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admin-managers', orgId],
    queryFn: async () => {
      const { data: adminMembers, error } = await (supabase as any)
        .from('org_members')
        .select('user_id, profiles(id, name, email, avatar_url)')
        .eq('org_id', orgId)
        .eq('status', 'active')
        .eq('role', 'Administrador');

      if (error) throw error;
      // @ts-ignore
      return adminMembers.map(r => r.profiles).filter(Boolean);
    },
    enabled: !orgLoading && !!orgId,
  });

  const addAdmin = useMutation({
    mutationFn: async (userEmail: string) => {
      if (!isSuperAdmin) throw new Error('Acesso negado');

      // Buscar usuário pelo email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (profileError) throw new Error('Usuário não encontrado');

      // Verificar se já existe membership
      const { data: existingMember, error: checkError } = await (supabase as any)
        .from('org_members')
        .select('*')
        .eq('org_id', orgId)
        .eq('user_id', profile.id)
        .single();

      if (existingMember) {
        // Atualizar role existente
        const { error: updateError } = await (supabase as any)
          .from('org_members')
          .update({
            role: 'Administrador',
            status: 'active'
          })
          .eq('org_id', orgId)
          .eq('user_id', profile.id);

        if (updateError) throw updateError;
      } else {
        // Criar novo membership
        const { error: insertError } = await (supabase as any)
          .from('org_members')
          .insert({
            org_id: orgId,
            user_id: profile.id,
            role: 'Administrador',
            status: 'active'
          });

        if (insertError) throw insertError;
      }

      // Log de auditoria
      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: 'ADD_ADMIN',
        target_user_id: profile.id,
        details: { email: userEmail }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-managers'] });
      setEmail("");
      toast.success('Administrador adicionado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro: ' + error.message);
    }
  });

  const removeAdmin = useMutation({
    mutationFn: async (userId: string) => {
      if (!isSuperAdmin) throw new Error('Acesso negado');

      // Atualizar membership para Colaborador (ao invés de deletar)
      const { error } = await (supabase as any)
        .from('org_members')
        .update({ role: 'Colaborador' })
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .eq('role', 'Administrador');

      if (error) throw error;

      // Log de auditoria
      await supabase.from('admin_audit_logs').insert({
        admin_id: user?.id,
        action: 'REMOVE_ADMIN',
        target_user_id: userId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-managers'] });
      toast.success('Administrador removido com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao remover administrador: ' + error.message);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Se não for super admin, nem mostra o componente (embora a aba já esteja escondida, dupla segurança)
  if (!isSuperAdmin) {
    return (
      <div className="p-4 text-center ">
        <p className="text-destructive font-medium">Você não tem permissão para acessar esta área.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Admin Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Administrador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do Usuário</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={() => addAdmin.mutate(email)}
                disabled={!email || addAdmin.isPending}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              O usuário deve estar cadastrado na plataforma
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admins List */}
      <div className="grid gap-4">
        {admins?.map((admin: any) => (
          <Card key={admin.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{admin.name}</CardTitle>
                    <Badge variant="default">Administrador</Badge>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover Administrador</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover {admin.name} como administrador?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeAdmin.mutate(admin.id)}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{admin.email}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {admins?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhum administrador cadastrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminManagers;
