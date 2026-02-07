-- Função para criar perfil e role quando um novo usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir perfil do usuário
  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone,
    cpf_cnpj,
    plan_type,
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
    NOW(),
    NOW()
  );

  -- Inserir role padrão (Colaborador) para o novo usuário
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

  -- Criar configurações padrão do usuário
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

  -- Criar créditos iniciais do usuário
  INSERT INTO public.user_credits (
    user_id,
    credits_balance,
    plan_type,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    5,
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free'),
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger para executar a função quando um novo usuário for criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();;
