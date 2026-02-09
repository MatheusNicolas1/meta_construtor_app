import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequireOrg } from '@/hooks/requireOrg';

export const useRecentObras = () => {
  const { orgId, isLoading: orgLoading } = useRequireOrg();

  return useQuery({
    queryKey: ['recent-obras', orgId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('org_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !orgLoading && !!orgId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
};
