-- =============================================
-- SISTEMA DE ROLES (SEGURO - TABELA SEPARADA)
-- =============================================

-- Enum para roles da aplicação
CREATE TYPE public.app_role AS ENUM ('Administrador', 'Gerente', 'Colaborador');

-- Tabela de roles dos usuários (CRÍTICO: separada da tabela users)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função SECURITY DEFINER para verificar roles (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se usuário tem qualquer uma das roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- RLS Policies para user_roles
CREATE POLICY "Usuários podem ver suas próprias roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Apenas administradores podem inserir roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'Administrador'));

CREATE POLICY "Apenas administradores podem atualizar roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'Administrador'));

CREATE POLICY "Apenas administradores podem deletar roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'Administrador'));

-- =============================================
-- TABELA DE PERFIS DE USUÁRIOS
-- =============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis são visíveis para usuários autenticados"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Perfis são criados automaticamente"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- =============================================
-- TABELA DE OBRAS
-- =============================================

CREATE TABLE public.obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    localizacao TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    cliente TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Residencial', 'Comercial', 'Industrial', 'Infraestrutura', 'Institucional')),
    progresso INTEGER NOT NULL DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    data_inicio DATE NOT NULL,
    previsao_termino DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Iniciando' CHECK (status IN ('Iniciando', 'Em andamento', 'Finalizando', 'Concluída', 'Pausada')),
    descricao TEXT,
    area TEXT,
    categoria TEXT,
    prioridade TEXT CHECK (prioridade IN ('Baixa', 'Média', 'Alta')),
    observacoes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver todas as obras"
ON public.obras FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem criar obras"
ON public.obras FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar obras que criaram ou admin/gerente pode atualizar qualquer"
ON public.obras FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.has_any_role(auth.uid(), ARRAY['Administrador', 'Gerente']::public.app_role[])
);

CREATE POLICY "Apenas administradores podem deletar obras"
ON public.obras FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'Administrador'));

-- =============================================
-- TABELA DE RDOs
-- =============================================

CREATE TABLE public.rdos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data DATE NOT NULL,
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL,
    periodo TEXT NOT NULL CHECK (periodo IN ('Manhã', 'Tarde', 'Noite')),
    clima TEXT NOT NULL,
    equipe_ociosa BOOLEAN NOT NULL DEFAULT false,
    tempo_ocioso NUMERIC,
    status TEXT NOT NULL DEFAULT 'Em elaboração' CHECK (status IN ('Em elaboração', 'Aguardando aprovação', 'Aprovado', 'Rejeitado')),
    criado_por_id UUID REFERENCES auth.users(id) NOT NULL,
    aprovado_por_id UUID REFERENCES auth.users(id),
    data_aprovacao TIMESTAMPTZ,
    motivo_rejeicao TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rdos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver RDOs"
ON public.rdos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem criar RDOs"
ON public.rdos FOR INSERT
TO authenticated
WITH CHECK (criado_por_id = auth.uid());

CREATE POLICY "Criador pode atualizar RDO em elaboração"
ON public.rdos FOR UPDATE
TO authenticated
USING (criado_por_id = auth.uid() AND status = 'Em elaboração');

CREATE POLICY "Gerentes e Admins podem aprovar/rejeitar RDOs"
ON public.rdos FOR UPDATE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['Administrador', 'Gerente']::public.app_role[])
  AND status IN ('Aguardando aprovação', 'Em elaboração')
);

-- =============================================
-- TABELA DE ATIVIDADES DO RDO
-- =============================================

CREATE TABLE public.rdo_atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rdo_id UUID REFERENCES public.rdos(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    quantidade NUMERIC NOT NULL,
    unidade_medida TEXT NOT NULL,
    percentual_concluido INTEGER NOT NULL DEFAULT 0 CHECK (percentual_concluido >= 0 AND percentual_concluido <= 100),
    status TEXT NOT NULL CHECK (status IN ('Iniciada', 'Em Andamento', 'Concluída')),
    observacoes TEXT,
    is_extra BOOLEAN NOT NULL DEFAULT false,
    justificativa TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rdo_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver atividades dos RDOs"
ON public.rdo_atividades FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem criar atividades em seus RDOs"
ON public.rdo_atividades FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rdos 
    WHERE id = rdo_id AND criado_por_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem atualizar atividades em seus RDOs"
ON public.rdo_atividades FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rdos 
    WHERE id = rdo_id AND criado_por_id = auth.uid()
  )
);

-- =============================================
-- TABELA DE EQUIPES
-- =============================================

CREATE TABLE public.equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    funcao TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver equipes"
ON public.equipes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem criar equipes"
ON public.equipes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas equipes ou admin/gerente qualquer"
ON public.equipes FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.has_any_role(auth.uid(), ARRAY['Administrador', 'Gerente']::public.app_role[])
);

-- =============================================
-- TABELA DE EQUIPES NO RDO
-- =============================================

CREATE TABLE public.rdo_equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rdo_id UUID REFERENCES public.rdos(id) ON DELETE CASCADE NOT NULL,
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE NOT NULL,
    horas_trabalho NUMERIC NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT true,
    horas_ociosas NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rdo_equipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver equipes dos RDOs"
ON public.rdo_equipes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem gerenciar equipes em seus RDOs"
ON public.rdo_equipes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rdos 
    WHERE id = rdo_id AND criado_por_id = auth.uid()
  )
);

-- =============================================
-- TABELA DE EQUIPAMENTOS
-- =============================================

CREATE TABLE public.equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Operacional' CHECK (status IN ('Operacional', 'Manutenção', 'Parado')),
    observacoes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver equipamentos"
ON public.equipamentos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem criar equipamentos"
ON public.equipamentos FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus equipamentos ou admin/gerente qualquer"
ON public.equipamentos FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.has_any_role(auth.uid(), ARRAY['Administrador', 'Gerente']::public.app_role[])
);

-- =============================================
-- TABELA DE EQUIPAMENTOS NO RDO
-- =============================================

CREATE TABLE public.rdo_equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rdo_id UUID REFERENCES public.rdos(id) ON DELETE CASCADE NOT NULL,
    equipamento_id UUID REFERENCES public.equipamentos(id) ON DELETE CASCADE NOT NULL,
    horas_uso NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Operacional', 'Manutenção', 'Parado', 'Quebrado')),
    observacoes TEXT,
    descricao_problema TEXT,
    causou_ociosidade BOOLEAN DEFAULT false,
    horas_parada NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rdo_equipamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver equipamentos dos RDOs"
ON public.rdo_equipamentos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem gerenciar equipamentos em seus RDOs"
ON public.rdo_equipamentos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rdos 
    WHERE id = rdo_id AND criado_por_id = auth.uid()
  )
);

-- =============================================
-- TABELA DE FORNECEDORES
-- =============================================

CREATE TABLE public.fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    contato TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    endereco TEXT,
    cnpj TEXT,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver fornecedores"
ON public.fornecedores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem criar fornecedores"
ON public.fornecedores FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus fornecedores ou admin/gerente qualquer"
ON public.fornecedores FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.has_any_role(auth.uid(), ARRAY['Administrador', 'Gerente']::public.app_role[])
);

-- =============================================
-- TABELA DE CHECKLISTS
-- =============================================

CREATE TABLE public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('Segurança', 'Qualidade', 'Equipamentos', 'Documentação', 'Outros')),
    descricao TEXT,
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL,
    responsavel_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Rascunho' CHECK (status IN ('Rascunho', 'Em Andamento', 'Concluído', 'Pendente', 'Cancelado')),
    data_vencimento DATE,
    template_id UUID,
    progresso_total INTEGER DEFAULT 0,
    progresso_completo INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    signature_data TEXT,
    signature_name TEXT,
    signature_email TEXT,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver checklists"
ON public.checklists FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem criar checklists"
ON public.checklists FOR INSERT
TO authenticated
WITH CHECK (responsavel_id = auth.uid());

CREATE POLICY "Responsável pode atualizar checklist"
ON public.checklists FOR UPDATE
TO authenticated
USING (
  responsavel_id = auth.uid() OR
  public.has_any_role(auth.uid(), ARRAY['Administrador', 'Gerente']::public.app_role[])
);

-- =============================================
-- TABELA DE ITENS DE CHECKLIST
-- =============================================

CREATE TABLE public.checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    prioridade TEXT NOT NULL CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Crítica')),
    status TEXT NOT NULL DEFAULT 'Não iniciado' CHECK (status IN ('Não iniciado', 'Em andamento', 'Concluído', 'Não aplicável')),
    requer_anexo BOOLEAN NOT NULL DEFAULT false,
    obrigatorio BOOLEAN NOT NULL DEFAULT false,
    observacoes TEXT,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver itens de checklist"
ON public.checklist_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem gerenciar itens de seus checklists"
ON public.checklist_items FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.checklists 
    WHERE id = checklist_id AND responsavel_id = auth.uid()
  )
);

-- =============================================
-- TABELA DE DOCUMENTOS
-- =============================================

CREATE TABLE public.documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    url TEXT NOT NULL,
    tamanho INTEGER,
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
    rdo_id UUID REFERENCES public.rdos(id) ON DELETE CASCADE,
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE,
    checklist_item_id UUID REFERENCES public.checklist_items(id) ON DELETE CASCADE,
    descricao TEXT,
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver documentos"
ON public.documentos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem fazer upload de documentos"
ON public.documentos FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Usuários podem deletar seus documentos ou admin pode deletar qualquer"
ON public.documentos FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid() OR
  public.has_role(auth.uid(), 'Administrador')
);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_obras_updated_at
    BEFORE UPDATE ON public.obras
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rdos_updated_at
    BEFORE UPDATE ON public.rdos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipes_updated_at
    BEFORE UPDATE ON public.equipes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipamentos_updated_at
    BEFORE UPDATE ON public.equipamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at
    BEFORE UPDATE ON public.fornecedores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at
    BEFORE UPDATE ON public.checklists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  
  -- Adicionar role padrão de Colaborador para novos usuários
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'Colaborador');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- =============================================

CREATE INDEX idx_obras_user_id ON public.obras(user_id);
CREATE INDEX idx_obras_status ON public.obras(status);
CREATE INDEX idx_rdos_obra_id ON public.rdos(obra_id);
CREATE INDEX idx_rdos_criado_por_id ON public.rdos(criado_por_id);
CREATE INDEX idx_rdos_status ON public.rdos(status);
CREATE INDEX idx_rdo_atividades_rdo_id ON public.rdo_atividades(rdo_id);
CREATE INDEX idx_checklists_obra_id ON public.checklists(obra_id);
CREATE INDEX idx_checklists_responsavel_id ON public.checklists(responsavel_id);
CREATE INDEX idx_documentos_obra_id ON public.documentos(obra_id);
CREATE INDEX idx_documentos_rdo_id ON public.documentos(rdo_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);;
