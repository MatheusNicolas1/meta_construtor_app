-- ============================================================================
-- FIX: Add missing columns to profiles table
-- ============================================================================
-- The handle_new_user trigger tries to insert cpf_cnpj, plan_type, referral_code
-- but these columns don't exist in the current profiles schema
-- ============================================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Create index on referral_code for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

COMMENT ON COLUMN public.profiles.cpf_cnpj IS 'Brazilian tax ID (CPF for individuals, CNPJ for companies)';
COMMENT ON COLUMN public.profiles.plan_type IS 'User subscription plan: free, pro, enterprise';
COMMENT ON COLUMN public.profiles.referral_code IS 'Unique referral code for this user';
