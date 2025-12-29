import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentObras = () => {
  return useQuery({
    queryKey: ['recent-obras'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
};
