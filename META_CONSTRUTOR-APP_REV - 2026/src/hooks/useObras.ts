import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { notifyObraChange } from '@/utils/notificationService';

export interface CreateObraData {
  nome: string;
  cliente: string;
  localizacao: string;
  responsavel: string;
  tipo: string;
  data_inicio: string;
  previsao_termino: string;
  observacoes?: string;
  descricao?: string;
  area?: string;
  prioridade?: string;
}

export const useObras = () => {
  const queryClient = useQueryClient();

  // Realtime subscription for obras updates
  useEffect(() => {
    const channel = supabase
      .channel('obras-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'obras'
        },
        (payload) => {
          console.log('Obras realtime update:', payload);
          queryClient.invalidateQueries({ queryKey: ['obras'] });
          queryClient.invalidateQueries({ queryKey: ['recent-obras'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const obrasQuery = useQuery({
    queryKey: ['obras'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  const createObra = useMutation({
    mutationFn: async (obraData: CreateObraData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('obras')
        .insert({
          ...obraData,
          user_id: user.id,
          progresso: 0,
          status: 'Iniciando',
        })
        .select()
        .single();

      if (error) throw error;

      // Enviar notificação
      await notifyObraChange(user.id, obraData.nome, 'created', data.id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] });
      queryClient.invalidateQueries({ queryKey: ['recent-obras'] });
      toast.success('Obra criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar obra:', error);
      toast.error('Erro ao criar obra. Tente novamente.');
    },
  });

  const updateObra = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateObraData>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('obras')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Enviar notificação
      await notifyObraChange(user.id, data.nome, 'updated', id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] });
      queryClient.invalidateQueries({ queryKey: ['recent-obras'] });
      toast.success('Obra atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar obra:', error);
      toast.error('Erro ao atualizar obra. Tente novamente.');
    },
  });

  const deleteObra = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar nome da obra antes de deletar
      const { data: obraData } = await supabase
        .from('obras')
        .select('nome')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Enviar notificação
      if (obraData) {
        await notifyObraChange(user.id, obraData.nome, 'deleted');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] });
      queryClient.invalidateQueries({ queryKey: ['recent-obras'] });
      toast.success('Obra excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir obra:', error);
      toast.error('Erro ao excluir obra. Tente novamente.');
    },
  });

  return {
    obras: obrasQuery.data || [],
    isLoading: obrasQuery.isLoading,
    error: obrasQuery.error,
    createObra,
    updateObra,
    deleteObra,
    refetch: obrasQuery.refetch,
  };
};
