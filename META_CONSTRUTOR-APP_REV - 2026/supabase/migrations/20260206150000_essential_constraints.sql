-- ============================================================================
-- MILESTONE 1.4: Constraints e Índices Essenciais
-- ============================================================================
-- Reforçar integridade de dados para multi-tenancy
-- 1. Constraints UNIQUE compostas (org_id + slug)
-- 2. Enforce NOT NULL em org_id (domínio compartilhado)
-- 3. índices de performance
-- ============================================================================

-- A) OBRAS: Ajustar constraint de slug para ser único per-org, não global
DO $$
BEGIN
  -- Tentar descobrir e remover constraint unique global do slug se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'obras_slug_key' 
    OR conname = 'obras_slug_unique'
  ) THEN
    ALTER TABLE public.obras DROP CONSTRAINT IF EXISTS obras_slug_key;
    ALTER TABLE public.obras DROP CONSTRAINT IF EXISTS obras_slug_unique;
  END IF;

  -- Adicionar constraint composta (org_id, slug)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'obras_org_id_slug_key'
  ) THEN
    ALTER TABLE public.obras ADD CONSTRAINT obras_org_id_slug_key UNIQUE (org_id, slug);
  END IF;
END $$;

-- B) DOMÍNIO: Reforçar NOT NULL em org_id
-- Antes, garantir backfill para casos remanescentes

-- 1. RDOs
DO $$
BEGIN
  -- Backfill de segurança novamente
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rdos' AND column_name = 'obra_id') THEN
    UPDATE public.rdos r SET org_id = o.org_id
    FROM public.obras o WHERE r.obra_id = o.id AND r.org_id IS NULL;
  END IF;

  -- Aplicar NOT NULL se não houver registros violando
  IF NOT EXISTS (SELECT 1 FROM public.rdos WHERE org_id IS NULL) THEN
    ALTER TABLE public.rdos ALTER COLUMN org_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'Skipping NOT NULL on rdos.org_id: records with NULL org_id found.';
  END IF;

  -- Index em obra_id se existir e não tiver index
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rdos' AND column_name = 'obra_id') THEN
    CREATE INDEX IF NOT EXISTS idx_rdos_obra_id ON public.rdos(obra_id);
    
    -- Adicionar FK se não existir
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'rdos_obra_id_fkey'
    ) THEN
        ALTER TABLE public.rdos ADD CONSTRAINT rdos_obra_id_fkey 
        FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE RESTRICT;
    END IF;
  END IF;
END $$;

-- 2. ATIVIDADES
DO $$
BEGIN
  -- Backfill de segurança
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'atividades' AND column_name = 'obra_id') THEN
    UPDATE public.atividades a SET org_id = o.org_id
    FROM public.obras o WHERE a.obra_id = o.id AND a.org_id IS NULL;
  END IF;

  -- Aplicar NOT NULL
  IF NOT EXISTS (SELECT 1 FROM public.atividades WHERE org_id IS NULL) THEN
    ALTER TABLE public.atividades ALTER COLUMN org_id SET NOT NULL;
  ELSE
     RAISE NOTICE 'Skipping NOT NULL on atividades.org_id: records with NULL org_id found.';
  END IF;

  -- Index e FK em obra_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'atividades' AND column_name = 'obra_id') THEN
    CREATE INDEX IF NOT EXISTS idx_atividades_obra_id ON public.atividades(obra_id);
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'atividades_obra_id_fkey'
    ) THEN
        ALTER TABLE public.atividades ADD CONSTRAINT atividades_obra_id_fkey 
        FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE RESTRICT;
    END IF;
  END IF;
END $$;

-- 3. EXPENSES
DO $$
BEGIN
  -- Backfill de segurança
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'obra_id') THEN
    UPDATE public.expenses e SET org_id = o.org_id
    FROM public.obras o WHERE e.obra_id = o.id AND e.org_id IS NULL;
  END IF;

  -- Aplicar NOT NULL
  IF NOT EXISTS (SELECT 1 FROM public.expenses WHERE org_id IS NULL) THEN
    ALTER TABLE public.expenses ALTER COLUMN org_id SET NOT NULL;
  ELSE
     RAISE NOTICE 'Skipping NOT NULL on expenses.org_id: records with NULL org_id found.';
  END IF;

  -- Index e FK em obra_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'obra_id') THEN
    CREATE INDEX IF NOT EXISTS idx_expenses_obra_id ON public.expenses(obra_id);
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'expenses_obra_id_fkey'
    ) THEN
        ALTER TABLE public.expenses ADD CONSTRAINT expenses_obra_id_fkey 
        FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE RESTRICT;
    END IF;
  END IF;
END $$;
