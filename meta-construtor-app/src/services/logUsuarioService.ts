import { supabase } from '@/lib/supabase';

export interface LogUsuario {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  acao: string;
  categoria: 'login' | 'obra' | 'rdo' | 'equipe' | 'equipamento' | 'usuario' | 'configuracao' | 'geral';
  descricao: string;
  recurso_id?: string;
  recurso_tipo?: string;
  nivel_sensibilidade: 'baixo' | 'medio' | 'alto' | 'critico';
  created_at: string;
}

export interface FiltrosLog {
  usuario_id?: string;
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
  limite?: number;
  offset?: number;
}

export interface StatsLog {
  total_logs: number;
  total_usuarios_ativos: number;
  logs_por_categoria: Record<string, number>;
  logs_por_sensibilidade: Record<string, number>;
  top_acoes: Array<{ acao: string; total: number }>;
}

class LogUsuarioService {
  // ===== CONSULTAR LOGS =====
  
  async listarLogs(filtros: FiltrosLog = {}): Promise<LogUsuario[]> {
    try {
      // Verificar se usuário tem permissão (gerente ou diretor)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id, nivel_acesso')
        .eq('id', user.id)
        .single();

      if (!profile || !['gerente', 'diretor'].includes(profile.nivel_acesso)) {
        throw new Error('Acesso negado: apenas gerentes e diretores podem visualizar logs');
      }

      // Usar função SQL para obter logs
      const { data, error } = await supabase.rpc('obter_logs_usuario', {
        p_empresa_id: profile.empresa_id,
        p_usuario_id: filtros.usuario_id || null,
        p_categoria: filtros.categoria || null,
        p_data_inicio: filtros.data_inicio || null,
        p_data_fim: filtros.data_fim || null,
        p_limite: filtros.limite || 100,
        p_offset: filtros.offset || 0,
      });

      if (error) {
        console.error('Erro ao listar logs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao listar logs de usuário:', error);
      throw error;
    }
  }

  async obterEstatisticas(periodoDias: number = 30): Promise<StatsLog | null> {
    try {
      // Verificar permissão
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id, nivel_acesso')
        .eq('id', user.id)
        .single();

      if (!profile || !['gerente', 'diretor'].includes(profile.nivel_acesso)) {
        throw new Error('Acesso negado');
      }

      // Usar função SQL para obter estatísticas
      const { data, error } = await supabase.rpc('stats_logs_usuario', {
        p_empresa_id: profile.empresa_id,
        p_periodo_dias: periodoDias,
      });

      if (error) {
        console.error('Erro ao obter estatísticas:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Erro ao obter estatísticas de logs:', error);
      throw error;
    }
  }

  // ===== REGISTRAR LOGS =====
  
  async registrarLog(
    acao: string,
    descricao: string,
    categoria: string = 'geral',
    opcoes: {
      recurso_id?: string;
      recurso_tipo?: string;
      dados_anteriores?: any;
      dados_novos?: any;
      nivel_sensibilidade?: 'baixo' | 'medio' | 'alto' | 'critico';
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('registrar_log_usuario', {
        p_usuario_id: user.id,
        p_acao: acao,
        p_descricao: descricao,
        p_categoria: categoria,
        p_recurso_id: opcoes.recurso_id || null,
        p_recurso_tipo: opcoes.recurso_tipo || null,
        p_dados_anteriores: opcoes.dados_anteriores ? JSON.stringify(opcoes.dados_anteriores) : null,
        p_dados_novos: opcoes.dados_novos ? JSON.stringify(opcoes.dados_novos) : null,
        p_nivel_sensibilidade: opcoes.nivel_sensibilidade || 'baixo',
        p_metadata: opcoes.metadata ? JSON.stringify(opcoes.metadata) : '{}',
      });

      if (error) {
        console.error('Erro ao registrar log:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao registrar log de usuário:', error);
      return null;
    }
  }

  // ===== LOGS ESPECÍFICOS =====
  
  async logLogin(ip?: string, userAgent?: string): Promise<void> {
    try {
      await this.registrarLog(
        'login',
        'Usuário fez login no sistema',
        'login',
        {
          nivel_sensibilidade: 'medio',
          metadata: {
            ip_address: ip,
            user_agent: userAgent,
            timestamp: new Date().toISOString(),
          }
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de login:', error);
    }
  }

  async logLogout(): Promise<void> {
    try {
      await this.registrarLog(
        'logout',
        'Usuário fez logout do sistema',
        'login',
        {
          nivel_sensibilidade: 'baixo',
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de logout:', error);
    }
  }

  async logCriarEquipe(equipeId: string, nomeEquipe: string): Promise<void> {
    try {
      await this.registrarLog(
        'criar_equipe',
        `Equipe criada: ${nomeEquipe}`,
        'equipe',
        {
          recurso_id: equipeId,
          recurso_tipo: 'equipe',
          nivel_sensibilidade: 'medio',
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de criação de equipe:', error);
    }
  }

  async logEditarEquipe(equipeId: string, nomeEquipe: string, dadosAnteriores?: any, dadosNovos?: any): Promise<void> {
    try {
      await this.registrarLog(
        'editar_equipe',
        `Equipe editada: ${nomeEquipe}`,
        'equipe',
        {
          recurso_id: equipeId,
          recurso_tipo: 'equipe',
          dados_anteriores: dadosAnteriores,
          dados_novos: dadosNovos,
          nivel_sensibilidade: 'medio',
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de edição de equipe:', error);
    }
  }

  async logRemoverEquipe(equipeId: string, nomeEquipe: string): Promise<void> {
    try {
      await this.registrarLog(
        'remover_equipe',
        `Equipe removida: ${nomeEquipe}`,
        'equipe',
        {
          recurso_id: equipeId,
          recurso_tipo: 'equipe',
          nivel_sensibilidade: 'alto',
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de remoção de equipe:', error);
    }
  }

  async logCriarEquipamento(equipamentoId: string, nomeEquipamento: string): Promise<void> {
    try {
      await this.registrarLog(
        'criar_equipamento',
        `Equipamento criado: ${nomeEquipamento}`,
        'equipamento',
        {
          recurso_id: equipamentoId,
          recurso_tipo: 'equipamento',
          nivel_sensibilidade: 'medio',
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de criação de equipamento:', error);
    }
  }

  async logEditarEquipamento(equipamentoId: string, nomeEquipamento: string): Promise<void> {
    try {
      await this.registrarLog(
        'editar_equipamento',
        `Equipamento editado: ${nomeEquipamento}`,
        'equipamento',
        {
          recurso_id: equipamentoId,
          recurso_tipo: 'equipamento',
          nivel_sensibilidade: 'medio',
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de edição de equipamento:', error);
    }
  }

  async logAlterarStatusEquipamento(equipamentoId: string, nomeEquipamento: string, statusAnterior: string, novoStatus: string): Promise<void> {
    try {
      await this.registrarLog(
        'alterar_status_equipamento',
        `Status do equipamento "${nomeEquipamento}" alterado de "${statusAnterior}" para "${novoStatus}"`,
        'equipamento',
        {
          recurso_id: equipamentoId,
          recurso_tipo: 'equipamento',
          dados_anteriores: { status: statusAnterior },
          dados_novos: { status: novoStatus },
          nivel_sensibilidade: 'medio',
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de alteração de status de equipamento:', error);
    }
  }

  async logAlterarConfiguracoes(secao: string, configuracoes: any): Promise<void> {
    try {
      await this.registrarLog(
        'alterar_configuracoes',
        `Configurações alteradas na seção: ${secao}`,
        'configuracao',
        {
          dados_novos: configuracoes,
          nivel_sensibilidade: 'alto',
          metadata: { secao }
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de alteração de configurações:', error);
    }
  }

  async logCriarUsuario(usuarioId: string, nomeUsuario: string, nivelAcesso: string): Promise<void> {
    try {
      await this.registrarLog(
        'criar_usuario',
        `Usuário criado: ${nomeUsuario} (${nivelAcesso})`,
        'usuario',
        {
          recurso_id: usuarioId,
          recurso_tipo: 'usuario',
          nivel_sensibilidade: 'alto',
          metadata: { nivel_acesso: nivelAcesso }
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de criação de usuário:', error);
    }
  }

  async logAlterarStatusUsuario(usuarioId: string, nomeUsuario: string, statusAnterior: string, novoStatus: string): Promise<void> {
    try {
      await this.registrarLog(
        'alterar_status_usuario',
        `Status do usuário "${nomeUsuario}" alterado de "${statusAnterior}" para "${novoStatus}"`,
        'usuario',
        {
          recurso_id: usuarioId,
          recurso_tipo: 'usuario',
          dados_anteriores: { status: statusAnterior },
          dados_novos: { status: novoStatus },
          nivel_sensibilidade: 'alto',
        }
      );
    } catch (error) {
      console.error('Erro ao registrar log de alteração de status de usuário:', error);
    }
  }

  // ===== UTILITÁRIOS =====
  
  getNivelSensibilidadeColor(nivel: string): string {
    switch (nivel) {
      case 'critico':
        return 'bg-red-100 text-red-800';
      case 'alto':
        return 'bg-orange-100 text-orange-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getCategoriaColor(categoria: string): string {
    switch (categoria) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'obra':
        return 'bg-purple-100 text-purple-800';
      case 'rdo':
        return 'bg-green-100 text-green-800';
      case 'equipe':
        return 'bg-indigo-100 text-indigo-800';
      case 'equipamento':
        return 'bg-orange-100 text-orange-800';
      case 'usuario':
        return 'bg-red-100 text-red-800';
      case 'configuracao':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatarAcao(acao: string): string {
    const acoes: Record<string, string> = {
      'login': 'Login',
      'logout': 'Logout',
      'criar_obra': 'Criar Obra',
      'atualizar_obra': 'Atualizar Obra',
      'remover_obra': 'Remover Obra',
      'criar_rdo': 'Criar RDO',
      'atualizar_rdo': 'Atualizar RDO',
      'alterar_status_rdo': 'Alterar Status RDO',
      'remover_rdo': 'Remover RDO',
      'criar_equipe': 'Criar Equipe',
      'editar_equipe': 'Editar Equipe',
      'remover_equipe': 'Remover Equipe',
      'criar_equipamento': 'Criar Equipamento',
      'editar_equipamento': 'Editar Equipamento',
      'alterar_status_equipamento': 'Alterar Status Equipamento',
      'criar_usuario': 'Criar Usuário',
      'alterar_status_usuario': 'Alterar Status Usuário',
      'alterar_configuracoes': 'Alterar Configurações',
    };

    return acoes[acao] || acao;
  }

  // Limpeza de logs antigos (apenas para administradores)
  async limparLogsAntigos(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('nivel_acesso')
        .eq('id', user.id)
        .single();

      if (!profile || profile.nivel_acesso !== 'diretor') {
        throw new Error('Acesso negado: apenas diretores podem limpar logs');
      }

      const { data, error } = await supabase.rpc('limpar_logs_antigos');

      if (error) {
        console.error('Erro ao limpar logs antigos:', error);
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      throw error;
    }
  }
}

export const logUsuarioService = new LogUsuarioService(); 