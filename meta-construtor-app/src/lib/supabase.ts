import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase baseada na connection string fornecida
const supabaseUrl = 'https://cajwnsgjqkxejfqvlggm.supabase.co';

// IMPORTANTE: Substitua estas chaves pelas suas chaves reais do projeto Supabase
// Você pode encontrá-las em: https://supabase.com/dashboard/project/cajwnsgjqkxejfqvlggm/settings/api
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_anon_key_here';
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

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
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
          updated_at?: string;
        };
      };
      equipes: {
        Row: {
          id: string;
          nome: string;
          lider: string;
          obra_id: string | null;
          status: 'ativa' | 'inativa' | 'disponivel';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          lider: string;
          obra_id?: string | null;
          status?: 'ativa' | 'inativa' | 'disponivel';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          lider?: string;
          obra_id?: string | null;
          status?: 'ativa' | 'inativa' | 'disponivel';
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
    };
  };
};

// Funções utilitárias para o Supabase
export const supabaseUtils = {
  // Verificar se o usuário está autenticado
  isAuthenticated: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Upload de arquivo
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
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
  }
}; 