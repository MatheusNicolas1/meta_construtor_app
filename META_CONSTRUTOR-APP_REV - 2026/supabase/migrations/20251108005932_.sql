-- Adicionar campos necessários na tabela profiles se não existirem
DO $$ 
BEGIN
  -- Adicionar campo cpf_cnpj se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cpf_cnpj') THEN
    ALTER TABLE public.profiles ADD COLUMN cpf_cnpj TEXT;
  END IF;
  
  -- Adicionar campo plan_type se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'plan_type') THEN
    ALTER TABLE public.profiles ADD COLUMN plan_type TEXT NOT NULL DEFAULT 'free';
  END IF;
END $$;

-- Criar constraints UNIQUE para prevenir duplicidade
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_cpf_cnpj_key;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_cpf_cnpj_key UNIQUE (cpf_cnpj);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_key UNIQUE (phone);

-- Atualizar função handle_new_user para incluir novos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, cpf_cnpj, plan_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cpf_cnpj',
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free')
  );
  
  -- Adicionar role padrão de Colaborador para novos usuários
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'Colaborador');
  
  -- Criar créditos iniciais para usuários free
  IF COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free') = 'free' THEN
    INSERT INTO public.user_credits (user_id, credits_balance, plan_type)
    VALUES (NEW.id, 5, 'free')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;;
