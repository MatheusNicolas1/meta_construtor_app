import { supabase } from '../lib/supabase';

export interface CriarRDOCompleto {
  obra_id: string;
  equipe_id: string;
  data: string;
  atividades_executadas: string;
  atividades_planejadas: string;
  materiais_utilizados: string;
  clima: string;
  responsavel: string;
  localizacao: string;
  horas_ociosas: number;
  motivo_ociosidade: string;
  acidentes: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  progresso_atividades?: {
    nome: string;
    progresso: number;
    observacoes: string;
  }[];
  equipamentos_utilizados?: {
    nome: string;
    status: 'funcionando' | 'quebrado' | 'manutencao';
    observacoes?: string;
  }[];
  imagens?: File[];
}

export interface RDO {
  id: string;
  obra_id: string;
  equipe_id: string;
  data: string;
  atividades_executadas: string;
  atividades_planejadas: string;
  materiais_utilizados: string;
  clima: string;
  responsavel: string;
  localizacao: string;
  horas_ociosas: number;
  motivo_ociosidade: string;
  acidentes: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  progresso_atividades?: any;
  equipamentos_utilizados?: any;
  created_at: string;
  updated_at: string;
  aprovado_por?: string;
  aprovado_em?: string;
  rejeitado_por?: string;
  rejeitado_em?: string;
  motivo_rejeicao?: string;
  // Dados das relations
  obra?: {
    id: string;
    nome: string;
    endereco: string;
  };
  equipe?: {
    id: string;
    nome: string;
  };
  imagens?: {
    id: string;
    url: string;
    caption?: string;
  }[];
}

export interface RDOFiltros {
  obra_id?: string;
  equipe_id?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  responsavel?: string;
}

export const rdoService = {
  // Criar novo RDO
  async criarRDO(dados: CriarRDOCompleto): Promise<{ data: RDO | null; error: any }> {
    try {
      // Verificar se o usuário tem permissão para criar RDO na obra
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: { message: 'Usuário não autenticado' } };
      }

      // Preparar dados para inserção
      const rdoData = {
        obra_id: dados.obra_id,
        equipe_id: dados.equipe_id,
        data: dados.data,
        atividades_executadas: dados.atividades_executadas,
        atividades_planejadas: dados.atividades_planejadas,
        materiais_utilizados: dados.materiais_utilizados,
        clima: dados.clima,
        responsavel: dados.responsavel,
        localizacao: dados.localizacao,
        horas_ociosas: dados.horas_ociosas,
        motivo_ociosidade: dados.motivo_ociosidade,
        acidentes: dados.acidentes,
        status: dados.status,
        observacoes: dados.observacoes,
        progresso_atividades: dados.progresso_atividades || [],
        equipamentos_utilizados: dados.equipamentos_utilizados || [],
        created_by: currentUser.user.id
      };

      // Inserir RDO
      const { data: rdo, error } = await supabase
        .from('rdos')
        .insert([rdoData])
        .select(`
          *,
          obra:obras(id, nome, endereco),
          equipe:equipes(id, nome)
        `)
        .single();

      if (error) {
        console.error('Erro ao criar RDO:', error);
        return { data: null, error };
      }

      // Upload de imagens se houver
      if (dados.imagens && dados.imagens.length > 0) {
        const imagensUpload = await Promise.all(
          dados.imagens.map(async (imagem, index) => {
            const nomeArquivo = `${rdo.id}/${Date.now()}_${index}_${imagem.name}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('rdo-imagens')
              .upload(nomeArquivo, imagem, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Erro ao fazer upload da imagem:', uploadError);
              return null;
            }

            // Obter URL pública da imagem
            const { data: urlData } = supabase.storage
              .from('rdo-imagens')
              .getPublicUrl(nomeArquivo);

            // Inserir registro da imagem na tabela
            const { data: imagemData, error: imagemError } = await supabase
              .from('rdo_imagens')
              .insert([{
                rdo_id: rdo.id,
                url: urlData.publicUrl,
                nome_arquivo: nomeArquivo,
                caption: `Imagem ${index + 1}`
              }])
              .select()
              .single();

            if (imagemError) {
              console.error('Erro ao salvar registro da imagem:', imagemError);
              return null;
            }

            return imagemData;
          })
        );

        // Filtrar imagens que deram erro
        const imagensValidas = imagensUpload.filter(img => img !== null);
        rdo.imagens = imagensValidas;
      }

      return { data: rdo, error: null };
    } catch (error) {
      console.error('Erro interno ao criar RDO:', error);
      return { data: null, error };
    }
  },

  // Listar RDOs com filtros
  async listarRDOs(filtros: RDOFiltros = {}): Promise<{ data: RDO[]; error: any }> {
    try {
      let query = supabase
        .from('rdos')
        .select(`
          *,
          obra:obras(id, nome, endereco),
          equipe:equipes(id, nome),
          imagens:rdo_imagens(id, url, caption)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.obra_id) {
        query = query.eq('obra_id', filtros.obra_id);
      }
      if (filtros.equipe_id) {
        query = query.eq('equipe_id', filtros.equipe_id);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.data_inicio) {
        query = query.gte('data', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data', filtros.data_fim);
      }
      if (filtros.responsavel) {
        query = query.ilike('responsavel', `%${filtros.responsavel}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar RDOs:', error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Erro interno ao listar RDOs:', error);
      return { data: [], error };
    }
  },

  // Obter RDO por ID
  async obterRDOPorId(id: string): Promise<{ data: RDO | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('rdos')
        .select(`
          *,
          obra:obras(id, nome, endereco),
          equipe:equipes(id, nome),
          imagens:rdo_imagens(id, url, caption)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao obter RDO:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro interno ao obter RDO:', error);
      return { data: null, error };
    }
  },

  // Atualizar RDO
  async atualizarRDO(id: string, dados: Partial<CriarRDOCompleto>): Promise<{ data: RDO | null; error: any }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: { message: 'Usuário não autenticado' } };
      }

      const dadosAtualizacao = {
        ...dados,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('rdos')
        .update(dadosAtualizacao)
        .eq('id', id)
        .select(`
          *,
          obra:obras(id, nome, endereco),
          equipe:equipes(id, nome),
          imagens:rdo_imagens(id, url, caption)
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar RDO:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro interno ao atualizar RDO:', error);
      return { data: null, error };
    }
  },

  // Aprovar RDO
  async aprovarRDO(id: string): Promise<{ data: RDO | null; error: any }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase
        .from('rdos')
        .update({
          status: 'aprovado',
          aprovado_por: currentUser.user.id,
          aprovado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          obra:obras(id, nome, endereco),
          equipe:equipes(id, nome)
        `)
        .single();

      if (error) {
        console.error('Erro ao aprovar RDO:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro interno ao aprovar RDO:', error);
      return { data: null, error };
    }
  },

  // Rejeitar RDO
  async rejeitarRDO(id: string, motivo: string): Promise<{ data: RDO | null; error: any }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase
        .from('rdos')
        .update({
          status: 'rejeitado',
          rejeitado_por: currentUser.user.id,
          rejeitado_em: new Date().toISOString(),
          motivo_rejeicao: motivo
        })
        .eq('id', id)
        .select(`
          *,
          obra:obras(id, nome, endereco),
          equipe:equipes(id, nome)
        `)
        .single();

      if (error) {
        console.error('Erro ao rejeitar RDO:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erro interno ao rejeitar RDO:', error);
      return { data: null, error };
    }
  },

  // Excluir RDO
  async excluirRDO(id: string): Promise<{ success: boolean; error: any }> {
    try {
      // Primeiro, excluir imagens do storage
      const { data: imagens } = await supabase
        .from('rdo_imagens')
        .select('nome_arquivo')
        .eq('rdo_id', id);

      if (imagens && imagens.length > 0) {
        const nomeArquivos = imagens.map(img => img.nome_arquivo);
        await supabase.storage
          .from('rdo-imagens')
          .remove(nomeArquivos);
      }

      // Excluir registros de imagens
      await supabase
        .from('rdo_imagens')
        .delete()
        .eq('rdo_id', id);

      // Excluir RDO
      const { error } = await supabase
        .from('rdos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir RDO:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro interno ao excluir RDO:', error);
      return { success: false, error };
    }
  },

  // Obter estatísticas de RDOs
  async obterEstatisticas(obra_id?: string): Promise<{ data: any; error: any }> {
    try {
      let query = supabase
        .from('rdos')
        .select('status, data');

      if (obra_id) {
        query = query.eq('obra_id', obra_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao obter estatísticas:', error);
        return { data: null, error };
      }

      const stats = {
        total: data.length,
        rascunhos: data.filter(rdo => rdo.status === 'rascunho').length,
        enviados: data.filter(rdo => rdo.status === 'enviado').length,
        aprovados: data.filter(rdo => rdo.status === 'aprovado').length,
        rejeitados: data.filter(rdo => rdo.status === 'rejeitado').length,
        este_mes: data.filter(rdo => {
          const dataRDO = new Date(rdo.data);
          const hoje = new Date();
          return dataRDO.getMonth() === hoje.getMonth() && 
                 dataRDO.getFullYear() === hoje.getFullYear();
        }).length
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erro interno ao obter estatísticas:', error);
      return { data: null, error };
    }
  },

  // Gerar relatório de RDOs
  async gerarRelatorio(filtros: RDOFiltros = {}): Promise<{ data: any; error: any }> {
    try {
      const { data: rdos, error } = await this.listarRDOs(filtros);
      
      if (error) {
        return { data: null, error };
      }

      const relatorio = {
        periodo: {
          inicio: filtros.data_inicio || 'Início',
          fim: filtros.data_fim || 'Fim'
        },
        resumo: {
          total_rdos: rdos.length,
          por_status: {
            rascunhos: rdos.filter(rdo => rdo.status === 'rascunho').length,
            enviados: rdos.filter(rdo => rdo.status === 'enviado').length,
            aprovados: rdos.filter(rdo => rdo.status === 'aprovado').length,
            rejeitados: rdos.filter(rdo => rdo.status === 'rejeitado').length
          },
          por_obra: rdos.reduce((acc, rdo) => {
            const obraNome = rdo.obra?.nome || 'Não definido';
            acc[obraNome] = (acc[obraNome] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        detalhes: rdos.map(rdo => ({
          id: rdo.id,
          data: rdo.data,
          obra: rdo.obra?.nome,
          equipe: rdo.equipe?.nome,
          responsavel: rdo.responsavel,
          status: rdo.status,
          atividades: rdo.atividades_executadas,
          horas_ociosas: rdo.horas_ociosas,
          total_imagens: rdo.imagens?.length || 0
        }))
      };

      return { data: relatorio, error: null };
    } catch (error) {
      console.error('Erro interno ao gerar relatório:', error);
      return { data: null, error };
    }
  }
}; 