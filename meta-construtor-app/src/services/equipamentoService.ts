import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Equipamento = Database['public']['Tables']['equipamentos']['Row'];
type NovoEquipamento = Database['public']['Tables']['equipamentos']['Insert'];
type AtualizarEquipamento = Database['public']['Tables']['equipamentos']['Update'];

export interface EquipamentoCompleto extends Equipamento {
  obra_vinculada?: {
    id: string;
    nome: string;
  };
  historico_uso?: any[];
}

export const equipamentoService = {
  // ========== OPERAÇÕES BÁSICAS DE EQUIPAMENTO ==========

  // Listar todos os equipamentos
  async listarEquipamentos(filtros?: {
    status?: string;
    tipo?: 'proprio' | 'alugado';
    categoria?: string;
    empresa_id?: string;
    disponivel?: boolean;
  }): Promise<{ data: EquipamentoCompleto[] | null; error: any }> {
    try {
      let query = supabase
        .from('equipamentos')
        .select(`
          *,
          obra_vinculada:obras!equipamentos_obra_atual_fkey(id, nome)
        `);

      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros?.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }
      if (filtros?.empresa_id) {
        query = query.eq('empresa_id', filtros.empresa_id);
      }
      if (filtros?.disponivel) {
        query = query.eq('status', 'disponivel');
      }

      const { data, error } = await query.order('nome', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Erro ao listar equipamentos:', error);
      return { data: null, error };
    }
  },

  // Buscar equipamento por ID
  async buscarEquipamentoPorId(id: string): Promise<{ data: EquipamentoCompleto | null; error: any }> {
    try {
      const { data: equipamento, error } = await supabase
        .from('equipamentos')
        .select(`
          *,
          obra_vinculada:obras!equipamentos_obra_atual_fkey(id, nome)
        `)
        .eq('id', id)
        .single();

      if (error) return { data: null, error };

      // Buscar histórico de uso do equipamento
      const { data: historico } = await supabase
        .from('obras_equipamentos')
        .select(`
          *,
          obra:obras(nome)
        `)
        .eq('equipamento_id', id)
        .order('data_alocacao', { ascending: false });

      const equipamentoCompleto: EquipamentoCompleto = {
        ...equipamento,
        historico_uso: historico || []
      };

      return { data: equipamentoCompleto, error };
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error);
      return { data: null, error };
    }
  },

  // Criar novo equipamento
  async criarEquipamento(equipamento: NovoEquipamento): Promise<{ data: Equipamento | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('equipamentos')
        .insert([{
          ...equipamento,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao criar equipamento:', error);
      return { data: null, error };
    }
  },

  // Atualizar equipamento
  async atualizarEquipamento(id: string, updates: AtualizarEquipamento): Promise<{ data: Equipamento | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('equipamentos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      return { data: null, error };
    }
  },

  // Deletar equipamento
  async deletarEquipamento(id: string): Promise<{ error: any }> {
    try {
      // Verificar se o equipamento está em uso
      const { data: emUso } = await supabase
        .from('equipamentos')
        .select('status, obra_atual')
        .eq('id', id)
        .single();

      if (emUso?.status === 'em-uso' || emUso?.obra_atual) {
        return { error: 'Não é possível deletar equipamento em uso' };
      }

      const { error } = await supabase
        .from('equipamentos')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar equipamento:', error);
      return { error };
    }
  },

  // ========== CONTROLE DE STATUS ==========

  // Marcar equipamento como disponível
  async marcarComoDisponivel(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('equipamentos')
        .update({
          status: 'disponivel',
          obra_atual: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao marcar equipamento como disponível:', error);
      return { error };
    }
  },

  // Marcar equipamento em manutenção
  async marcarEmManutencao(id: string, proximaManutencao?: string, observacoes?: string): Promise<{ error: any }> {
    try {
      const updateData: any = {
        status: 'manutencao',
        updated_at: new Date().toISOString()
      };

      if (proximaManutencao) {
        updateData.proxima_manutencao = proximaManutencao;
      }

      if (observacoes) {
        updateData.observacoes = observacoes;
      }

      const { error } = await supabase
        .from('equipamentos')
        .update(updateData)
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao marcar equipamento em manutenção:', error);
      return { error };
    }
  },

  // Marcar equipamento como quebrado
  async marcarComoQuebrado(id: string, observacoes?: string): Promise<{ error: any }> {
    try {
      const updateData: any = {
        status: 'quebrado',
        updated_at: new Date().toISOString()
      };

      if (observacoes) {
        updateData.observacoes = observacoes;
      }

      const { error } = await supabase
        .from('equipamentos')
        .update(updateData)
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao marcar equipamento como quebrado:', error);
      return { error };
    }
  },

  // ========== DISPONIBILIDADE E FILTROS ==========

  // Listar equipamentos disponíveis
  async listarEquipamentosDisponiveis(categoria?: string, empresaId?: string): Promise<{ data: Equipamento[] | null; error: any }> {
    try {
      let query = supabase
        .from('equipamentos')
        .select('*')
        .eq('status', 'disponivel');

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query.order('nome', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Erro ao listar equipamentos disponíveis:', error);
      return { data: null, error };
    }
  },

  // Listar categorias de equipamentos
  async listarCategorias(empresaId?: string): Promise<{ data: string[] | null; error: any }> {
    try {
      let query = supabase
        .from('equipamentos')
        .select('categoria');

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;

      if (error) return { data: null, error };

      const categorias = [...new Set(data?.map(eq => eq.categoria) || [])];
      return { data: categorias, error: null };
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      return { data: null, error };
    }
  },

  // Verificar equipamentos próximos da manutenção
  async equipamentosProximosManutencao(diasAntecedencia: number = 7): Promise<{ data: Equipamento[] | null; error: any }> {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);
      const dataLimiteStr = dataLimite.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('equipamentos')
        .select('*')
        .not('proxima_manutencao', 'is', null)
        .lte('proxima_manutencao', dataLimiteStr)
        .neq('status', 'quebrado')
        .order('proxima_manutencao', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar equipamentos próximos da manutenção:', error);
      return { data: null, error };
    }
  },

  // ========== RELATÓRIOS E CUSTOS ==========

  // Relatório de utilização do equipamento
  async relatorioUtilizacao(equipamentoId: string, dataInicio?: string, dataFim?: string): Promise<{ data: any; error: any }> {
    try {
      let query = supabase
        .from('obras_equipamentos')
        .select(`
          *,
          obra:obras(nome, status)
        `)
        .eq('equipamento_id', equipamentoId);

      if (dataInicio) {
        query = query.gte('data_alocacao', dataInicio);
      }

      if (dataFim) {
        query = query.lte('data_alocacao', dataFim);
      }

      const { data: historico, error } = await query.order('data_alocacao', { ascending: false });

      if (error) return { data: null, error };

      const totalAlocacoes = historico?.length || 0;
      const totalHorasUtilizadas = historico?.reduce((acc, h) => acc + (h.horas_utilizadas || 0), 0) || 0;
      const custoTotalGerado = historico?.reduce((acc, h) => acc + (h.custo_total || 0), 0) || 0;

      // Calcular tempo médio por obra
      const temposPorObra = historico?.map(h => {
        if (h.data_alocacao && h.data_liberacao) {
          const inicio = new Date(h.data_alocacao);
          const fim = new Date(h.data_liberacao);
          return (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24); // dias
        }
        return 0;
      }) || [];

      const tempoMedioPorObra = temposPorObra.length > 0 
        ? temposPorObra.reduce((acc, t) => acc + t, 0) / temposPorObra.length 
        : 0;

      const relatorio = {
        periodo: { inicio: dataInicio, fim: dataFim },
        total_alocacoes: totalAlocacoes,
        total_horas_utilizadas: totalHorasUtilizadas,
        custo_total_gerado: custoTotalGerado,
        tempo_medio_por_obra: tempoMedioPorObra,
        obras_atendidas: [...new Set(historico?.map(h => h.obra?.nome).filter(Boolean) || [])],
        utilizacao_por_obra: historico?.reduce((acc: any, h) => {
          const obraNome = h.obra?.nome || 'Obra não identificada';
          if (!acc[obraNome]) {
            acc[obraNome] = {
              horas: 0,
              custo: 0,
              alocacoes: 0
            };
          }
          acc[obraNome].horas += h.horas_utilizadas || 0;
          acc[obraNome].custo += h.custo_total || 0;
          acc[obraNome].alocacoes += 1;
          return acc;
        }, {}) || {}
      };

      return { data: relatorio, error: null };
    } catch (error) {
      console.error('Erro ao gerar relatório de utilização:', error);
      return { data: null, error };
    }
  },

  // Calcular custo de utilização
  async calcularCustoUtilizacao(equipamentoId: string, horasUtilizadas: number): Promise<{ data: number; error: any }> {
    try {
      const { data: equipamento, error } = await supabase
        .from('equipamentos')
        .select('valor_diario, tipo')
        .eq('id', equipamentoId)
        .single();

      if (error) return { data: 0, error };

      const valorHora = (equipamento.valor_diario || 0) / 8; // 8 horas por dia
      const custoTotal = valorHora * horasUtilizadas;

      return { data: custoTotal, error: null };
    } catch (error) {
      console.error('Erro ao calcular custo de utilização:', error);
      return { data: 0, error };
    }
  },

  // Estatísticas dos equipamentos
  async obterEstatisticasEquipamentos(empresaId?: string): Promise<{ data: any; error: any }> {
    try {
      let query = supabase.from('equipamentos').select('status, tipo, valor_diario');
      
      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;
      
      if (error) return { data: null, error };

      const stats = {
        total_equipamentos: data?.length || 0,
        disponiveis: data?.filter(e => e.status === 'disponivel').length || 0,
        em_uso: data?.filter(e => e.status === 'em-uso').length || 0,
        manutencao: data?.filter(e => e.status === 'manutencao').length || 0,
        quebrados: data?.filter(e => e.status === 'quebrado').length || 0,
        proprios: data?.filter(e => e.tipo === 'proprio').length || 0,
        alugados: data?.filter(e => e.tipo === 'alugado').length || 0,
        valor_total_diario: data?.reduce((acc, e) => acc + (e.valor_diario || 0), 0) || 0,
        valor_medio_diario: data?.length ? (data.reduce((acc, e) => acc + (e.valor_diario || 0), 0) / data.length) : 0,
        taxa_utilizacao: data?.length ? ((data.filter(e => e.status === 'em-uso').length / data.length) * 100) : 0
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro ao obter estatísticas dos equipamentos:', error);
      return { data: null, error };
    }
  },

  // ========== MANUTENÇÃO ==========

  // Agendar manutenção
  async agendarManutencao(equipamentoId: string, dataManutencao: string, observacoes?: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('equipamentos')
        .update({
          proxima_manutencao: dataManutencao,
          observacoes: observacoes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipamentoId);

      return { error };
    } catch (error) {
      console.error('Erro ao agendar manutenção:', error);
      return { error };
    }
  },

  // Concluir manutenção
  async concluirManutencao(equipamentoId: string, proximaManutencao?: string): Promise<{ error: any }> {
    try {
      const updateData: any = {
        status: 'disponivel',
        updated_at: new Date().toISOString()
      };

      if (proximaManutencao) {
        updateData.proxima_manutencao = proximaManutencao;
      }

      const { error } = await supabase
        .from('equipamentos')
        .update(updateData)
        .eq('id', equipamentoId);

      return { error };
    } catch (error) {
      console.error('Erro ao concluir manutenção:', error);
      return { error };
    }
  }
}; 