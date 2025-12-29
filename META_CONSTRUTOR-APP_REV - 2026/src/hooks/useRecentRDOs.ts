import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentRDOs = () => {
  return useQuery({
    queryKey: ['recent-rdos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras (nome)
        `)
        .eq('criado_por_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
};
