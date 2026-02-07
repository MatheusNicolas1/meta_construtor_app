-- Criar tabela de créditos de usuário
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium', 'business')),
  credits_balance INTEGER NOT NULL DEFAULT 5,
  total_shared INTEGER NOT NULL DEFAULT 0,
  last_shared_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Policy: usuários podem ver apenas seus próprios créditos
CREATE POLICY "Users can view their own credits"
  ON public.user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: usuários podem atualizar apenas seus próprios créditos
CREATE POLICY "Users can update their own credits"
  ON public.user_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para consumir crédito ao criar RDO
CREATE OR REPLACE FUNCTION public.consume_credit_for_rdo()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se usuário tem créditos suficientes (apenas para plano free)
  IF EXISTS (
    SELECT 1 FROM public.user_credits 
    WHERE user_id = NEW.user_id 
    AND plan_type = 'free' 
    AND credits_balance <= 0
  ) THEN
    RAISE EXCEPTION 'Créditos insuficientes. Compartilhe nas redes sociais para ganhar mais créditos!';
  END IF;
  
  -- Consumir 1 crédito se for plano free
  UPDATE public.user_credits
  SET credits_balance = GREATEST(credits_balance - 1, 0),
      updated_at = now()
  WHERE user_id = NEW.user_id AND plan_type = 'free';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para consumir crédito ao criar RDO
CREATE TRIGGER consume_credit_on_rdo_creation
  BEFORE INSERT ON public.rdos
  FOR EACH ROW
  EXECUTE FUNCTION public.consume_credit_for_rdo();

-- Função para adicionar crédito por compartilhamento
CREATE OR REPLACE FUNCTION public.add_credit_for_share(
  p_user_id UUID,
  p_post_url TEXT,
  p_platform TEXT
)
RETURNS JSON AS $$
DECLARE
  v_credits_balance INTEGER;
  v_plan_type TEXT;
BEGIN
  -- Buscar informações do usuário
  SELECT credits_balance, plan_type 
  INTO v_credits_balance, v_plan_type
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- Se não existir registro, criar com valores padrão
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, credits_balance, plan_type)
    VALUES (p_user_id, 5, 'free')
    RETURNING credits_balance, plan_type INTO v_credits_balance, v_plan_type;
  END IF;
  
  -- Apenas adicionar crédito se for plano free
  IF v_plan_type = 'free' THEN
    UPDATE public.user_credits
    SET credits_balance = credits_balance + 1,
        total_shared = total_shared + 1,
        last_shared_at = now(),
        updated_at = now()
    WHERE user_id = p_user_id;
    
    v_credits_balance := v_credits_balance + 1;
  END IF;
  
  -- Registrar compartilhamento
  INSERT INTO public.social_shares (user_id, post_url, platform, created_at)
  VALUES (p_user_id, p_post_url, p_platform, now());
  
  RETURN json_build_object(
    'success', true,
    'credits_balance', v_credits_balance,
    'plan_type', v_plan_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Tabela para registrar compartilhamentos
CREATE TABLE IF NOT EXISTS public.social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin')),
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  rdo_id UUID REFERENCES public.rdos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;

-- Policy: usuários podem ver apenas seus compartilhamentos
CREATE POLICY "Users can view their own shares"
  ON public.social_shares
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: usuários podem inserir seus compartilhamentos
CREATE POLICY "Users can insert their own shares"
  ON public.social_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Adicionar créditos iniciais para usuários existentes
INSERT INTO public.user_credits (user_id, plan_type, credits_balance)
SELECT id, 'free', 5
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;;
