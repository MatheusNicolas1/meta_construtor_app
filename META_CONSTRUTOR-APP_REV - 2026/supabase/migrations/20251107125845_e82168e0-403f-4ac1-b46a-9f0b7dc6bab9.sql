-- Corrigir funções sem search_path definido (security fix)

-- 1. Função process_referral
CREATE OR REPLACE FUNCTION public.process_referral(
  new_user_id uuid,
  referral_code_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id uuid;
BEGIN
  -- Encontrar o usuário que fez a indicação
  SELECT id INTO referrer_user_id
  FROM profiles
  WHERE referral_code = referral_code_param;
  
  IF referrer_user_id IS NOT NULL AND referrer_user_id != new_user_id THEN
    -- Criar registro de indicação
    INSERT INTO referrals (referrer_id, new_user_id, bonus_granted, bonus_type)
    VALUES (referrer_user_id, new_user_id, true, 'trial_extension');
    
    -- Aplicar bônus (10 dias extras de trial)
    UPDATE profiles
    SET referral_bonus_days = referral_bonus_days + 10
    WHERE id = referrer_user_id;
  END IF;
END;
$$;

-- 2. Função update_follow_counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 3. Função update_profile_post_count
CREATE OR REPLACE FUNCTION public.update_profile_post_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 4. Função add_credit_for_share
CREATE OR REPLACE FUNCTION public.add_credit_for_share(
  p_user_id UUID,
  p_post_url TEXT,
  p_platform TEXT
)
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;