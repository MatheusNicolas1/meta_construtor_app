-- ============================================================================
-- MILESTONE 1.3: Padronizar org_id no domínio
-- ============================================================================
-- Adicionar coluna org_id em todas as tabelas principais do domínio
-- Vincular dados existentes a uma organização (backfill)
-- ============================================================================

-- 1. Tabela OBRAS (Central)
ALTER TABLE public.obras 
ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id);

CREATE INDEX IF NOT EXISTS idx_obras_org_id ON public.obras(org_id);

-- Backfill Obras: Vincular à organização pessoal do dono (user_id)
UPDATE public.obras o
SET org_id = orgs.id
FROM public.orgs
WHERE o.user_id = orgs.owner_user_id
AND o.org_id IS NULL;

-- 2. Tabela RDOS
ALTER TABLE public.rdos 
ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id);

CREATE INDEX IF NOT EXISTS idx_rdos_org_id ON public.rdos(org_id);

-- Backfill RDOs: Tentar vincular pela Obra
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rdos' AND column_name = 'obra_id') THEN
    UPDATE public.rdos r
    SET org_id = o.org_id
    FROM public.obras o
    WHERE r.obra_id = o.id
    AND r.org_id IS NULL
    AND o.org_id IS NOT NULL;
  END IF;
END $$;

-- Backfill RDOs Fallback: Vincular pelo criador (criado_por_id ou user_id) se ainda nulo
DO $$
BEGIN
  -- Se tiver criado_por_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rdos' AND column_name = 'criado_por_id') THEN
    UPDATE public.rdos r
    SET org_id = orgs.id
    FROM public.orgs
    WHERE r.criado_por_id = orgs.owner_user_id
    AND r.org_id IS NULL;
  -- Se tiver user_id
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rdos' AND column_name = 'user_id') THEN
    UPDATE public.rdos r
    SET org_id = orgs.id
    FROM public.orgs
    WHERE r.user_id = orgs.owner_user_id
    AND r.org_id IS NULL;
  END IF;
END $$;

-- 3. Tabela ATIVIDADES
ALTER TABLE public.atividades 
ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id);

CREATE INDEX IF NOT EXISTS idx_atividades_org_id ON public.atividades(org_id);

-- Backfill Atividades: Pela Obra ou Responsável
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'atividades' AND column_name = 'obra_id') THEN
    UPDATE public.atividades a
    SET org_id = o.org_id
    FROM public.obras o
    WHERE a.obra_id = o.id
    AND a.org_id IS NULL;
  END IF;

  -- Fallback pelo user_id/responsavel
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'atividades' AND column_name = 'user_id') THEN
     UPDATE public.atividades a
     SET org_id = orgs.id
     FROM public.orgs
     WHERE a.user_id = orgs.owner_user_id
     AND a.org_id IS NULL;
  END IF;
END $$;

-- 4. Tabela EXPENSES (Despesas)
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id);

CREATE INDEX IF NOT EXISTS idx_expenses_org_id ON public.expenses(org_id);

-- Backfill Expenses
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'obra_id') THEN
    UPDATE public.expenses e
    SET org_id = o.org_id
    FROM public.obras o
    WHERE e.obra_id = o.id
    AND e.org_id IS NULL;
  END IF;
  
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'user_id') THEN
     UPDATE public.expenses e
     SET org_id = orgs.id
     FROM public.orgs
     WHERE e.user_id = orgs.owner_user_id
     AND e.org_id IS NULL;
  END IF;
END $$;

-- 5. Finalização: Enforce NOT NULL apenas em Obras por enquanto (segurança)
DO $$
BEGIN
  -- Se não houver obras sem org_id, aplica NOT NULL
  IF NOT EXISTS (SELECT 1 FROM public.obras WHERE org_id IS NULL) THEN
    ALTER TABLE public.obras ALTER COLUMN org_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'Aviso: Algumas obras permanecem sem org_id. Backfill incompleto? Verifique os dados.';
  END IF;
END $$;

-- Comentários
COMMENT ON COLUMN public.obras.org_id IS 'Organização proprietária da obra.';
COMMENT ON COLUMN public.rdos.org_id IS 'Organização proprietária do RDO.';
