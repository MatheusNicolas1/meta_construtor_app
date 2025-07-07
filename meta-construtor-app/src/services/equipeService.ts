import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Equipe = Database['public']['Tables']['equipes']['Row'];
type NovaEquipe = Database['public']['Tables']['equipes']['Insert'];
type AtualizarEquipe = Database['public']['Tables']['equipes']['Update'];
type Colaborador = Database['public']['Tables']['colaboradores']['Row'];
type NovoColaborador = Database['public']['Tables']['colaboradores']['Insert'];

export interface EquipeCompleta extends Equipe {
  colaboradores?: Colaborador[];
  obra_vinculada?: {
    id: string;
    nome: string;
  };
}

export const equipeService = {
  // ========== OPERAÇÕES BÁSICAS DE EQUIPE ==========

  // Listar todas as equipes
  async listarEquipes(filtros?: {
    status?: string;
    empresa_id?: string;
    disponivel?: boolean;
  }): Promise<{ data: EquipeCompleta[] | null; error: any }> {
    try {
      let query = supabase
        .from('equipes')
        .select(`
          *,
          colaboradores(*),
          obra_vinculada:obras!equipes_obra_id_fkey(id, nome)
        `);

      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros?.empresa_id) {
        query = query.eq('empresa_id', filtros.empresa_id);
      }
      if (filtros?.disponivel) {
        query = query.eq('status', 'disponivel');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao listar equipes:', error);
      return { data: null, error };
    }
  },

  // Buscar equipe por ID
  async buscarEquipePorId(id: string): Promise<{ data: EquipeCompleta | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('equipes')
        .select(`
          *,
          colaboradores(*),
          obra_vinculada:obras!equipes_obra_id_fkey(id, nome)
        `)
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
      return { data: null, error };
    }
  },

  // Criar nova equipe
  async criarEquipe(equipe: NovaEquipe): Promise<{ data: Equipe | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('equipes')
        .insert([{
          ...equipe,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      return { data: null, error };
    }
  },

  // Atualizar equipe
  async atualizarEquipe(id: string, updates: AtualizarEquipe): Promise<{ data: Equipe | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('equipes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      return { data: null, error };
    }
  },

  // Deletar equipe
  async deletarEquipe(id: string): Promise<{ error: any }> {
    try {
      // Verificar se a equipe está vinculada a alguma obra ativa
      const { data: obraVinculada } = await supabase
        .from('obras_equipes')
        .select('obra_id')
        .eq('equipe_id', id)
        .eq('status', 'ativa')
        .single();

      if (obraVinculada) {
        return { error: 'Não é possível deletar equipe vinculada a obra ativa' };
      }

      const { error } = await supabase
        .from('equipes')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      return { error };
    }
  },

  // ========== GESTÃO DE COLABORADORES ==========

  // Adicionar colaborador à equipe
  async adicionarColaborador(colaborador: NovoColaborador): Promise<{ data: Colaborador | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .insert([{
          ...colaborador,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao adicionar colaborador:', error);
      return { data: null, error };
    }
  },

  // Remover colaborador da equipe
  async removerColaborador(colaboradorId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('colaboradores')
        .update({
          equipe_id: null,
          status: 'inativo',
          updated_at: new Date().toISOString()
        })
        .eq('id', colaboradorId);

      return { error };
    } catch (error) {
      console.error('Erro ao remover colaborador:', error);
      return { error };
    }
  },

  // Transferir colaborador entre equipes
  async transferirColaborador(colaboradorId: string, novaEquipeId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('colaboradores')
        .update({
          equipe_id: novaEquipeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', colaboradorId);

      return { error };
    } catch (error) {
      console.error('Erro ao transferir colaborador:', error);
      return { error };
    }
  },

  // Listar colaboradores de uma equipe
  async listarColaboradoresEquipe(equipeId: string): Promise<{ data: Colaborador[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('equipe_id', equipeId)
        .eq('status', 'ativo')
        .order('nome', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Erro ao listar colaboradores da equipe:', error);
      return { data: null, error };
    }
  },

  // ========== DISPONIBILIDADE E ALOCAÇÃO ==========

  // Listar equipes disponíveis
  async listarEquipesDisponiveis(empresaId?: string): Promise<{ data: Equipe[] | null; error: any }> {
    try {
      let query = supabase
        .from('equipes')
        .select('*')
        .eq('status', 'disponivel');

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query.order('nome', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Erro ao listar equipes disponíveis:', error);
      return { data: null, error };
    }
  },

  // Marcar equipe como disponível
  async marcarComoDisponivel(equipeId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('equipes')
        .update({
          status: 'disponivel',
          obra_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipeId);

      return { error };
    } catch (error) {
      console.error('Erro ao marcar equipe como disponível:', error);
      return { error };
    }
  },

  // Alocar equipe para obra
  async alocarParaObra(equipeId: string, obraId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('equipes')
        .update({
          status: 'ativa',
          obra_id: obraId,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipeId);

      return { error };
    } catch (error) {
      console.error('Erro ao alocar equipe para obra:', error);
      return { error };
    }
  },

  // ========== RELATÓRIOS E ESTATÍSTICAS ==========

  // Relatório de produtividade da equipe
  async relatorioProductividade(equipeId: string, dataInicio: string, dataFim: string): Promise<{ data: any; error: any }> {
    try {
      // Buscar RDOs da equipe no período
      const { data: rdos, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obra:obras(nome)
        `)
        .eq('equipe_id', equipeId)
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('data', { ascending: true });

      if (error) return { data: null, error };

      const totalRdos = rdos?.length || 0;
      const totalHorasOciosas = rdos?.reduce((acc, rdo) => acc + (rdo.horas_ociosas || 0), 0) || 0;
      const rdosComAcidentes = rdos?.filter(rdo => rdo.acidentes && rdo.acidentes.trim() !== '').length || 0;

      const relatorio = {
        periodo: { inicio: dataInicio, fim: dataFim },
        total_rdos: totalRdos,
        total_horas_ociosas: totalHorasOciosas,
        rdos_com_acidentes: rdosComAcidentes,
        media_horas_ociosas: totalRdos > 0 ? totalHorasOciosas / totalRdos : 0,
        taxa_acidentes: totalRdos > 0 ? (rdosComAcidentes / totalRdos) * 100 : 0,
        rdos_por_obra: rdos?.reduce((acc: any, rdo) => {
          const obraNome = rdo.obra?.nome || 'Obra não identificada';
          acc[obraNome] = (acc[obraNome] || 0) + 1;
          return acc;
        }, {}) || {}
      };

      return { data: relatorio, error: null };
    } catch (error) {
      console.error('Erro ao gerar relatório de produtividade:', error);
      return { data: null, error };
    }
  },

  // Estatísticas das equipes
  async obterEstatisticasEquipes(empresaId?: string): Promise<{ data: any; error: any }> {
    try {
      let query = supabase.from('equipes').select('status');
      
      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;
      
      if (error) return { data: null, error };

      // Contar colaboradores
      let colaboradoresQuery = supabase.from('colaboradores').select('status, equipe_id');
      const { data: colaboradores } = await colaboradoresQuery;

      const stats = {
        total_equipes: data?.length || 0,
        equipes_ativas: data?.filter(e => e.status === 'ativa').length || 0,
        equipes_disponiveis: data?.filter(e => e.status === 'disponivel').length || 0,
        equipes_inativas: data?.filter(e => e.status === 'inativa').length || 0,
        total_colaboradores: colaboradores?.filter(c => c.status === 'ativo').length || 0,
        colaboradores_sem_equipe: colaboradores?.filter(c => c.status === 'ativo' && !c.equipe_id).length || 0
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro ao obter estatísticas das equipes:', error);
      return { data: null, error };
    }
  }
}; 