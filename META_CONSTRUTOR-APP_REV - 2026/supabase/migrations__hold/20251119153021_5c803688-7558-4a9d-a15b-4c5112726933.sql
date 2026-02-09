-- Atualizar valor padrão de créditos iniciais de 5 para 7
ALTER TABLE public.user_credits 
ALTER COLUMN credits_balance SET DEFAULT 7;

-- Atualizar função de consumo de crédito com nova mensagem
CREATE OR REPLACE FUNCTION public.consume_credit_for_rdo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se usuário tem créditos suficientes (apenas para plano free)
  IF EXISTS (
    SELECT 1 FROM public.user_credits 
    WHERE user_id = NEW.criado_por_id 
    AND plan_type = 'free' 
    AND credits_balance <= 0
  ) THEN
    RAISE EXCEPTION 'Créditos esgotados. Você atingiu o limite de RDOs gratuitos. Entre em contato para saber sobre os planos ilimitados.';
  END IF;
  
  -- Consumir 1 crédito se for plano free
  UPDATE public.user_credits
  SET credits_balance = GREATEST(credits_balance - 1, 0),
      updated_at = now()
  WHERE user_id = NEW.criado_por_id AND plan_type = 'free';
  
  RETURN NEW;
END;
$function$;

-- Atualizar função handle_new_user para criar com 7 créditos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- Criar créditos iniciais do usuário com 7 créditos
  INSERT INTO public.user_credits (
    user_id,
    credits_balance,
    plan_type,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    7,
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free'),
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$function$;