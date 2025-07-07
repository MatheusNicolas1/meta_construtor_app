import { supabase } from '../lib/supabase';

export interface Notificacao {
  id: string;
  empresa_id: string;
  user_id: string;
  titulo: string;
  descricao: string;
  tipo: 'atraso' | 'pendencia' | 'manutencao' | 'aprovacao' | 'info' | 'criacao' | 'finalizacao';
  categoria: 'rdo' | 'obra' | 'equipe' | 'equipamento' | 'sistema' | 'usuario';
  prioridade: 'alta' | 'media' | 'baixa';
  lida: boolean;
  data_evento: string;
  created_at: string;
  updated_at: string;
  obra_id?: string;
  equipe_id?: string;
  equipamento_id?: string;
  rdo_id?: string;
  metadata?: any;
  // Dados das relações
  obra?: {
    id: string;
    nome: string;
    endereco: string;
  };
  equipe?: {
    id: string;
    nome: string;
  };
  equipamento?: {
    id: string;
    nome: string;
    tipo: string;
  };
  rdo?: {
    id: string;
    data: string;
    responsavel: string;
  };
}

export interface FiltrosNotificacao {
  tipo?: string;
  categoria?: string;
  prioridade?: string;
  lida?: boolean;
  data_inicio?: string;
  data_fim?: string;
}

export interface EstatisticasNotificacao {
  total_notificacoes: number;
  nao_lidas: number;
  lidas: number;
  por_tipo: {
    atraso: number;
    pendencia: number;
    manutencao: number;
    aprovacao: number;
    info: number;
    criacao: number;
    finalizacao: number;
  };
  por_prioridade: {
    alta: number;
    media: number;
    baixa: number;
  };
}

export const notificacaoService = {
  // Listar notificações do usuário
  async listarNotificacoes(filtros: FiltrosNotificacao = {}): Promise<{ data: Notificacao[]; error: any }> {
    try {
      let query = supabase
        .from('notificacoes')
        .select(`
          *,
          obra:obras(id, nome, endereco),
          equipe:equipes(id, nome),
          equipamento:equipamentos(id, nome, tipo),
          rdo:rdos(id, data, responsavel)
        `)
        .order('data_evento', { ascending: false });

      // Aplicar filtros
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }
      if (filtros.prioridade) {
        query = query.eq('prioridade', filtros.prioridade);
      }
      if (filtros.lida !== undefined) {
        query = query.eq('lida', filtros.lida);
      }
      if (filtros.data_inicio) {
        query = query.gte('data_evento', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_evento', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar notificações:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Erro interno ao listar notificações:', error);
      return { data: [], error };
    }
  },

  // Obter notificações não lidas
  async obterNaoLidas(): Promise<{ data: Notificacao[]; error: any }> {
    return this.listarNotificacoes({ lida: false });
  },

  // Contar notificações não lidas
  async contarNaoLidas(): Promise<{ data: number; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('id', { count: 'exact' })
        .eq('lida', false);

      if (error) {
        console.error('Erro ao contar notificações não lidas:', error);
        return { data: 0, error };
      }

      return { data: data?.length || 0, error: null };
    } catch (error) {
      console.error('Erro interno ao contar notificações não lidas:', error);
      return { data: 0, error };
    }
  },

  // Marcar notificação como lida
  async marcarComoLida(id: string): Promise<{ data: boolean; error: any }> {
    try {
      const { data, error } = await supabase.rpc('marcar_notificacao_lida', {
        p_notification_id: id
      });

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        return { data: false, error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro interno ao marcar notificação como lida:', error);
      return { data: false, error };
    }
  },

  // Marcar todas as notificações como lidas
  async marcarTodasComoLidas(): Promise<{ data: boolean; error: any }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: false, error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', currentUser.user.id)
        .eq('lida', false);

      if (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        return { data: false, error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro interno ao marcar todas as notificações como lidas:', error);
      return { data: false, error };
    }
  },

  // Remover notificação
  async removerNotificacao(id: string): Promise<{ data: boolean; error: any }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: false, error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.user.id);

      if (error) {
        console.error('Erro ao remover notificação:', error);
        return { data: false, error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro interno ao remover notificação:', error);
      return { data: false, error };
    }
  },

  // Criar notificação manual
  async criarNotificacao(
    titulo: string,
    descricao: string,
    tipo: Notificacao['tipo'],
    categoria: Notificacao['categoria'],
    prioridade: Notificacao['prioridade'] = 'media',
    obra_id?: string,
    equipe_id?: string,
    equipamento_id?: string,
    rdo_id?: string,
    metadata?: any
  ): Promise<{ data: Notificacao | null; error: any }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: { message: 'Usuário não autenticado' } };
      }

      // Obter empresa do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', currentUser.user.id)
        .single();

      if (profileError || !profile) {
        return { data: null, error: profileError || { message: 'Perfil não encontrado' } };
      }

      const { data, error } = await supabase.rpc('criar_notificacao', {
        p_empresa_id: profile.empresa_id,
        p_user_id: currentUser.user.id,
        p_titulo: titulo,
        p_descricao: descricao,
        p_tipo: tipo,
        p_categoria: categoria,
        p_prioridade: prioridade,
        p_obra_id: obra_id,
        p_equipe_id: equipe_id,
        p_equipamento_id: equipamento_id,
        p_rdo_id: rdo_id,
        p_metadata: metadata || {}
      });

      if (error) {
        console.error('Erro ao criar notificação:', error);
        return { data: null, error };
      }

      // Buscar a notificação criada
      const { data: notificacao, error: fetchError } = await supabase
        .from('notificacoes')
        .select(`
          *,
          obra:obras(id, nome, endereco),
          equipe:equipes(id, nome),
          equipamento:equipamentos(id, nome, tipo),
          rdo:rdos(id, data, responsavel)
        `)
        .eq('id', data)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar notificação criada:', fetchError);
        return { data: null, error: fetchError };
      }

      return { data: notificacao, error: null };
    } catch (error) {
      console.error('Erro interno ao criar notificação:', error);
      return { data: null, error };
    }
  },

  // Obter estatísticas de notificações
  async obterEstatisticas(): Promise<{ data: EstatisticasNotificacao | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('obter_stats_notificacoes');

      if (error) {
        console.error('Erro ao obter estatísticas de notificações:', error);
        return { data: null, error };
      }

      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error('Erro interno ao obter estatísticas de notificações:', error);
      return { data: null, error };
    }
  },

  // Configurar assinatura para notificações em tempo real
  async configurarAssinatura(
    callback: (notificacao: Notificacao) => void
  ): Promise<{ data: any; error: any }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: { message: 'Usuário não autenticado' } };
      }

      const subscription = supabase
        .channel('notificacoes_channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificacoes',
            filter: `user_id=eq.${currentUser.user.id}`,
          },
          (payload) => {
            console.log('Nova notificação recebida:', payload);
            callback(payload.new as Notificacao);
          }
        )
        .subscribe();

      return { data: subscription, error: null };
    } catch (error) {
      console.error('Erro ao configurar assinatura de notificações:', error);
      return { data: null, error };
    }
  },

  // Remover assinatura
  async removerAssinatura(subscription: any): Promise<{ data: boolean; error: any }> {
    try {
      if (subscription) {
        await supabase.removeChannel(subscription);
      }
      return { data: true, error: null };
    } catch (error) {
      console.error('Erro ao remover assinatura:', error);
      return { data: false, error };
    }
  },

  // Limpar notificações antigas (mais de 30 dias)
  async limparNotificacoes(): Promise<{ data: boolean; error: any }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: false, error: { message: 'Usuário não autenticado' } };
      }

      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const { data, error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('user_id', currentUser.user.id)
        .lt('created_at', dataLimite.toISOString());

      if (error) {
        console.error('Erro ao limpar notificações antigas:', error);
        return { data: false, error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Erro interno ao limpar notificações antigas:', error);
      return { data: false, error };
    }
  }
}; 