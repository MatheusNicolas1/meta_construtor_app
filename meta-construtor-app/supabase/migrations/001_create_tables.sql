-- Habilita a extensão uuid-ossp para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilita RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Tabela de Obras
CREATE TABLE IF NOT EXISTS public.obras (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    endereco TEXT NOT NULL,
    orcamento DECIMAL(15,2) NOT NULL DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_previsao DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'concluida', 'cancelada')),
    responsavel TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Equipes
CREATE TABLE IF NOT EXISTS public.equipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    lider TEXT NOT NULL,
    obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('ativa', 'inativa', 'disponivel')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Colaboradores
CREATE TABLE IF NOT EXISTS public.colaboradores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    funcao TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Equipamentos
CREATE TABLE IF NOT EXISTS public.equipamentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('proprio', 'alugado')),
    valor_diario DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em-uso', 'manutencao', 'quebrado')),
    obra_atual UUID REFERENCES public.obras(id) ON DELETE SET NULL,
    data_aquisicao DATE NOT NULL,
    proxima_manutencao DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de RDOs (Relatórios Diários de Obra)
CREATE TABLE IF NOT EXISTS public.rdos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    atividades_executadas TEXT NOT NULL,
    atividades_planejadas TEXT NOT NULL,
    materiais_utilizados TEXT,
    clima TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    localizacao TEXT,
    horas_ociosas INTEGER DEFAULT 0,
    motivo_ociosidade TEXT,
    acidentes TEXT,
    observacoes TEXT,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(obra_id, equipe_id, data)
);

-- Tabela de Atividades
CREATE TABLE IF NOT EXISTS public.atividades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    unidade TEXT NOT NULL,
    descricao TEXT,
    duracao_estimada INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    obra_vinculada UUID REFERENCES public.obras(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Anexos/Fotos
CREATE TABLE IF NOT EXISTS public.anexos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    url TEXT NOT NULL,
    tamanho INTEGER,
    rdo_id UUID REFERENCES public.rdos(id) ON DELETE CASCADE,
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
    equipamento_id UUID REFERENCES public.equipamentos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    categoria TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Materiais
CREATE TABLE IF NOT EXISTS public.materiais (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    unidade TEXT NOT NULL,
    preco_unitario DECIMAL(10,2),
    fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de Usuários (estende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome TEXT,
    cargo TEXT,
    empresa TEXT,
    telefone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS obras_status_idx ON public.obras(status);
CREATE INDEX IF NOT EXISTS obras_responsavel_idx ON public.obras(responsavel);
CREATE INDEX IF NOT EXISTS obras_data_inicio_idx ON public.obras(data_inicio);

CREATE INDEX IF NOT EXISTS equipes_obra_id_idx ON public.equipes(obra_id);
CREATE INDEX IF NOT EXISTS equipes_status_idx ON public.equipes(status);

CREATE INDEX IF NOT EXISTS colaboradores_equipe_id_idx ON public.colaboradores(equipe_id);
CREATE INDEX IF NOT EXISTS colaboradores_status_idx ON public.colaboradores(status);

CREATE INDEX IF NOT EXISTS equipamentos_obra_atual_idx ON public.equipamentos(obra_atual);
CREATE INDEX IF NOT EXISTS equipamentos_status_idx ON public.equipamentos(status);
CREATE INDEX IF NOT EXISTS equipamentos_categoria_idx ON public.equipamentos(categoria);

CREATE INDEX IF NOT EXISTS rdos_obra_id_idx ON public.rdos(obra_id);
CREATE INDEX IF NOT EXISTS rdos_equipe_id_idx ON public.rdos(equipe_id);
CREATE INDEX IF NOT EXISTS rdos_data_idx ON public.rdos(data);
CREATE INDEX IF NOT EXISTS rdos_status_idx ON public.rdos(status);

CREATE INDEX IF NOT EXISTS atividades_obra_vinculada_idx ON public.atividades(obra_vinculada);
CREATE INDEX IF NOT EXISTS atividades_categoria_idx ON public.atividades(categoria);

CREATE INDEX IF NOT EXISTS anexos_rdo_id_idx ON public.anexos(rdo_id);
CREATE INDEX IF NOT EXISTS anexos_obra_id_idx ON public.anexos(obra_id);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER obras_updated_at BEFORE UPDATE ON public.obras FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER equipes_updated_at BEFORE UPDATE ON public.equipes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER colaboradores_updated_at BEFORE UPDATE ON public.colaboradores FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER equipamentos_updated_at BEFORE UPDATE ON public.equipamentos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER rdos_updated_at BEFORE UPDATE ON public.rdos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER atividades_updated_at BEFORE UPDATE ON public.atividades FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER fornecedores_updated_at BEFORE UPDATE ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER materiais_updated_at BEFORE UPDATE ON public.materiais FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Configurar RLS (Row Level Security)
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir tudo para usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver obras" ON public.obras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir obras" ON public.obras FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar obras" ON public.obras FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar obras" ON public.obras FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver equipes" ON public.equipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir equipes" ON public.equipes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar equipes" ON public.equipes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar equipes" ON public.equipes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver colaboradores" ON public.colaboradores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir colaboradores" ON public.colaboradores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar colaboradores" ON public.colaboradores FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar colaboradores" ON public.colaboradores FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver equipamentos" ON public.equipamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir equipamentos" ON public.equipamentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar equipamentos" ON public.equipamentos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar equipamentos" ON public.equipamentos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver rdos" ON public.rdos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir rdos" ON public.rdos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar rdos" ON public.rdos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar rdos" ON public.rdos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver atividades" ON public.atividades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir atividades" ON public.atividades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar atividades" ON public.atividades FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar atividades" ON public.atividades FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver anexos" ON public.anexos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir anexos" ON public.anexos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem deletar anexos" ON public.anexos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver fornecedores" ON public.fornecedores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir fornecedores" ON public.fornecedores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar fornecedores" ON public.fornecedores FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar fornecedores" ON public.fornecedores FOR DELETE TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem ver materiais" ON public.materiais FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir materiais" ON public.materiais FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar materiais" ON public.materiais FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar materiais" ON public.materiais FOR DELETE TO authenticated USING (true);

-- Políticas para perfis de usuário
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Usuários podem inserir seus próprios perfis" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Função para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 