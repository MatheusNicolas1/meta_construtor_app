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
  }): Promise<{ data: any[] | null; error: any }> {
    try {
      // Verificar se está em modo demo
      const demoMode = localStorage.getItem('demo-mode');
      if (demoMode === 'true') {
        // Obras padrão do demo
        const obrasPadrao = [
          {
            id: '1',
            nome: 'Torre Empresarial Centro',
            endereco: 'Av. Paulista, 1000 - São Paulo/SP',
            orcamento: 2500000,
            data_inicio: '2024-01-15',
            data_previsao: '2024-12-15',
            status: 'ativa',
            responsavel: 'João Silva',
            empresa_id: 'demo-empresa',
            total_equipes: 3,
            total_equipamentos: 8,
            total_rdos: 25,
            orcamento_analitico_total: 2500000,
            valor_medio_atividade: 125000,
            created_at: '2024-01-15T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
          },
          {
            id: '2',
            nome: 'Residencial Vila Verde',
            endereco: 'Rua das Flores, 500 - Santos/SP',
            orcamento: 1200000,
            data_inicio: '2024-02-01',
            data_previsao: '2024-08-30',
            status: 'ativa',
            responsavel: 'Maria Santos',
            empresa_id: 'demo-empresa',
            total_equipes: 2,
            total_equipamentos: 5,
            total_rdos: 18,
            orcamento_analitico_total: 1200000,
            valor_medio_atividade: 85000,
            created_at: '2024-02-01T00:00:00Z',
            updated_at: '2024-02-01T00:00:00Z'
          },
          {
            id: '3',
            nome: 'Shopping Mall Plaza',
            endereco: 'Rod. Anhanguera, Km 25 - Campinas/SP',
            orcamento: 5000000,
            data_inicio: '2024-03-01',
            data_previsao: '2025-02-28',
            status: 'pausada',
            responsavel: 'Pedro Costa',
            empresa_id: 'demo-empresa',
            total_equipes: 5,
            total_equipamentos: 12,
            total_rdos: 8,
            orcamento_analitico_total: 5000000,
            valor_medio_atividade: 250000,
            created_at: '2024-03-01T00:00:00Z',
            updated_at: '2024-03-01T00:00:00Z'
          }
        ];

        // Recuperar obras criadas pelo usuário no modo demo
        const obrasCriadas = JSON.parse(localStorage.getItem('demo-obras-criadas') || '[]');
        
        // Combinar obras padrão com obras criadas pelo usuário
        const todasObras = [...obrasPadrao, ...obrasCriadas];
        
        // Aplicar filtros se necessário
        let obrasFiltradas = todasObras;
        
        if (filtros?.status) {
          obrasFiltradas = obrasFiltradas.filter(obra => obra.status === filtros.status);
        }
        if (filtros?.responsavel) {
          obrasFiltradas = obrasFiltradas.filter(obra => obra.responsavel === filtros.responsavel);
        }
        if (filtros?.empresa_id) {
          obrasFiltradas = obrasFiltradas.filter(obra => obra.empresa_id === filtros.empresa_id);
        }
        
        // Ordenar por data de criação (mais recente primeiro)
        obrasFiltradas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        return { data: obrasFiltradas, error: null };
      }

      // Verificar se usuário está autenticado
      const user = await supabaseUtils.getCurrentUser();
      if (!user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Tentar usar a view obra_resumo primeiro
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
      
      let { data, error } = await query.order('data_inicio', { ascending: false });
      
      // Se a view não existir, usar tabela obras básica
      if (error && error.message?.includes('does not exist')) {
        console.log('View obra_resumo não existe, usando tabela obras');
        
        let basicQuery = supabase.from('obras').select('*');
        
        if (filtros?.status) {
          basicQuery = basicQuery.eq('status', filtros.status);
        }
        if (filtros?.responsavel) {
          basicQuery = basicQuery.eq('responsavel', filtros.responsavel);
        }
        if (filtros?.empresa_id) {
          basicQuery = basicQuery.eq('empresa_id', filtros.empresa_id);
        }
        
        const basicResult = await basicQuery.order('data_inicio', { ascending: false });
        data = basicResult.data;
        error = basicResult.error;
        
        // Converter para formato de resumo adicionando campos faltantes
        if (data) {
          data = data.map(obra => ({
            ...obra,
            total_equipes: 0,
            total_equipamentos: 0,
            total_rdos: 0,
            orcamento_analitico_total: obra.orcamento || 0,
            valor_medio_atividade: 0
          }));
        }
      }
      
      return { data, error };
    } catch (error) {
      console.error('Erro ao listar obras:', error);
      return { data: null, error };
    }
  },

  // Criar obra simples (somente dados básicos)
  async criarObra(dadosObra: any): Promise<{ data: Obra | null; error: any }> {
    try {
      // Verificar se está em modo demo
      const demoMode = localStorage.getItem('demo-mode');
      
      if (demoMode === 'true') {
        // Em modo demo, simular criação de obra
        const obraDemo = {
          id: `demo-${Date.now()}`,
          nome: dadosObra.nome,
          endereco: dadosObra.endereco,
          orcamento: dadosObra.orcamento,
          data_inicio: dadosObra.data_inicio,
          data_previsao: dadosObra.data_previsao,
          status: dadosObra.status,
          responsavel: dadosObra.responsavel,
          tipo: dadosObra.tipo,
          cliente: dadosObra.cliente,
          observacoes: dadosObra.observacoes,
          empresa_id: 'demo-empresa',
          // Adicionar campos necessários para listagem
          total_equipes: dadosObra.equipamentos_selecionados?.length || 0,
          total_equipamentos: dadosObra.equipamentos_selecionados?.length || 0,
          total_rdos: 0,
          orcamento_analitico_total: dadosObra.orcamento || 0,
          valor_medio_atividade: dadosObra.tipo_orcamento === 'analitico' && dadosObra.atividades_orcamento?.length 
            ? dadosObra.orcamento / dadosObra.atividades_orcamento.length 
            : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Salvar no localStorage
        const obrasCriadas = JSON.parse(localStorage.getItem('demo-obras-criadas') || '[]');
        obrasCriadas.push(obraDemo);
        localStorage.setItem('demo-obras-criadas', JSON.stringify(obrasCriadas));

        // Simular delay de criação
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { data: obraDemo, error: null };
      }

      // Verificar se usuário pode criar obras
      const user = await supabaseUtils.getCurrentUser();
      if (!user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Se for uma obra simples (dados básicos), usar método original
      if (!dadosObra.atividades_orcamento && !dadosObra.equipamentos_selecionados && !dadosObra.arquivos) {
        const { data, error } = await supabase
          .from('obras')
          .insert([{
            nome: dadosObra.nome,
            endereco: dadosObra.endereco,
            orcamento: dadosObra.orcamento,
            data_inicio: dadosObra.data_inicio,
            data_previsao: dadosObra.data_previsao,
            status: dadosObra.status,
            responsavel: dadosObra.responsavel,
            tipo: dadosObra.tipo,
            cliente: dadosObra.cliente,
            observacoes: dadosObra.observacoes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        return { data, error };
      }

      // Se for uma obra completa, usar método avançado
      const obraCompleta: CriarObraCompleta = {
        obra: {
          nome: dadosObra.nome,
          endereco: dadosObra.endereco,
          orcamento: dadosObra.orcamento,
          data_inicio: dadosObra.data_inicio,
          data_previsao: dadosObra.data_previsao,
          status: dadosObra.status,
          responsavel: dadosObra.responsavel,
          tipo: dadosObra.tipo,
          cliente: dadosObra.cliente,
          observacoes: dadosObra.observacoes,
        },
        orcamentoAnalitico: dadosObra.tipo_orcamento === 'analitico' && dadosObra.atividades_orcamento 
          ? dadosObra.atividades_orcamento.map((ativ: any) => ({
              nome_atividade: ativ.atividade,
              categoria: 'construcao',
              unidade: ativ.unidade,
              quantitativo: Number(ativ.quantidade),
              valor_unitario: Number(ativ.valorUnitario),
              valor_total: ativ.valorTotal,
              status: 'planejada',
              responsavel: dadosObra.responsavel
            }))
          : undefined,
        equipamentos: dadosObra.equipamentos_selecionados?.length > 0 
          ? dadosObra.equipamentos_selecionados.map((eqId: string) => ({
              equipamento_id: eqId,
              quantidade: 1,
              observacoes: 'Equipamento alocado durante criação da obra'
            }))
          : undefined,
        documentos: dadosObra.arquivos?.length > 0 
          ? dadosObra.arquivos.map((arquivo: any) => arquivo.arquivo)
          : undefined
      };

      return await this.criarObraCompleta(obraCompleta);
    } catch (error) {
      console.error('Erro ao criar obra:', error);
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
      // Verificar se está em modo demo
      const demoMode = localStorage.getItem('demo-mode');
      
      if (demoMode === 'true') {
        // Em modo demo, simular criação de obra completa
        const obraDemo = {
          id: `demo-${Date.now()}`,
          ...dadosObra.obra,
          empresa_id: 'demo-empresa',
          // Adicionar campos necessários para listagem
          total_equipes: dadosObra.equipes?.length || 0,
          total_equipamentos: dadosObra.equipamentos?.length || 0,
          total_rdos: 0,
          orcamento_analitico_total: dadosObra.obra.orcamento || 0,
          valor_medio_atividade: dadosObra.orcamentoAnalitico?.length 
            ? dadosObra.obra.orcamento / dadosObra.orcamentoAnalitico.length 
            : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Salvar no localStorage
        const obrasCriadas = JSON.parse(localStorage.getItem('demo-obras-criadas') || '[]');
        obrasCriadas.push(obraDemo);
        localStorage.setItem('demo-obras-criadas', JSON.stringify(obrasCriadas));

        // Simular delay de criação
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return { data: obraDemo, error: null };
      }

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

  // Duplicar obra existente (sem RDOs nem arquivos)
  async duplicarObra(obraId: string, novoNome: string): Promise<{ data: Obra | null; error: any }> {
    try {
      // Verificar se usuário pode criar obras
      const user = await supabaseUtils.getCurrentUser();
      if (!user) {
        return { data: null, error: 'Usuário não autenticado' };
      }

      // Buscar obra original
      const { data: obraOriginal, error: obraError } = await supabase
        .from('obras')
        .select('*')
        .eq('id', obraId)
        .single();

      if (obraError || !obraOriginal) {
        return { data: null, error: 'Obra não encontrada' };
      }

      // Criar nova obra baseada na original
      const novaObra = {
        nome: novoNome,
        endereco: obraOriginal.endereco,
        orcamento: obraOriginal.orcamento,
        data_inicio: new Date().toISOString().split('T')[0], // Data atual
        data_previsao: obraOriginal.data_previsao,
        status: 'ativa' as const,
        responsavel: obraOriginal.responsavel,
        empresa_id: obraOriginal.empresa_id,
      };

      const { data: obraDuplicada, error: duplicarError } = await supabase
        .from('obras')
        .insert([novaObra])
        .select()
        .single();

      if (duplicarError || !obraDuplicada) {
        return { data: null, error: duplicarError };
      }

      const novaObraId = obraDuplicada.id;

      // Duplicar orçamento analítico
      const { data: orcamentoOriginal } = await supabase
        .from('orcamento_analitico')
        .select('*')
        .eq('obra_id', obraId);

      if (orcamentoOriginal && orcamentoOriginal.length > 0) {
        const novoOrcamento = orcamentoOriginal.map(item => ({
          obra_id: novaObraId,
          nome_atividade: item.nome_atividade,
          categoria: item.categoria,
          unidade: item.unidade,
          quantitativo: item.quantitativo,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
          status: 'planejada' as const,
          data_inicio: null,
          data_conclusao: null,
          responsavel: item.responsavel,
          observacoes: item.observacoes,
        }));

        const { error: orcamentoError } = await supabase
          .from('orcamento_analitico')
          .insert(novoOrcamento);

        if (orcamentoError) {
          console.error('Erro ao duplicar orçamento analítico:', orcamentoError);
        }
      }

      // Duplicar equipes alocadas (como disponíveis)
      const { data: equipesOriginais } = await supabase
        .from('obras_equipes')
        .select('*')
        .eq('obra_id', obraId)
        .eq('status', 'ativa');

      if (equipesOriginais && equipesOriginais.length > 0) {
        const novasEquipes = equipesOriginais.map(equipe => ({
          obra_id: novaObraId,
          equipe_id: equipe.equipe_id,
          data_alocacao: new Date().toISOString().split('T')[0],
          data_liberacao: null,
          status: 'ativa' as const,
          funcao_na_obra: equipe.funcao_na_obra,
          observacoes: `Equipe duplicada da obra: ${obraOriginal.nome}`,
        }));

        const { error: equipesError } = await supabase
          .from('obras_equipes')
          .insert(novasEquipes);

        if (equipesError) {
          console.error('Erro ao duplicar equipes:', equipesError);
        }
      }

      return { data: obraDuplicada, error: null };
    } catch (error) {
      console.error('Erro ao duplicar obra:', error);
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
      // Verificar se está em modo demo
      const demoMode = localStorage.getItem('demo-mode');
      
      if (demoMode === 'true') {
        // Em modo demo, remover da lista persistida
        const obrasCriadas = JSON.parse(localStorage.getItem('demo-obras-criadas') || '[]');
        const obrasAtualizadas = obrasCriadas.filter((obra: any) => obra.id !== id);
        localStorage.setItem('demo-obras-criadas', JSON.stringify(obrasAtualizadas));
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { error: null };
      }

      // Verificar se usuário está autenticado
      const user = await supabaseUtils.getCurrentUser();
      if (!user) {
        return { error: 'Usuário não autenticado' };
      }

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
  },

  // ========== UTILITÁRIOS PARA MODO DEMO ==========

  // Limpar dados do modo demo
  async limparDadosDemo(): Promise<{ error: any }> {
    try {
      localStorage.removeItem('demo-obras-criadas');
      return { error: null };
    } catch (error) {
      console.error('Erro ao limpar dados demo:', error);
      return { error };
    }
  }
}; 