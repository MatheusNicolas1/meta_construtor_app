import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type RDO = Database['public']['Tables']['rdos']['Row'];
type NovoRDO = Database['public']['Tables']['rdos']['Insert'];
type AtualizarRDO = Database['public']['Tables']['rdos']['Update'];

export const rdoService = {
  // Listar todos os RDOs
  async listarRDOs(): Promise<{ data: RDO[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras:obra_id (nome, endereco),
          equipes:equipe_id (nome, lider)
        `)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao listar RDOs:', error);
      return { data: null, error };
    }
  },

  // Buscar RDO por ID
  async buscarRDOPorId(id: string): Promise<{ data: RDO | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras:obra_id (nome, endereco, responsavel),
          equipes:equipe_id (nome, lider)
        `)
        .eq('id', id)
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar RDO:', error);
      return { data: null, error };
    }
  },

  // Criar novo RDO
  async criarRDO(rdo: NovoRDO): Promise<{ data: RDO | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .insert([{
          ...rdo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao criar RDO:', error);
      return { data: null, error };
    }
  },

  // Atualizar RDO
  async atualizarRDO(id: string, updates: AtualizarRDO): Promise<{ data: RDO | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar RDO:', error);
      return { data: null, error };
    }
  },

  // Deletar RDO
  async deletarRDO(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('rdos')
        .delete()
        .eq('id', id);
      
      return { error };
    } catch (error) {
      console.error('Erro ao deletar RDO:', error);
      return { error };
    }
  },

  // Buscar RDOs por obra
  async buscarRDOsPorObra(obraId: string): Promise<{ data: RDO[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          equipes:equipe_id (nome, lider)
        `)
        .eq('obra_id', obraId)
        .order('data', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar RDOs por obra:', error);
      return { data: null, error };
    }
  },

  // Buscar RDOs por equipe
  async buscarRDOsPorEquipe(equipeId: string): Promise<{ data: RDO[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras:obra_id (nome, endereco)
        `)
        .eq('equipe_id', equipeId)
        .order('data', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar RDOs por equipe:', error);
      return { data: null, error };
    }
  },

  // Buscar RDOs por período
  async buscarRDOsPorPeriodo(dataInicio: string, dataFim: string): Promise<{ data: RDO[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras:obra_id (nome, endereco),
          equipes:equipe_id (nome, lider)
        `)
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('data', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar RDOs por período:', error);
      return { data: null, error };
    }
  },

  // Buscar RDOs por status
  async buscarRDOsPorStatus(status: 'rascunho' | 'enviado' | 'aprovado'): Promise<{ data: RDO[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras:obra_id (nome),
          equipes:equipe_id (nome)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar RDOs por status:', error);
      return { data: null, error };
    }
  },

  // Buscar RDOs recentes
  async buscarRDOsRecentes(limit: number = 10): Promise<{ data: RDO[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras:obra_id (nome),
          equipes:equipe_id (nome)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar RDOs recentes:', error);
      return { data: null, error };
    }
  },

  // Buscar RDO do dia por obra e equipe
  async buscarRDODoDia(obraId: string, equipeId: string, data?: string): Promise<{ data: RDO | null; error: any }> {
    try {
      const dataConsulta = data || new Date().toISOString().split('T')[0];
      
      const { data: rdo, error } = await supabase
        .from('rdos')
        .select('*')
        .eq('obra_id', obraId)
        .eq('equipe_id', equipeId)
        .eq('data', dataConsulta)
        .single();
      
      return { data: rdo, error };
    } catch (error) {
      console.error('Erro ao buscar RDO do dia:', error);
      return { data: null, error };
    }
  },

  // Enviar RDO (alterar status para enviado)
  async enviarRDO(id: string): Promise<{ data: RDO | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .update({
          status: 'enviado',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao enviar RDO:', error);
      return { data: null, error };
    }
  },

  // Aprovar RDO
  async aprovarRDO(id: string): Promise<{ data: RDO | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .update({
          status: 'aprovado',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao aprovar RDO:', error);
      return { data: null, error };
    }
  },

  // Estatísticas dos RDOs
  async obterEstatisticasRDOs(): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select('status, horas_ociosas, data');
      
      if (error) return { data: null, error };

      const hoje = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const stats = {
        total: data?.length || 0,
        rascunhos: data?.filter(r => r.status === 'rascunho').length || 0,
        enviados: data?.filter(r => r.status === 'enviado').length || 0,
        aprovados: data?.filter(r => r.status === 'aprovado').length || 0,
        hoje: data?.filter(r => r.data === hoje).length || 0,
        mesAtual: data?.filter(r => r.data >= inicioMes).length || 0,
        horasOciosaTotal: data?.reduce((acc, r) => acc + (r.horas_ociosas || 0), 0) || 0,
        mediaHorasOciosa: data?.length ? (data.reduce((acc, r) => acc + (r.horas_ociosas || 0), 0) / data.length) : 0
      };
      
      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro ao obter estatísticas dos RDOs:', error);
      return { data: null, error };
    }
  },

  // Buscar RDOs com acidentes
  async buscarRDOsComAcidentes(): Promise<{ data: RDO[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras:obra_id (nome),
          equipes:equipe_id (nome)
        `)
        .not('acidentes', 'is', null)
        .neq('acidentes', '')
        .order('data', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar RDOs com acidentes:', error);
      return { data: null, error };
    }
  },

  // Buscar RDOs com horas ociosas
  async buscarRDOsComHorasOciosas(minHoras: number = 1): Promise<{ data: RDO[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obras:obra_id (nome),
          equipes:equipe_id (nome)
        `)
        .gte('horas_ociosas', minHoras)
        .order('horas_ociosas', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar RDOs com horas ociosas:', error);
      return { data: null, error };
    }
  }
}; 