import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequireOrg } from '@/hooks/requireOrg';

export const useDashboardStats = () => {
  const { orgId, isLoading: orgLoading } = useRequireOrg();

  return useQuery({
    queryKey: ['dashboard-stats', orgId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar obras do usuário
      const { data: obras, error: obrasError } = await supabase
        .from('obras')
        .select('id, status')
        .eq('org_id', orgId);

      if (obrasError) throw obrasError;

      // Buscar equipes do usuário
      const { data: equipes, error: equipesError } = await supabase
        .from('equipes')
        .select('id, ativo')
        .eq('org_id', orgId)
        .eq('ativo', true);

      if (equipesError) throw equipesError;

      // Buscar equipamentos do usuário
      const { data: equipamentos, error: equipamentosError } = await supabase
        .from('equipamentos')
        .select('id, status')
        .eq('org_id', orgId)
        .in('status', ['Operacional', 'Em uso']);

      if (equipamentosError) throw equipamentosError;

      // Buscar RDOs pendentes
      const { data: rdos, error: rdosError } = await supabase
        .from('rdos')
        .select('id, status')
        .eq('org_id', orgId)
        .eq('status', 'Em elaboração');

      if (rdosError) throw rdosError;

      // Contar obras ativas
      const obrasAtivas = obras?.filter(o =>
        o.status === 'Em andamento' || o.status === 'Iniciando'
      ).length || 0;

      return {
        obrasAtivas,
        obrasAtivasDescricao: obrasAtivas === 0
          ? 'Nenhuma obra cadastrada'
          : `${obrasAtivas} obra${obrasAtivas > 1 ? 's' : ''} em andamento`,
        equipesTrabalhando: equipes?.length || 0,
        equipesDescricao: equipes?.length === 0
          ? 'Cadastre equipes nas obras'
          : `${equipes.length} equipe${equipes.length > 1 ? 's' : ''} ativa${equipes.length > 1 ? 's' : ''}`,
        equipamentosAtivos: equipamentos?.length || 0,
        equipamentosDescricao: equipamentos?.length === 0
          ? 'Nenhum equipamento cadastrado'
          : `${equipamentos.length} em operação`,
        atividadesPendentes: rdos?.length || 0,
        atividadesDescricao: rdos?.length === 0
          ? 'Nenhuma atividade pendente'
          : `${rdos.length} RDO${rdos.length > 1 ? 's' : ''} em elaboração`
      };
    },
    enabled: !orgLoading && !!orgId,
    staleTime: 60 * 1000, // 1 minuto
    refetchOnWindowFocus: true,
  });
};
