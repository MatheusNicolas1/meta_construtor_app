import { supabase, supabaseUtils } from '@/lib/supabase';
import type { 
  Database, 
  Obra, 
  NovaObra, 
  AtualizarObra,
  OrcamentoAnalitico,
  NovoOrcamentoAnalitico,
  ObraEquipe,
  NovaObraEquipe,
  ObraEquipamento,
  NovoObraEquipamento,
  Documento,
  NovoDocumento,
  ObraResumo,
  STORAGE_BUCKETS
} from '@/lib/supabase';

// Interface para criação completa de obra
export interface CriarObraCompleta {
  obra: NovaObra;
  orcamentoAnalitico?: NovoOrcamentoAnalitico[];
  equipes?: string[]; // IDs das equipes
  equipamentos?: { equipamento_id: string; quantidade: number; observacoes?: string }[];
  documentos?: File[];
}

// Interface para dados completos da obra
export interface ObraCompleta extends Obra {
  orcamento_analitico?: OrcamentoAnalitico[];
  equipes?: any[];
  equipamentos?: any[];
  documentos?: Documento[];
  resumo?: ObraResumo;
}

export const obraService = {
  // ========== OPERAÇÕES BÁSICAS DE OBRA ==========
  
  // Listar todas as obras com resumo
  async listarObras(filtros?: {
    status?: string;
    responsavel?: string;
    empresa_id?: string;
  }): Promise<{ data: ObraResumo[] | null; error: any }> {
    try {
      let query = supabase.from('obra_resumo').select('*');
      
      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros?.responsavel) {
        query = query.eq('responsavel', filtros.responsavel);
      }
      if (filtros?.empresa_id) {
        query = query.eq('empresa_id', filtros.empresa_id);
      }
      
      const { data, error } = await query.order('data_inicio', { ascending: false });
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao listar obras:', error);
      return { data: null, error };
    }
  },

  // Buscar obra completa por ID
  async buscarObraCompleta(id: string): Promise<{ data: ObraCompleta | null; error: any }> {
    try {
      // Buscar dados básicos da obra
      const { data: obra, error: obraError } = await supabase
        .from('obras')
        .select('*')
        .eq('id', id)
        .single();

      if (obraError || !obra) {
        return { data: null, error: obraError };
      }

      // Buscar orçamento analítico
      const { data: orcamento } = await supabase
        .from('orcamento_analitico')
        .select('*')
        .eq('obra_id', id)
        .order('created_at', { ascending: true });

      // Buscar equipes vinculadas
      const { data: equipes } = await supabase
        .from('obras_equipes')
        .select(`
          *,
          equipe:equipes(*)
        `)
        .eq('obra_id', id)
        .eq('status', 'ativa');

      // Buscar equipamentos vinculados
      const { data: equipamentos } = await supabase
        .from('obras_equipamentos')
        .select(`
          *,
          equipamento:equipamentos(*)
        `)
        .eq('obra_id', id)
        .in('status', ['alocado', 'em-uso']);

      // Buscar documentos
      const { data: documentos } = await supabase
        .from('documentos')
        .select('*')
        .eq('obra_id', id)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      // Buscar resumo
      const { data: resumo } = await supabase
        .from('obra_resumo')
        .select('*')
        .eq('id', id)
        .single();

      const obraCompleta: ObraCompleta = {
        ...obra,
        orcamento_analitico: orcamento || [],
        equipes: equipes || [],
        equipamentos: equipamentos || [],
        documentos: documentos || [],
        resumo: resumo || undefined
      };

      return { data: obraCompleta, error: null };
    } catch (error) {
      console.error('Erro ao buscar obra completa:', error);
      return { data: null, error };
    }
  },

  // Criar obra completa com todas as vinculações
  async criarObraCompleta(dadosObra: CriarObraCompleta): Promise<{ data: Obra | null; error: any }> {
    try {
      // Verificar se usuário pode criar obras
      const user = await supabaseUtils.getCurrentUser();
      if (!user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Iniciar transação criando a obra principal
      const { data: obra, error: obraError } = await supabase
        .from('obras')
        .insert([{
          ...dadosObra.obra,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (obraError || !obra) {
        return { data: null, error: obraError };
      }

      const obraId = obra.id;

      // Criar orçamento analítico se fornecido
      if (dadosObra.orcamentoAnalitico && dadosObra.orcamentoAnalitico.length > 0) {
        const orcamentoData = dadosObra.orcamentoAnalitico.map(item => ({
          ...item,
          obra_id: obraId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: orcamentoError } = await supabase
          .from('orcamento_analitico')
          .insert(orcamentoData);

        if (orcamentoError) {
          console.error('Erro ao criar orçamento analítico:', orcamentoError);
        }
      }

      // Vincular equipes se fornecido
      if (dadosObra.equipes && dadosObra.equipes.length > 0) {
        const equipesData = dadosObra.equipes.map(equipeId => ({
          obra_id: obraId,
          equipe_id: equipeId,
          data_alocacao: new Date().toISOString().split('T')[0],
          status: 'ativa' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: equipesError } = await supabase
          .from('obras_equipes')
          .insert(equipesData);

        if (equipesError) {
          console.error('Erro ao vincular equipes:', equipesError);
        }
      }

      // Vincular equipamentos se fornecido
      if (dadosObra.equipamentos && dadosObra.equipamentos.length > 0) {
        const equipamentosData = dadosObra.equipamentos.map(eq => ({
          obra_id: obraId,
          equipamento_id: eq.equipamento_id,
          quantidade: eq.quantidade,
          data_alocacao: new Date().toISOString().split('T')[0],
          status: 'alocado' as const,
          observacoes: eq.observacoes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: equipamentosError } = await supabase
          .from('obras_equipamentos')
          .insert(equipamentosData);

        if (equipamentosError) {
          console.error('Erro ao vincular equipamentos:', equipamentosError);
        }

        // Atualizar status dos equipamentos para 'em-uso'
        for (const eq of dadosObra.equipamentos) {
          await supabase
            .from('equipamentos')
            .update({ 
              status: 'em-uso',
              obra_atual: obraId,
              updated_at: new Date().toISOString()
            })
            .eq('id', eq.equipamento_id);
        }
      }

      // Upload de documentos se fornecido
      if (dadosObra.documentos && dadosObra.documentos.length > 0) {
        for (const arquivo of dadosObra.documentos) {
          try {
            const { data: uploadData, error: uploadError } = await supabaseUtils.uploadObraFile(
              obraId,
              'documentos',
              arquivo
            );

            if (!uploadError && uploadData) {
              // Criar registro do documento
              const documentoData: NovoDocumento = {
                obra_id: obraId,
                nome: arquivo.name,
                categoria: 'outros',
                arquivo_url: uploadData.path,
                tamanho_bytes: arquivo.size,
                tipo_mime: arquivo.type,
                usuario_upload: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              await supabase
                .from('documentos')
                .insert([documentoData]);
            }
          } catch (uploadError) {
            console.error('Erro ao fazer upload do documento:', uploadError);
          }
        }
      }

      return { data: obra, error: null };
    } catch (error) {
      console.error('Erro ao criar obra completa:', error);
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
      // Liberar equipamentos vinculados
      const { data: equipamentosVinculados } = await supabase
        .from('obras_equipamentos')
        .select('equipamento_id')
        .eq('obra_id', id)
        .in('status', ['alocado', 'em-uso']);

      if (equipamentosVinculados) {
        for (const eq of equipamentosVinculados) {
          await supabase
            .from('equipamentos')
            .update({ 
              status: 'disponivel',
              obra_atual: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', eq.equipamento_id);
        }
      }

      // Deletar obra (cascade vai remover registros relacionados)
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

  // ========== ORÇAMENTO ANALÍTICO ==========

  // Adicionar atividade ao orçamento analítico
  async adicionarAtividadeOrcamento(atividade: NovoOrcamentoAnalitico): Promise<{ data: OrcamentoAnalitico | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orcamento_analitico')
        .insert([{
          ...atividade,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao adicionar atividade ao orçamento:', error);
      return { data: null, error };
    }
  },

  // Atualizar atividade do orçamento
  async atualizarAtividadeOrcamento(id: string, updates: Partial<OrcamentoAnalitico>): Promise<{ data: OrcamentoAnalitico | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orcamento_analitico')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar atividade do orçamento:', error);
      return { data: null, error };
    }
  },

  // Deletar atividade do orçamento
  async deletarAtividadeOrcamento(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('orcamento_analitico')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar atividade do orçamento:', error);
      return { error };
    }
  },

  // Obter orçamento analítico com controle de permissão financeira
  async obterOrcamentoAnalitico(obraId: string, incluirValores: boolean = true): Promise<{ data: OrcamentoAnalitico[] | null; error: any }> {
    try {
      let selectFields = '*';
      
      // Se incluirValores for false, não buscar campos financeiros
      if (!incluirValores) {
        selectFields = 'id, obra_id, nome_atividade, categoria, unidade, quantitativo, status, data_inicio, data_conclusao, responsavel, observacoes, created_at, updated_at';
      }

      // Verificar permissões do usuário
      const podeVerFinanceiro = await supabaseUtils.canViewFinancialData();
      if (!podeVerFinanceiro && incluirValores) {
        selectFields = 'id, obra_id, nome_atividade, categoria, unidade, quantitativo, status, data_inicio, data_conclusao, responsavel, observacoes, created_at, updated_at';
      }

      const { data, error } = await supabase
        .from('orcamento_analitico')
        .select(selectFields)
        .eq('obra_id', obraId)
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Erro ao obter orçamento analítico:', error);
      return { data: null, error };
    }
  },

  // ========== GESTÃO DE EQUIPES ==========

  // Vincular equipe à obra
  async vincularEquipe(dados: NovaObraEquipe): Promise<{ data: ObraEquipe | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('obras_equipes')
        .insert([{
          ...dados,
          data_alocacao: dados.data_alocacao || new Date().toISOString().split('T')[0],
          status: dados.status || 'ativa',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao vincular equipe:', error);
      return { data: null, error };
    }
  },

  // Liberar equipe da obra
  async liberarEquipe(obraId: string, equipeId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('obras_equipes')
        .update({
          status: 'liberada',
          data_liberacao: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('obra_id', obraId)
        .eq('equipe_id', equipeId);

      return { error };
    } catch (error) {
      console.error('Erro ao liberar equipe:', error);
      return { error };
    }
  },

  // ========== GESTÃO DE EQUIPAMENTOS ==========

  // Vincular equipamento à obra
  async vincularEquipamento(dados: NovoObraEquipamento): Promise<{ data: ObraEquipamento | null; error: any }> {
    try {
      // Verificar se equipamento está disponível
      const { data: equipamento } = await supabase
        .from('equipamentos')
        .select('status')
        .eq('id', dados.equipamento_id)
        .single();

      if (equipamento?.status !== 'disponivel') {
        return { data: null, error: 'Equipamento não está disponível' };
      }

      // Vincular equipamento
      const { data, error } = await supabase
        .from('obras_equipamentos')
        .insert([{
          ...dados,
          data_alocacao: dados.data_alocacao || new Date().toISOString().split('T')[0],
          status: dados.status || 'alocado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (!error && data) {
        // Atualizar status do equipamento
        await supabase
          .from('equipamentos')
          .update({ 
            status: 'em-uso',
            obra_atual: dados.obra_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', dados.equipamento_id);
      }

      return { data, error };
    } catch (error) {
      console.error('Erro ao vincular equipamento:', error);
      return { data: null, error };
    }
  },

  // Liberar equipamento da obra
  async liberarEquipamento(obraId: string, equipamentoId: string): Promise<{ error: any }> {
    try {
      // Atualizar vínculo
      const { error: vinculoError } = await supabase
        .from('obras_equipamentos')
        .update({
          status: 'liberado',
          data_liberacao: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('obra_id', obraId)
        .eq('equipamento_id', equipamentoId);

      if (!vinculoError) {
        // Liberar equipamento
        await supabase
          .from('equipamentos')
          .update({ 
            status: 'disponivel',
            obra_atual: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', equipamentoId);
      }

      return { error: vinculoError };
    } catch (error) {
      console.error('Erro ao liberar equipamento:', error);
      return { error };
    }
  },

  // ========== GESTÃO DE DOCUMENTOS ==========

  // Upload de documento
  async uploadDocumento(obraId: string, arquivo: File, categoria: string, descricao?: string): Promise<{ data: Documento | null; error: any }> {
    try {
      const user = await supabaseUtils.getCurrentUser();
      if (!user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Upload do arquivo
      const { data: uploadData, error: uploadError } = await supabaseUtils.uploadObraFile(
        obraId,
        categoria,
        arquivo
      );

      if (uploadError || !uploadData) {
        return { data: null, error: uploadError };
      }

      // Criar registro do documento
      const documentoData: NovoDocumento = {
        obra_id: obraId,
        nome: arquivo.name,
        categoria: categoria as any,
        descricao,
        arquivo_url: uploadData.path,
        tamanho_bytes: arquivo.size,
        tipo_mime: arquivo.type,
        usuario_upload: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('documentos')
        .insert([documentoData])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      return { data: null, error };
    }
  },

  // Listar documentos da obra
  async listarDocumentos(obraId: string, categoria?: string): Promise<{ data: Documento[] | null; error: any }> {
    try {
      let query = supabase
        .from('documentos')
        .select('*')
        .eq('obra_id', obraId)
        .eq('status', 'ativo');

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      return { data: null, error };
    }
  },

  // Deletar documento
  async deletarDocumento(id: string): Promise<{ error: any }> {
    try {
      // Buscar o documento para obter a URL do arquivo
      const { data: documento } = await supabase
        .from('documentos')
        .select('arquivo_url')
        .eq('id', id)
        .single();

      if (documento) {
        // Deletar arquivo do storage
        await supabaseUtils.deleteFile('obras-anexos', documento.arquivo_url);
      }

      // Marcar documento como deletado (soft delete)
      const { error } = await supabase
        .from('documentos')
        .update({
          status: 'arquivado',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      return { error };
    }
  },

  // ========== ESTATÍSTICAS E RELATÓRIOS ==========

  // Estatísticas das obras
  async obterEstatisticasObras(empresaId?: string): Promise<{ data: any; error: any }> {
    try {
      let query = supabase.from('obras').select('status, orcamento');
      
      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;
      
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
  },

  // Relatório financeiro da obra (apenas para usuários autorizados)
  async relatorioFinanceiroObra(obraId: string): Promise<{ data: any; error: any }> {
    try {
      const podeVerFinanceiro = await supabaseUtils.canViewFinancialData();
      if (!podeVerFinanceiro) {
        return { data: null, error: 'Sem permissão para visualizar dados financeiros' };
      }

      // Buscar dados financeiros da obra
      const { data: obra } = await supabase
        .from('obras')
        .select('orcamento')
        .eq('id', obraId)
        .single();

      const { data: orcamento } = await supabase
        .from('orcamento_analitico')
        .select('valor_total, status')
        .eq('obra_id', obraId);

      const { data: equipamentos } = await supabase
        .from('obras_equipamentos')
        .select('custo_total')
        .eq('obra_id', obraId);

      const orcamentoPlanejado = obra?.orcamento || 0;
      const custoAtividades = orcamento?.reduce((acc, a) => acc + (a.valor_total || 0), 0) || 0;
      const custoEquipamentos = equipamentos?.reduce((acc, e) => acc + (e.custo_total || 0), 0) || 0;
      const custoTotal = custoAtividades + custoEquipamentos;
      const saldo = orcamentoPlanejado - custoTotal;
      const percentualExecutado = orcamentoPlanejado > 0 ? (custoTotal / orcamentoPlanejado) * 100 : 0;

      const relatorio = {
        orcamento_planejado: orcamentoPlanejado,
        custo_atividades: custoAtividades,
        custo_equipamentos: custoEquipamentos,
        custo_total: custoTotal,
        saldo: saldo,
        percentual_executado: percentualExecutado,
        status_orcamento: saldo >= 0 ? 'dentro_do_orcamento' : 'acima_do_orcamento'
      };

      return { data: relatorio, error: null };
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      return { data: null, error };
    }
  }
}; 