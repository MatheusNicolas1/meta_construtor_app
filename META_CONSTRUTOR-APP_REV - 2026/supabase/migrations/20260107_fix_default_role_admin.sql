-- ============================================================================
-- Correção: Alterar role padrão de novos usuários para Administrador
-- ============================================================================
-- O dono da conta (quem cria a conta) deve ser Administrador
-- Usuários convidados serão Gerente ou Colaborador (definido pelo admin)
-- ============================================================================

-- Recriar função handle_new_user com role padrão = Administrador
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

  -- Inserir role padrão (Administrador) para o novo usuário
  -- O dono da conta é sempre Administrador
  INSERT INTO public.user_roles (
    user_id,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'Administrador'::app_role,  -- ALTERADO DE 'Colaborador' PARA 'Administrador'
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

-- Adicionar comentário para documentação
COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger function que cria perfil e configurações iniciais para novos usuários. 
O dono da conta é criado como Administrador. Usuários convidados posteriormente 
terão roles de Gerente ou Colaborador definidos pelo administrador da conta.';
