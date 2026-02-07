-- Adicionar campo has_seen_onboarding na tabela profiles para controlar o tour
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT FALSE;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_has_seen_onboarding ON public.profiles(has_seen_onboarding);

COMMENT ON COLUMN public.profiles.has_seen_onboarding IS 'Flag que indica se o usuário já viu o tour de onboarding';
;
