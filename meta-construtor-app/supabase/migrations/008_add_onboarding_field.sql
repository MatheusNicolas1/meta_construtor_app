-- Migração 008: Adicionar campo onboarding_concluido
-- Adiciona controle para saber se o usuário já concluiu o onboarding

-- Adicionar campo onboarding_concluido na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_concluido BOOLEAN DEFAULT false NOT NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS profiles_onboarding_concluido_idx 
ON public.profiles(onboarding_concluido);

-- Comentário da migração
COMMENT ON COLUMN public.profiles.onboarding_concluido 
IS 'Controla se o usuário já concluiu o tutorial de onboarding interativo'; 