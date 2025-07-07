import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Obra = Database['public']['Tables']['obras']['Row'];
type NovaObra = Database['public']['Tables']['obras']['Insert'];
type AtualizarObra = Database['public']['Tables']['obras']['Update'];

export const obraService = {
  // Listar todas as obras
  async listarObras(): Promise<{ data: Obra[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao listar obras:', error);
      return { data: null, error };
    }
  },

  // Buscar obra por ID
  async buscarObraPorId(id: string): Promise<{ data: Obra | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('id', id)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar obra:', error);
      return { data: null, error };
    }
  },

  // Criar nova obra
  async criarObra(obra: NovaObra): Promise<{ data: Obra | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .insert([{
          ...obra,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao criar obra:', error);
      return { data: null, error };
    }
  },

  // Atualizar obra
  async atualizarObra(id: string, updates: AtualizarObra): Promise<{ data: Obra | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar obra:', error);
      return { data: null, error };
    }
  },

  // Deletar obra
  async deletarObra(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id', id);
      
      return { error };
    } catch (error) {
      console.error('Erro ao deletar obra:', error);
      return { error };
    }
  },

  // Buscar obras por status
  async buscarObrasPorStatus(status: 'ativa' | 'pausada' | 'concluida' | 'cancelada'): Promise<{ data: Obra[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar obras por status:', error);
      return { data: null, error };
    }
  },

  // Buscar obras por responsável
  async buscarObrasPorResponsavel(responsavel: string): Promise<{ data: Obra[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('responsavel', responsavel)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar obras por responsável:', error);
      return { data: null, error };
    }
  },

  // Buscar obras ativas
  async buscarObrasAtivas(): Promise<{ data: Obra[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .eq('status', 'ativa')
        .order('data_inicio', { ascending: true });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar obras ativas:', error);
      return { data: null, error };
    }
  },

  // Buscar obras por orçamento
  async buscarObrasPorFaixaOrcamento(min: number, max: number): Promise<{ data: Obra[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .gte('orcamento', min)
        .lte('orcamento', max)
        .order('orcamento', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar obras por faixa de orçamento:', error);
      return { data: null, error };
    }
  },

  // Estatísticas das obras
  async obterEstatisticasObras(): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('status, orcamento');
      
      if (error) return { data: null, error };

      const stats = {
        total: data?.length || 0,
        ativas: data?.filter(o => o.status === 'ativa').length || 0,
        pausadas: data?.filter(o => o.status === 'pausada').length || 0,
        concluidas: data?.filter(o => o.status === 'concluida').length || 0,
        canceladas: data?.filter(o => o.status === 'cancelada').length || 0,
        orcamentoTotal: data?.reduce((acc, o) => acc + (o.orcamento || 0), 0) || 0,
        orcamentoMedio: data?.length ? (data.reduce((acc, o) => acc + (o.orcamento || 0), 0) / data.length) : 0
      };
      
      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro ao obter estatísticas das obras:', error);
      return { data: null, error };
    }
  }
}; 