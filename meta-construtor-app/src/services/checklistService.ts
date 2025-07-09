import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

export type ChecklistObra = Database['public']['Tables']['checklist_obra']['Row'];
export type ChecklistObraInsert = Database['public']['Tables']['checklist_obra']['Insert'];
export type ChecklistObraUpdate = Database['public']['Tables']['checklist_obra']['Update'];

export type ChecklistTemplate = Database['public']['Tables']['checklist_template']['Row'];
export type ChecklistTemplateInsert = Database['public']['Tables']['checklist_template']['Insert'];
export type ChecklistTemplateUpdate = Database['public']['Tables']['checklist_template']['Update'];

// Tipos para as seções do checklist
export interface ChecklistItem {
  label: string;
  required: boolean;
  status?: 'ok' | 'nao_ok' | 'nao_aplicavel';
  checked?: boolean;
  observacao?: string;
}

export interface ChecklistSecao {
  [key: string]: ChecklistItem;
}

export interface ChecklistCompleto extends ChecklistObra {
  obra?: {
    id: string;
    nome: string;
    endereco: string;
  };
}

class ChecklistService {
  // ===== CHECKLIST OBRA =====
  
  async listarChecklists(obraId?: string): Promise<ChecklistCompleto[]> {
    try {
      let query = supabase
        .from('checklist_obra')
        .select(`
          *,
          obra:obras(id, nome, endereco)
        `)
        .order('data_checklist', { ascending: false });

      if (obraId) {
        query = query.eq('obra_id', obraId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar checklists:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao listar checklists:', error);
      throw error;
    }
  }

  async obterChecklist(id: string): Promise<ChecklistCompleto | null> {
    try {
      const { data, error } = await supabase
        .from('checklist_obra')
        .select(`
          *,
          obra:obras(id, nome, endereco)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao obter checklist:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao obter checklist:', error);
      throw error;
    }
  }

  async criarChecklist(checklist: ChecklistObraInsert): Promise<ChecklistObra> {
    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Obter empresa do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      const checklistData: ChecklistObraInsert = {
        ...checklist,
        created_by: user.id,
        empresa_id: profile?.empresa_id || null,
      };

      const { data, error } = await supabase
        .from('checklist_obra')
        .insert([checklistData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar checklist:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar checklist:', error);
      throw error;
    }
  }

  async atualizarChecklist(id: string, checklist: ChecklistObraUpdate): Promise<ChecklistObra> {
    try {
      const { data, error } = await supabase
        .from('checklist_obra')
        .update(checklist)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar checklist:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar checklist:', error);
      throw error;
    }
  }

  async removerChecklist(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('checklist_obra')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover checklist:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao remover checklist:', error);
      throw error;
    }
  }

  async aprovarChecklist(id: string, aprovadoPor: string): Promise<ChecklistObra> {
    try {
      const { data, error } = await supabase
        .from('checklist_obra')
        .update({
          aprovado_por: aprovadoPor,
          data_aprovacao: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao aprovar checklist:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao aprovar checklist:', error);
      throw error;
    }
  }

  // ===== CHECKLIST TEMPLATES =====

  async listarTemplates(): Promise<ChecklistTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('checklist_template')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao listar templates:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao listar templates:', error);
      throw error;
    }
  }

  async obterTemplate(id: string): Promise<ChecklistTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('checklist_template')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao obter template:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao obter template:', error);
      throw error;
    }
  }

  async criarTemplate(template: ChecklistTemplateInsert): Promise<ChecklistTemplate> {
    try {
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Obter empresa do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      const templateData: ChecklistTemplateInsert = {
        ...template,
        created_by: user.id,
        empresa_id: profile?.empresa_id || null,
      };

      const { data, error } = await supabase
        .from('checklist_template')
        .insert([templateData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar template:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar template:', error);
      throw error;
    }
  }

  async atualizarTemplate(id: string, template: ChecklistTemplateUpdate): Promise<ChecklistTemplate> {
    try {
      const { data, error } = await supabase
        .from('checklist_template')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar template:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      throw error;
    }
  }

  async removerTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('checklist_template')
        .update({ ativo: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover template:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao remover template:', error);
      throw error;
    }
  }

  // ===== UTILITÁRIOS =====

  async criarChecklistDoTemplate(templateId: string, dadosObra: {
    obra_id: string;
    data_checklist: string;
    responsavel: string;
    turno?: 'matutino' | 'vespertino' | 'noturno';
  }): Promise<ChecklistObra> {
    try {
      // Obter template
      const template = await this.obterTemplate(templateId);
      if (!template) {
        throw new Error('Template não encontrado');
      }

      // Criar checklist baseado no template
      const checklistData: ChecklistObraInsert = {
        ...dadosObra,
        seguranca_trabalho: template.seguranca_trabalho,
        equipamentos_ferramentas: template.equipamentos_ferramentas,
        materiais_suprimentos: template.materiais_suprimentos,
        qualidade_servicos: template.qualidade_servicos,
        meio_ambiente: template.meio_ambiente,
        organizacao_limpeza: template.organizacao_limpeza,
      };

      return await this.criarChecklist(checklistData);
    } catch (error) {
      console.error('Erro ao criar checklist do template:', error);
      throw error;
    }
  }

  async verificarChecklistExistente(obraId: string, data: string, turno: string): Promise<boolean> {
    try {
      const { data: checklist, error } = await supabase
        .from('checklist_obra')
        .select('id')
        .eq('obra_id', obraId)
        .eq('data_checklist', data)
        .eq('turno', turno)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar checklist existente:', error);
        throw error;
      }

      return !!checklist;
    } catch (error) {
      console.error('Erro ao verificar checklist existente:', error);
      return false;
    }
  }

  async obterResumoChecklist(obraId: string, periodo?: { inicio: string; fim: string }): Promise<{
    total: number;
    pendentes: number;
    em_andamento: number;
    concluidos: number;
    percentual_medio: number;
  }> {
    try {
      let query = supabase
        .from('checklist_obra')
        .select('status, percentual_conclusao')
        .eq('obra_id', obraId);

      if (periodo) {
        query = query
          .gte('data_checklist', periodo.inicio)
          .lte('data_checklist', periodo.fim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao obter resumo do checklist:', error);
        throw error;
      }

      const resumo = {
        total: data?.length || 0,
        pendentes: data?.filter(c => c.status === 'pendente').length || 0,
        em_andamento: data?.filter(c => c.status === 'em_andamento').length || 0,
        concluidos: data?.filter(c => c.status === 'concluido').length || 0,
        percentual_medio: data?.length 
          ? Math.round(data.reduce((acc, c) => acc + c.percentual_conclusao, 0) / data.length)
          : 0,
      };

      return resumo;
    } catch (error) {
      console.error('Erro ao obter resumo do checklist:', error);
      throw error;
    }
  }

  // ===== TEMPLATE PADRÃO =====

  obterTemplatePadrao(): ChecklistTemplateInsert {
    return {
      nome: 'Checklist Personalizado',
      descricao: 'Checklist criado pelo usuário',
      categoria: 'personalizado',
      seguranca_trabalho: {
        epi_uso: { label: 'Uso correto de EPIs', required: true },
        sinalizacao: { label: 'Sinalização adequada', required: true },
        primeiros_socorros: { label: 'Kit primeiros socorros disponível', required: true },
        treinamento_safety: { label: 'Equipe treinada em segurança', required: true },
      },
      equipamentos_ferramentas: {
        ferramentas_estado: { label: 'Ferramentas em bom estado', required: true },
        equipamentos_calibrados: { label: 'Equipamentos calibrados', required: false },
        manutencao_preventiva: { label: 'Manutenção preventiva em dia', required: true },
        limpeza_equipamentos: { label: 'Equipamentos limpos', required: true },
      },
      materiais_suprimentos: {
        materiais_qualidade: { label: 'Materiais com qualidade adequada', required: true },
        estoque_suficiente: { label: 'Estoque suficiente', required: false },
        armazenamento_correto: { label: 'Armazenamento correto', required: true },
        controle_entrada: { label: 'Controle de entrada de materiais', required: true },
      },
      qualidade_servicos: {
        especificacoes_tecnicas: { label: 'Conforme especificações técnicas', required: true },
        controle_qualidade: { label: 'Controle de qualidade executado', required: true },
        testes_realizados: { label: 'Testes realizados conforme norma', required: true },
      },
      meio_ambiente: {
        residuos_segregados: { label: 'Resíduos segregados corretamente', required: true },
        impacto_ambiental: { label: 'Sem impacto ambiental', required: true },
        consumo_agua: { label: 'Consumo de água controlado', required: false },
        ruido_controlado: { label: 'Ruído dentro dos limites', required: true },
      },
      organizacao_limpeza: {
        area_organizada: { label: 'Área de trabalho organizada', required: true },
        limpeza_final: { label: 'Limpeza final executada', required: false },
        acesso_livre: { label: 'Acessos livres e seguros', required: true },
        sinalizacao_areas: { label: 'Áreas sinalizadas', required: true },
      },
    };
  }
}

export const checklistService = new ChecklistService(); 