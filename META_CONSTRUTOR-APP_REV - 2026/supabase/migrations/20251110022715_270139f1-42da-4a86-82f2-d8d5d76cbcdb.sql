-- Criar função para criar usuário padrão se não existir
CREATE OR REPLACE FUNCTION create_default_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_exists boolean;
  new_user_id uuid;
BEGIN
  -- Verificar se o usuário já existe
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'matheusnicolas.org@gmail.com'
  ) INTO user_exists;
  
  -- Se não existir, não faz nada (usuário será criado via interface de signup)
  -- Esta função é apenas para garantir que o perfil seja criado corretamente
  
  -- Nota: A criação do usuário deve ser feita via Supabase Auth API
  -- Esta função apenas garante a estrutura de suporte
END;
$$;

-- Garantir que todos os novos usuários com plano free iniciem com créditos
-- Esta lógica já está no trigger handle_new_user, mas vamos garantir

-- Adicionar welcome message para novos usuários
CREATE TABLE IF NOT EXISTS public.welcome_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT 'Bem-vindo ao MetaConstrutor! Comece criando sua primeira obra ou explorando as funcionalidades no menu lateral.',
  shown BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.welcome_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver sua própria mensagem de boas-vindas"
ON public.welcome_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar mensagens de boas-vindas"
ON public.welcome_messages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar sua mensagem"
ON public.welcome_messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Atualizar trigger para criar mensagem de boas-vindas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'Colaborador');
  
  IF COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free') = 'free' THEN
    INSERT INTO public.user_credits (user_id, credits_balance, plan_type)
    VALUES (NEW.id, 5, 'free')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Criar mensagem de boas-vindas
  INSERT INTO public.welcome_messages (user_id, message)
  VALUES (NEW.id, 'Bem-vindo ao MetaConstrutor! Comece criando sua primeira obra ou explorando as funcionalidades no menu lateral.')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;