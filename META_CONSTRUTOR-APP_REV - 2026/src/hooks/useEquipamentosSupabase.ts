import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreateEquipamentoData {
  nome: string;
  categoria: string;
  status?: string;
  observacoes?: string;
}

export const useEquipamentosSupabase = () => {
  const queryClient = useQueryClient();

  const equipamentosQuery = useQuery({
    queryKey: ['equipamentos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('equipamentos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createEquipamento = useMutation({
    mutationFn: async (equipamentoData: CreateEquipamentoData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('equipamentos')
        .insert({
          ...equipamentoData,
          user_id: user.id,
          status: equipamentoData.status || 'Operacional',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast.success('Equipamento cadastrado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao cadastrar equipamento:', error);
      toast.error('Erro ao cadastrar equipamento. Tente novamente.');
    },
  });

  const updateEquipamento = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateEquipamentoData>) => {
      const { data, error } = await supabase
        .from('equipamentos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast.success('Equipamento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar equipamento:', error);
      toast.error('Erro ao atualizar equipamento. Tente novamente.');
    },
  });

  const deleteEquipamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamentos'] });
      toast.success('Equipamento excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir equipamento:', error);
      toast.error('Erro ao excluir equipamento. Tente novamente.');
    },
  });

  return {
    equipamentos: equipamentosQuery.data || [],
    isLoading: equipamentosQuery.isLoading,
    error: equipamentosQuery.error,
    createEquipamento,
    updateEquipamento,
    deleteEquipamento,
    refetch: equipamentosQuery.refetch,
  };
};
