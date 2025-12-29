import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEquipamentos = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setEquipamentos([]);
        return;
      }

      const { data, error } = await supabase
        .from('equipamentos')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true })
        .limit(50);

      if (error) throw error;

      // Map Supabase data to Equipamento interface
      const mappedData: Equipamento[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        categoria: item.categoria,
        modelo: item.observacoes || '', // Using observacoes as modelo fallback
        status: (item.status as any) || 'Disponível',
        tipo: 'Próprio' // Default to Próprio
      }));

      setEquipamentos(mappedData);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadEquipamentos();
  }, [loadEquipamentos]);

  const searchEquipamentos = useCallback((searchTerm: string): Equipamento[] => {
    if (!searchTerm) return equipamentos;

    return equipamentos.filter(eq =>
      eq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [equipamentos]);

  const getEquipamentoById = useCallback((id: string): Equipamento | undefined => {
    return equipamentos.find(eq => eq.id === id);
  }, [equipamentos]);

  return {
    equipamentos,
    searchEquipamentos,
    getEquipamentoById,
    isLoading
  };
}