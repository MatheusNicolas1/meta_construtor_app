import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRequireOrg } from '@/hooks/requireOrg';
import { useAuthUserId } from './useAuthUserId';

export interface Equipamento {
  id: string;
  nome: string;
  categoria: string;
  modelo: string;
  status: "Disponível" | "Ativo" | "Manutenção" | "Inativo";
  obra?: string;
  tipo?: "Próprio" | "Aluguel";
}

export function useEquipamentos() {
  const { orgId, isLoading: orgLoading } = useRequireOrg();
  const { userId, isLoading: userLoading } = useAuthUserId();

  const { data: equipamentos = [], isLoading } = useQuery({
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

  const searchEquipamentos = useCallback(
    async (query: string) => {
      if (!orgId || !userId) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('equipamentos')
        .select('*')
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .ilike('nome', `%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    [orgId, userId]
  );

  const getEquipamentoById = useCallback(
    async (id: string) => {
      if (!orgId || !userId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('equipamentos')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    [orgId, userId]
  );

  return {
    equipamentos,
    isLoading: isLoading || orgLoading || userLoading,
    searchEquipamentos,
    getEquipamentoById,
  };
}