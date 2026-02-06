-- ============================================================================
-- MILESTONE 3.1: Enable RLS on Main Tables
-- ============================================================================
-- Ativar RLS nas tabelas principais do domínio.
-- ============================================================================

-- Tabela OBRAS
ALTER TABLE IF EXISTS public.obras ENABLE ROW LEVEL SECURITY;

-- Tabela RDOS
ALTER TABLE IF EXISTS public.rdos ENABLE ROW LEVEL SECURITY;

-- Tabela ATIVIDADES
ALTER TABLE IF EXISTS public.atividades ENABLE ROW LEVEL SECURITY;

-- Tabela EXPENSES
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;

-- Tabela PROFILES (Usually enabled by default in Supabase starter, but ensuring)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Tabela USER_SETTINGS
ALTER TABLE IF EXISTS public.user_settings ENABLE ROW LEVEL SECURITY;

-- Tabela USER_CREDITS
ALTER TABLE IF EXISTS public.user_credits ENABLE ROW LEVEL SECURITY;

-- Tabela CHECKLISTS (If exists - referenced in frontend code, might be embedded or named differently)
-- Intentionally skipped if unsure of name to avoid migration error.
-- Assuming checklsits might be JSONB inside tasks or separate table.
-- If 'checklists' table exists, enable it.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checklists') THEN
    ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
