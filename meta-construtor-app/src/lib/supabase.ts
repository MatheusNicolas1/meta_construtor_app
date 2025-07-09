import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase baseada na connection string fornecida
const supabaseUrl = 'https://cajwnsgjqkxejfqvlggm.supabase.co';

// Chaves do projeto Supabase
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhanduc2dqcWt4ZWpmcXZsZ2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTM3MjMsImV4cCI6MjA2NzQyOTcyM30.NRkQNNWgf1_TksRxMLbw2tRDH3Ys8TnIMudfxqKcNy4';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key_here';

// Cliente principal para uso na aplicação (lado cliente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'meta-construtor-app'
    }
  }
});

// Cliente administrativo para operações que requerem privilégios elevados
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configurações do banco de dados
export const dbConfig = {
  host: 'db.cajwnsgjqkxejfqvlggm.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '[SAlocin1996,.;]',
  ssl: { rejectUnauthorized: false }
};

// Tipos para TypeScript - Estrutura completa
export type Database = {
  public: {
    Tables: {
      // Tabelas existentes
      obras: {
        Row: {
          id: string;
          nome: string;
          endereco: string;
          orcamento: number;
          data_inicio: string;
          data_previsao: string;
          status: 'ativa' | 'pausada' | 'concluida' | 'cancelada';
          responsavel: string;
          empresa_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          endereco: string;
          orcamento: number;
          data_inicio: string;
          data_previsao: string;
          status?: 'ativa' | 'pausada' | 'concluida' | 'cancelada';
          responsavel: string;
          empresa_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          endereco?: string;
          orcamento?: number;
          data_inicio?: string;
          data_previsao?: string;
          status?: 'ativa' | 'pausada' | 'concluida' | 'cancelada';
          responsavel?: string;
          empresa_id?: string | null;
          updated_at?: string;
        };
      };
      
      // Novas tabelas
      orcamento_analitico: {
        Row: {
          id: string;
          obra_id: string;
          nome_atividade: string;
          categoria: string;
          unidade: string;
          quantitativo: number;
          valor_unitario: number;
          valor_total: number;
          status: 'planejada' | 'em-andamento' | 'concluida' | 'cancelada';
          data_inicio: string | null;
          data_conclusao: string | null;
          responsavel: string | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          obra_id: string;
          nome_atividade: string;
          categoria: string;
          unidade?: string;
          quantitativo: number;
          valor_unitario: number;
          status?: 'planejada' | 'em-andamento' | 'concluida' | 'cancelada';
          data_inicio?: string | null;
          data_conclusao?: string | null;
          responsavel?: string | null;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          obra_id?: string;
          nome_atividade?: string;
          categoria?: string;
          unidade?: string;
          quantitativo?: number;
          valor_unitario?: number;
          status?: 'planejada' | 'em-andamento' | 'concluida' | 'cancelada';
          data_inicio?: string | null;
          data_conclusao?: string | null;
          responsavel?: string | null;
          observacoes?: string | null;
          updated_at?: string;
        };
      };

      obras_equipes: {
        Row: {
          id: string;
          obra_id: string;
          equipe_id: string;
          data_alocacao: string;
          data_liberacao: string | null;
          status: 'ativa' | 'liberada' | 'transferida';
          funcao_na_obra: string | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          obra_id: string;
          equipe_id: string;
          data_alocacao?: string;
          data_liberacao?: string | null;
          status?: 'ativa' | 'liberada' | 'transferida';
          funcao_na_obra?: string | null;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          obra_id?: string;
          equipe_id?: string;
          data_alocacao?: string;
          data_liberacao?: string | null;
          status?: 'ativa' | 'liberada' | 'transferida';
          funcao_na_obra?: string | null;
          observacoes?: string | null;
          updated_at?: string;
        };
      };

      obras_equipamentos: {
        Row: {
          id: string;
          obra_id: string;
          equipamento_id: string;
          data_alocacao: string;
          data_liberacao: string | null;
          quantidade: number;
          horas_utilizadas: number;
          custo_total: number;
          status: 'alocado' | 'em-uso' | 'liberado' | 'manutencao';
          responsavel: string | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          obra_id: string;
          equipamento_id: string;
          data_alocacao?: string;
          data_liberacao?: string | null;
          quantidade?: number;
          horas_utilizadas?: number;
          custo_total?: number;
          status?: 'alocado' | 'em-uso' | 'liberado' | 'manutencao';
          responsavel?: string | null;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          obra_id?: string;
          equipamento_id?: string;
          data_alocacao?: string;
          data_liberacao?: string | null;
          quantidade?: number;
          horas_utilizadas?: number;
          custo_total?: number;
          status?: 'alocado' | 'em-uso' | 'liberado' | 'manutencao';
          responsavel?: string | null;
          observacoes?: string | null;
          updated_at?: string;
        };
      };

      documentos: {
        Row: {
          id: string;
          obra_id: string;
          nome: string;
          categoria: 'projeto' | 'licenca' | 'memorial' | 'contrato' | 'rdo' | 'foto' | 'relatorio' | 'outros';
          descricao: string | null;
          arquivo_url: string;
          tamanho_bytes: number | null;
          tipo_mime: string | null;
          versao: number;
          status: 'ativo' | 'arquivado' | 'obsoleto';
          data_vencimento: string | null;
          usuario_upload: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          obra_id: string;
          nome: string;
          categoria: 'projeto' | 'licenca' | 'memorial' | 'contrato' | 'rdo' | 'foto' | 'relatorio' | 'outros';
          descricao?: string | null;
          arquivo_url: string;
          tamanho_bytes?: number | null;
          tipo_mime?: string | null;
          versao?: number;
          status?: 'ativo' | 'arquivado' | 'obsoleto';
          data_vencimento?: string | null;
          usuario_upload?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          obra_id?: string;
          nome?: string;
          categoria?: 'projeto' | 'licenca' | 'memorial' | 'contrato' | 'rdo' | 'foto' | 'relatorio' | 'outros';
          descricao?: string | null;
          arquivo_url?: string;
          tamanho_bytes?: number | null;
          tipo_mime?: string | null;
          versao?: number;
          status?: 'ativo' | 'arquivado' | 'obsoleto';
          data_vencimento?: string | null;
          usuario_upload?: string | null;
          updated_at?: string;
        };
      };

      empresas: {
        Row: {
          id: string;
          nome: string;
          cnpj: string | null;
          endereco: string | null;
          telefone: string | null;
          email: string | null;
          responsavel: string | null;
          plano: 'basico' | 'profissional' | 'empresarial';
          status: 'ativa' | 'inativa' | 'suspensa';
          data_contratacao: string;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cnpj?: string | null;
          endereco?: string | null;
          telefone?: string | null;
          email?: string | null;
          responsavel?: string | null;
          plano?: 'basico' | 'profissional' | 'empresarial';
          status?: 'ativa' | 'inativa' | 'suspensa';
          data_contratacao?: string;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cnpj?: string | null;
          endereco?: string | null;
          telefone?: string | null;
          email?: string | null;
          responsavel?: string | null;
          plano?: 'basico' | 'profissional' | 'empresarial';
          status?: 'ativa' | 'inativa' | 'suspensa';
          data_contratacao?: string;
          observacoes?: string | null;
          updated_at?: string;
        };
      };

      profiles: {
        Row: {
          id: string;
          nome: string | null;
          cargo: string | null;
          empresa: string | null;
          telefone: string | null;
          avatar_url: string | null;
          nivel_acesso: 'diretor' | 'gerente' | 'colaborador';
          empresa_id: string | null;
          permissoes: any | null;
          status: 'ativo' | 'inativo' | 'suspenso';
          onboarding_concluido: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome?: string | null;
          cargo?: string | null;
          empresa?: string | null;
          telefone?: string | null;
          avatar_url?: string | null;
          nivel_acesso?: 'diretor' | 'gerente' | 'colaborador';
          empresa_id?: string | null;
          permissoes?: any | null;
          status?: 'ativo' | 'inativo' | 'suspenso';
          onboarding_concluido?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string | null;
          cargo?: string | null;
          empresa?: string | null;
          telefone?: string | null;
          avatar_url?: string | null;
          nivel_acesso?: 'diretor' | 'gerente' | 'colaborador';
          empresa_id?: string | null;
          permissoes?: any | null;
          status?: 'ativo' | 'inativo' | 'suspenso';
          onboarding_concluido?: boolean;
          updated_at?: string;
        };
      };

      // Tabelas de checklist
      checklist_obra: {
        Row: {
          id: string;
          obra_id: string;
          data_checklist: string;
          responsavel: string;
          turno: 'matutino' | 'vespertino' | 'noturno';
          seguranca_trabalho: any;
          equipamentos_ferramentas: any;
          materiais_suprimentos: any;
          qualidade_servicos: any;
          meio_ambiente: any;
          organizacao_limpeza: any;
          observacoes: string | null;
          pontos_atencao: string | null;
          acao_corretiva: string | null;
          status: 'pendente' | 'em_andamento' | 'concluido';
          percentual_conclusao: number;
          aprovado_por: string | null;
          data_aprovacao: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          empresa_id: string | null;
        };
        Insert: {
          id?: string;
          obra_id: string;
          data_checklist: string;
          responsavel: string;
          turno?: 'matutino' | 'vespertino' | 'noturno';
          seguranca_trabalho?: any;
          equipamentos_ferramentas?: any;
          materiais_suprimentos?: any;
          qualidade_servicos?: any;
          meio_ambiente?: any;
          organizacao_limpeza?: any;
          observacoes?: string | null;
          pontos_atencao?: string | null;
          acao_corretiva?: string | null;
          status?: 'pendente' | 'em_andamento' | 'concluido';
          percentual_conclusao?: number;
          aprovado_por?: string | null;
          data_aprovacao?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          empresa_id?: string | null;
        };
        Update: {
          id?: string;
          obra_id?: string;
          data_checklist?: string;
          responsavel?: string;
          turno?: 'matutino' | 'vespertino' | 'noturno';
          seguranca_trabalho?: any;
          equipamentos_ferramentas?: any;
          materiais_suprimentos?: any;
          qualidade_servicos?: any;
          meio_ambiente?: any;
          organizacao_limpeza?: any;
          observacoes?: string | null;
          pontos_atencao?: string | null;
          acao_corretiva?: string | null;
          status?: 'pendente' | 'em_andamento' | 'concluido';
          percentual_conclusao?: number;
          aprovado_por?: string | null;
          data_aprovacao?: string | null;
          updated_at?: string;
          empresa_id?: string | null;
        };
      };

      checklist_template: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          categoria: string;
          seguranca_trabalho: any;
          equipamentos_ferramentas: any;
          materiais_suprimentos: any;
          qualidade_servicos: any;
          meio_ambiente: any;
          organizacao_limpeza: any;
          ativo: boolean;
          empresa_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string | null;
          categoria?: string;
          seguranca_trabalho?: any;
          equipamentos_ferramentas?: any;
          materiais_suprimentos?: any;
          qualidade_servicos?: any;
          meio_ambiente?: any;
          organizacao_limpeza?: any;
          ativo?: boolean;
          empresa_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string | null;
          categoria?: string;
          seguranca_trabalho?: any;
          equipamentos_ferramentas?: any;
          materiais_suprimentos?: any;
          qualidade_servicos?: any;
          meio_ambiente?: any;
          organizacao_limpeza?: any;
          ativo?: boolean;
          empresa_id?: string | null;
          updated_at?: string;
        };
      };

      // Demais tabelas existentes...
      equipes: {
        Row: {
          id: string;
          nome: string;
          lider: string;
          obra_id: string | null;
          status: 'ativa' | 'inativa' | 'disponivel';
          empresa_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          lider: string;
          obra_id?: string | null;
          status?: 'ativa' | 'inativa' | 'disponivel';
          empresa_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          lider?: string;
          obra_id?: string | null;
          status?: 'ativa' | 'inativa' | 'disponivel';
          empresa_id?: string | null;
          updated_at?: string;
        };
      };

      colaboradores: {
        Row: {
          id: string;
          nome: string;
          funcao: string;
          telefone: string | null;
          email: string | null;
          equipe_id: string | null;
          status: 'ativo' | 'inativo';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          funcao: string;
          telefone?: string | null;
          email?: string | null;
          equipe_id?: string | null;
          status?: 'ativo' | 'inativo';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          funcao?: string;
          telefone?: string | null;
          email?: string | null;
          equipe_id?: string | null;
          status?: 'ativo' | 'inativo';
          updated_at?: string;
        };
      };

      equipamentos: {
        Row: {
          id: string;
          nome: string;
          categoria: string;
          tipo: 'proprio' | 'alugado';
          valor_diario: number;
          status: 'disponivel' | 'em-uso' | 'manutencao' | 'quebrado';
          obra_atual: string | null;
          data_aquisicao: string;
          proxima_manutencao: string | null;
          observacoes: string | null;
          empresa_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          categoria: string;
          tipo: 'proprio' | 'alugado';
          valor_diario: number;
          status?: 'disponivel' | 'em-uso' | 'manutencao' | 'quebrado';
          obra_atual?: string | null;
          data_aquisicao: string;
          proxima_manutencao?: string | null;
          observacoes?: string | null;
          empresa_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          categoria?: string;
          tipo?: 'proprio' | 'alugado';
          valor_diario?: number;
          status?: 'disponivel' | 'em-uso' | 'manutencao' | 'quebrado';
          obra_atual?: string | null;
          data_aquisicao?: string;
          proxima_manutencao?: string | null;
          observacoes?: string | null;
          empresa_id?: string | null;
          updated_at?: string;
        };
      };

      rdos: {
        Row: {
          id: string;
          obra_id: string;
          equipe_id: string;
          data: string;
          atividades_executadas: string;
          atividades_planejadas: string;
          materiais_utilizados: string | null;
          clima: string;
          responsavel: string;
          localizacao: string | null;
          horas_ociosas: number;
          motivo_ociosidade: string | null;
          acidentes: string | null;
          observacoes: string | null;
          status: 'rascunho' | 'enviado' | 'aprovado';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          obra_id: string;
          equipe_id: string;
          data: string;
          atividades_executadas: string;
          atividades_planejadas: string;
          materiais_utilizados?: string | null;
          clima: string;
          responsavel: string;
          localizacao?: string | null;
          horas_ociosas?: number;
          motivo_ociosidade?: string | null;
          acidentes?: string | null;
          observacoes?: string | null;
          status?: 'rascunho' | 'enviado' | 'aprovado';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          obra_id?: string;
          equipe_id?: string;
          data?: string;
          atividades_executadas?: string;
          atividades_planejadas?: string;
          materiais_utilizados?: string | null;
          clima?: string;
          responsavel?: string;
          localizacao?: string | null;
          horas_ociosas?: number;
          motivo_ociosidade?: string | null;
          acidentes?: string | null;
          observacoes?: string | null;
          status?: 'rascunho' | 'enviado' | 'aprovado';
          updated_at?: string;
        };
      };

      atividades: {
        Row: {
          id: string;
          nome: string;
          categoria: string;
          unidade: string;
          descricao: string | null;
          duracao_estimada: number;
          status: 'ativa' | 'inativa';
          obra_vinculada: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          categoria: string;
          unidade: string;
          descricao?: string | null;
          duracao_estimada: number;
          status?: 'ativa' | 'inativa';
          obra_vinculada?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          categoria?: string;
          unidade?: string;
          descricao?: string | null;
          duracao_estimada?: number;
          status?: 'ativa' | 'inativa';
          obra_vinculada?: string | null;
          updated_at?: string;
        };
      };

      anexos: {
        Row: {
          id: string;
          nome: string;
          tipo: string;
          url: string;
          tamanho: number | null;
          rdo_id: string | null;
          obra_id: string | null;
          equipamento_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          tipo: string;
          url: string;
          tamanho?: number | null;
          rdo_id?: string | null;
          obra_id?: string | null;
          equipamento_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          tipo?: string;
          url?: string;
          tamanho?: number | null;
          rdo_id?: string | null;
          obra_id?: string | null;
          equipamento_id?: string | null;
        };
      };

      fornecedores: {
        Row: {
          id: string;
          nome: string;
          cnpj: string | null;
          telefone: string | null;
          email: string | null;
          endereco: string | null;
          categoria: string;
          status: 'ativo' | 'inativo';
          observacoes: string | null;
          empresa_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cnpj?: string | null;
          telefone?: string | null;
          email?: string | null;
          endereco?: string | null;
          categoria: string;
          status?: 'ativo' | 'inativo';
          observacoes?: string | null;
          empresa_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          cnpj?: string | null;
          telefone?: string | null;
          email?: string | null;
          endereco?: string | null;
          categoria?: string;
          status?: 'ativo' | 'inativo';
          observacoes?: string | null;
          empresa_id?: string | null;
          updated_at?: string;
        };
      };

      materiais: {
        Row: {
          id: string;
          nome: string;
          categoria: string;
          unidade: string;
          preco_unitario: number | null;
          fornecedor_id: string | null;
          status: 'ativo' | 'inativo';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          categoria: string;
          unidade: string;
          preco_unitario?: number | null;
          fornecedor_id?: string | null;
          status?: 'ativo' | 'inativo';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          categoria?: string;
          unidade?: string;
          preco_unitario?: number | null;
          fornecedor_id?: string | null;
          status?: 'ativo' | 'inativo';
          updated_at?: string;
        };
      };
    };
    Views: {
      obra_resumo: {
        Row: {
          id: string;
          nome: string;
          endereco: string;
          orcamento: number;
          status: string;
          responsavel: string;
          data_inicio: string;
          data_previsao: string;
          empresa_id: string | null;
          total_equipes: number;
          total_equipamentos: number;
          total_rdos: number;
          orcamento_analitico_total: number;
          valor_medio_atividade: number;
        };
      };
    };
    Functions: {
      pode_ver_dados_financeiros: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
  };
};

// Tipos específicos para facilitar o uso
export type Obra = Database['public']['Tables']['obras']['Row'];
export type NovaObra = Database['public']['Tables']['obras']['Insert'];
export type AtualizarObra = Database['public']['Tables']['obras']['Update'];

export type OrcamentoAnalitico = Database['public']['Tables']['orcamento_analitico']['Row'];
export type NovoOrcamentoAnalitico = Database['public']['Tables']['orcamento_analitico']['Insert'];

export type ObraEquipe = Database['public']['Tables']['obras_equipes']['Row'];
export type NovaObraEquipe = Database['public']['Tables']['obras_equipes']['Insert'];

export type ObraEquipamento = Database['public']['Tables']['obras_equipamentos']['Row'];
export type NovoObraEquipamento = Database['public']['Tables']['obras_equipamentos']['Insert'];

export type Documento = Database['public']['Tables']['documentos']['Row'];
export type NovoDocumento = Database['public']['Tables']['documentos']['Insert'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Empresa = Database['public']['Tables']['empresas']['Row'];

export type ObraResumo = Database['public']['Views']['obra_resumo']['Row'];

// Configuração de Storage Buckets
export const STORAGE_BUCKETS = {
  OBRAS_ANEXOS: 'obras-anexos',
  RDO_IMAGENS: 'rdo-imagens',
  DOCUMENTOS: 'documentos',
  AVATARS: 'avatars'
} as const;

// Funções utilitárias para o Supabase
export const supabaseUtils = {
  // Verificar se o usuário está autenticado
  isAuthenticated: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    // Verificar se está em modo demo
    const demoMode = localStorage.getItem('demo-mode');
    const demoUser = localStorage.getItem('demo-user');
    
    if (demoMode === 'true' && demoUser) {
      const userData = JSON.parse(demoUser);
      return {
        id: userData.id,
        email: userData.email,
        user_metadata: { nome: userData.nome }
      };
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Obter perfil do usuário atual
  getCurrentProfile: async (): Promise<{ data: Profile | null; error: any }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado' };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  },

  // Verificar se usuário pode ver dados financeiros
  canViewFinancialData: async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase.rpc('pode_ver_dados_financeiros', { user_id: user.id });
    return !!data;
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Upload de arquivo com estrutura organizada
  uploadFile: async (bucket: string, filePath: string, file: File, options?: { 
    upsert?: boolean;
    metadata?: Record<string, any>;
  }) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: options?.upsert || false,
        metadata: options?.metadata
      });
    return { data, error };
  },

  // Upload de arquivo para obra específica
  uploadObraFile: async (obraId: string, categoria: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${obraId}/${categoria}/${fileName}`;
    
    return supabaseUtils.uploadFile(STORAGE_BUCKETS.OBRAS_ANEXOS, filePath, file, {
      metadata: {
        obra_id: obraId,
        categoria,
        original_name: file.name,
        size: file.size,
        type: file.type
      }
    });
  },

  // Download de arquivo
  downloadFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  // Obter URL pública de arquivo
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Deletar arquivo
  deleteFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  },

  // Listar arquivos de uma obra
  listObraFiles: async (obraId: string, categoria?: string) => {
    const path = categoria ? `${obraId}/${categoria}` : obraId;
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.OBRAS_ANEXOS)
      .list(path);
    return { data, error };
  },

  // Helpers para formatação
  formatCurrency: (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  formatDate: (date: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  },

  formatDateTime: (date: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(date));
  }
}; 