import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRequireOrg } from '@/hooks/requireOrg';
import { useAuthUserId } from './useAuthUserId';

export interface CreateEquipamentoData {
  nome: string;
  categoria: string;
  status?: string;
  observacoes?: string;
}

export const useEquipamentosSupabase = () => {
  const queryClient = useQueryClient();
  const { orgId, isLoading: orgLoading } = useRequireOrg();
  const { userId, isLoading: userLoading } = useAuthUserId();

  const equipamentosQuery = useQuery({
    queryKey: ['equipamentos', orgId, userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];
      if (!orgId) return [];

      const { data, error } = await supabase
        .from('equipamentos')
        .select('*')
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !orgLoading && !userLoading && !!orgId && !!userId,
  });

  const createEquipamento = useMutation({
    mutationFn: async (equipamentoData: CreateEquipamentoData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id || !orgId) throw new Error('Usuário ou organização não autenticados');

      const { data, error } = await supabase
        .from('equipamentos')
        .insert({
          ...equipamentoData,
          org_id: orgId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos', orgId, userId] });
      toast.success('Equipamento cadastrado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar equipamento:', error);
      toast.error('Erro ao criar equipamento. Tente novamente.');
    },
  });

  const updateEquipamento = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateEquipamentoData>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id || !orgId) throw new Error('Usuário ou organização não autenticados');

      const { data, error } = await supabase
        .from('equipamentos')
        .update(updateData)
        .eq('id', id)
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos', orgId, userId] });
      toast.success('Equipamento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar equipamento:', error);
      toast.error('Erro ao atualizar equipamento. Tente novamente.');
    },
  });

  const deleteEquipamento = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id || !orgId) throw new Error('Usuário ou organização não autenticados');

      const { error } = await supabase
        .from('equipamentos')
        .delete()
        .eq('id', id)
        .eq('org_id', orgId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos', orgId, userId] });
      toast.success('Equipamento excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir equipamento:', error);
      toast.error('Erro ao excluir equipamento. Tente novamente.');
    },
  });

  return {
    equipamentos: equipamentosQuery.data || [],
    isLoading: equipamentosQuery.isLoading || orgLoading || userLoading,
    error: equipamentosQuery.error,
    createEquipamento,
    updateEquipamento,
    deleteEquipamento,
    refetch: equipamentosQuery.refetch,
  };
};
