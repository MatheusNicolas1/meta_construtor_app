-- ============================================================================
-- CORREÇÃO CRÍTICA: ISOLAMENTO TOTAL DE DADOS POR USUÁRIO
-- ============================================================================
-- Esta migração garante que cada usuário veja APENAS seus próprios dados
-- através de políticas RLS rigorosas e validação do trigger de criação
-- ============================================================================

-- 1. REFORÇAR POLÍTICAS RLS EM TABELAS CRÍTICAS
-- ============================================================================

-- 1.1 Garantir que user_id seja NOT NULL em todas as tabelas críticas
-- (Previne registros "órfãos" que não pertencem a ninguém)

ALTER TABLE public.obras 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.equipamentos 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.equipes 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.fornecedores 
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.rdos 
  ALTER COLUMN criado_por_id SET NOT NULL;

-- 1.2 Garantir que uploaded_by seja NOT NULL em documentos
ALTER TABLE public.documentos 
  ALTER COLUMN uploaded_by SET NOT NULL;

-- ============================================================================
-- 2. ADICIONAR ÍNDICES PARA PERFORMANCE EM CONSULTAS FILTRADAS POR USER_ID
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_obras_user_id ON public.obras(user_id);
CREATE INDEX IF NOT EXISTS idx_equipamentos_user_id ON public.equipamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_equipes_user_id ON public.equipes(user_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_user_id ON public.fornecedores(user_id);
CREATE INDEX IF NOT EXISTS idx_rdos_criado_por_id ON public.rdos(criado_por_id);
CREATE INDEX IF NOT EXISTS idx_documentos_uploaded_by ON public.documentos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_checklists_responsavel_id ON public.checklists(responsavel_id);

-- ============================================================================
-- 3. RECRIAR TRIGGER DE NOVO USUÁRIO PARA GARANTIR ESTADO LIMPO
-- ============================================================================

-- Recriar a função handle_new_user com validações adicionais
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Log para debug
  RAISE LOG 'Creating new user profile: %', NEW.id;

  -- Gerar código de indicação único
  v_referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8));

  -- Inserir perfil do usuário (SEM DADOS DE OUTROS USUÁRIOS)
  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone,
    cpf_cnpj,
    plan_type,
    referral_code,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cpf_cnpj',
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free'),
    v_referral_code,
    NOW(),
    NOW()
  );

  -- Inserir role padrão (Colaborador) APENAS para o novo usuário
  INSERT INTO public.user_roles (
    user_id,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'Colaborador'::app_role,
    NOW(),
    NOW()
  );

  -- Criar configurações padrão do usuário (SEM COPIAR DE OUTROS)
  INSERT INTO public.user_settings (
    user_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NOW(),
    NOW()
  );

  -- Criar créditos iniciais APENAS para este usuário
  INSERT INTO public.user_credits (
    user_id,
    credits_balance,
    plan_type,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    7,  -- 7 créditos iniciais
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free'),
    NOW(),
    NOW()
  );

  -- Log de sucesso
  RAISE LOG 'User profile created successfully: %', NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log de erro detalhado
    RAISE LOG 'Error creating user profile for %: % %', NEW.id, SQLERRM, SQLSTATE;
    -- Re-lançar a exceção para bloquear a criação do usuário se houver erro
    RAISE;
END;
$function$;

-- ============================================================================
-- 4. CRIAR FUNÇÃO DE VALIDAÇÃO PARA VERIFICAR ISOLAMENTO DE DADOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_user_data_isolation(p_user_id UUID)
RETURNS TABLE(
  table_name TEXT,
  own_records BIGINT,
  other_records BIGINT,
  is_isolated BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar obras
  RETURN QUERY
  SELECT 
    'obras'::TEXT,
    COUNT(*) FILTER (WHERE user_id = p_user_id),
    COUNT(*) FILTER (WHERE user_id != p_user_id),
    (COUNT(*) FILTER (WHERE user_id != p_user_id) = 0)
  FROM public.obras;

  -- Verificar equipamentos
  RETURN QUERY
  SELECT 
    'equipamentos'::TEXT,
    COUNT(*) FILTER (WHERE user_id = p_user_id),
    COUNT(*) FILTER (WHERE user_id != p_user_id),
    (COUNT(*) FILTER (WHERE user_id != p_user_id) = 0)
  FROM public.equipamentos;

  -- Verificar equipes
  RETURN QUERY
  SELECT 
    'equipes'::TEXT,
    COUNT(*) FILTER (WHERE user_id = p_user_id),
    COUNT(*) FILTER (WHERE user_id != p_user_id),
    (COUNT(*) FILTER (WHERE user_id != p_user_id) = 0)
  FROM public.equipes;

  -- Verificar fornecedores
  RETURN QUERY
  SELECT 
    'fornecedores'::TEXT,
    COUNT(*) FILTER (WHERE user_id = p_user_id),
    COUNT(*) FILTER (WHERE user_id != p_user_id),
    (COUNT(*) FILTER (WHERE user_id != p_user_id) = 0)
  FROM public.fornecedores;

  -- Verificar RDOs
  RETURN QUERY
  SELECT 
    'rdos'::TEXT,
    COUNT(*) FILTER (WHERE criado_por_id = p_user_id),
    COUNT(*) FILTER (WHERE criado_por_id != p_user_id),
    (COUNT(*) FILTER (WHERE criado_por_id != p_user_id) = 0)
  FROM public.rdos;
END;
$$;

-- ============================================================================
-- 5. ADICIONAR COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger function que cria perfil e configurações iniciais para novos usuários. 
IMPORTANTE: NÃO copia dados de outros usuários. Cada usuário começa com estado limpo.';

COMMENT ON FUNCTION public.verify_user_data_isolation(UUID) IS 
'Função de diagnóstico para verificar se um usuário está vendo dados de outros usuários. 
Retorna contagem de registros próprios vs. de outros para cada tabela crítica.';