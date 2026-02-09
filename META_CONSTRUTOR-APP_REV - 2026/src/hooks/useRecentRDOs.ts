import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequireOrg } from '@/hooks/requireOrg';

export const useRecentRDOs = () => {
  const { orgId, isLoading: orgLoading } = useRequireOrg();

  return useQuery({
    queryKey: ['recent-rdos', orgId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras (nome)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !orgLoading && !!orgId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
};
