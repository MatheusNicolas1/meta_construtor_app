import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

export interface CreateEquipeData {
  nome: string;
  funcao: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
}

export const useEquipesSupabase = () => {
  const queryClient = useQueryClient();
  const { equipe: equipePerms } = usePermissions();

  const equipesQuery = useQuery({
    queryKey: ['equipes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('equipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createEquipe = useMutation({
    mutationFn: async (equipeData: CreateEquipeData) => {
      // Validar permissões e limites
      if (!equipePerms.canCreate) {
        if (equipePerms.isAtLimit) {
          throw new Error('Limite de colaboradores atingido para seu plano. Faça upgrade para continuar.');
        }
        throw new Error('Você não tem permissão para cadastrar colaboradores.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('equipes')
        .insert({
          ...equipeData,
          user_id: user.id,
          ativo: equipeData.ativo ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      toast.success('Colaborador cadastrado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao cadastrar colaborador:', error);
      toast.error('Erro ao cadastrar colaborador. Tente novamente.');
    },
  });

  const updateEquipe = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateEquipeData>) => {
      const { data, error } = await supabase
        .from('equipes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      toast.success('Colaborador atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar colaborador:', error);
      toast.error('Erro ao atualizar colaborador. Tente novamente.');
    },
  });

  const deleteEquipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      toast.success('Colaborador excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir colaborador:', error);
      toast.error('Erro ao excluir colaborador. Tente novamente.');
    },
  });

  return {
    equipes: equipesQuery.data || [],
    isLoading: equipesQuery.isLoading,
    error: equipesQuery.error,
    createEquipe,
    updateEquipe,
    deleteEquipe,
    refetch: equipesQuery.refetch,
  };
};
