-- Sistema de Indicações (Referrals)
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  new_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  bonus_granted boolean NOT NULL DEFAULT false,
  bonus_type text,
  UNIQUE(new_user_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas indicações"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid() OR new_user_id = auth.uid());

CREATE POLICY "Sistema pode criar indicações"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

-- Adicionar campos ao profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS hide_signature boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS referral_bonus_days integer NOT NULL DEFAULT 0;

-- Gerar código de referência único para cada usuário
UPDATE public.profiles 
SET referral_code = LOWER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Adicionar campos às obras para perfil público
ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Gerar slug único para obras existentes
UPDATE public.obras
SET slug = LOWER(REPLACE(REPLACE(nome, ' ', '-'), '/', '-')) || '-' || SUBSTRING(id::text FROM 1 FOR 8)
WHERE slug IS NULL;

-- Sistema de Conquistas (Achievements)
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  icon_url text,
  achievement_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver conquistas"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Sistema pode criar conquistas"
  ON public.achievements FOR INSERT
  WITH CHECK (true);

-- Comunidade Técnica
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts são visíveis para todos usuários autenticados"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem criar posts"
  ON public.posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus posts"
  ON public.posts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar seus posts"
  ON public.posts FOR DELETE
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentários são visíveis para todos"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem criar comentários"
  ON public.comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem deletar seus comentários"
  ON public.comments FOR DELETE
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes são visíveis para todos"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem dar like"
  ON public.likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem remover like"
  ON public.likes FOR DELETE
  USING (user_id = auth.uid());

-- Função para atualizar contadores de posts
CREATE OR REPLACE FUNCTION public.update_post_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counters();

CREATE TRIGGER update_likes_count
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_counters();

-- Trigger para atualizar updated_at em posts
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para processar indicações no signup
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

-- Função para verificar e conceder conquistas
CREATE OR REPLACE FUNCTION public.check_and_grant_achievements(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  obras_count integer;
  obras_concluidas integer;
BEGIN
  -- Contar obras do usuário
  SELECT COUNT(*) INTO obras_count
  FROM obras
  WHERE user_id = user_id_param;
  
  SELECT COUNT(*) INTO obras_concluidas
  FROM obras
  WHERE user_id = user_id_param AND status = 'Concluída';
  
  -- Gestor Ouro (10 obras concluídas)
  IF obras_concluidas >= 10 AND NOT EXISTS (
    SELECT 1 FROM achievements 
    WHERE user_id = user_id_param AND achievement_type = 'gestor_ouro'
  ) THEN
    INSERT INTO achievements (user_id, title, description, achievement_type)
    VALUES (user_id_param, 'Gestor Ouro', 'Concluiu 10 obras com sucesso', 'gestor_ouro');
  END IF;
  
  -- Primeira Obra
  IF obras_count >= 1 AND NOT EXISTS (
    SELECT 1 FROM achievements 
    WHERE user_id = user_id_param AND achievement_type = 'primeira_obra'
  ) THEN
    INSERT INTO achievements (user_id, title, description, achievement_type)
    VALUES (user_id_param, 'Primeira Obra', 'Cadastrou sua primeira obra', 'primeira_obra');
  END IF;
  
  -- Especialista (5 obras concluídas)
  IF obras_concluidas >= 5 AND NOT EXISTS (
    SELECT 1 FROM achievements 
    WHERE user_id = user_id_param AND achievement_type = 'especialista'
  ) THEN
    INSERT INTO achievements (user_id, title, description, achievement_type)
    VALUES (user_id_param, 'Especialista', 'Concluiu 5 obras com eficiência', 'especialista');
  END IF;
END;
$$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_new_user ON referrals(new_user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_obras_slug ON obras(slug);
CREATE INDEX IF NOT EXISTS idx_obras_public ON obras(is_public) WHERE is_public = true;;
