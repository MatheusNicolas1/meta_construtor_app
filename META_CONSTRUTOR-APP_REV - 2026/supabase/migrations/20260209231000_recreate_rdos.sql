-- M6.3 Fix: FORCE Recreate rdos table (Nuclear Option)
-- DROP CASCADE to remove all corrupted dependencies/triggers/views

BEGIN;

-- 1. Drop old table CASCADE
DROP TABLE IF EXISTS public.rdos CASCADE;

-- 2. Create correct table
CREATE TABLE public.rdos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid NOT NULL REFERENCES public.orgs(id),
    obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    data timestamptz NOT NULL DEFAULT now(),
    periodo text,
    clima text,
    equipe_ociosa text,
    status rdo_status NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indices
CREATE INDEX idx_rdos_org ON public.rdos(org_id);
CREATE INDEX idx_rdos_obra ON public.rdos(obra_id);
CREATE INDEX idx_rdos_status ON public.rdos(status);
CREATE INDEX idx_rdos_data ON public.rdos(data);

-- 4. Enable RLS and Add Basic Policy
ALTER TABLE public.rdos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for authenticated" ON public.rdos;
CREATE POLICY "Enable all for authenticated" ON public.rdos 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 5. Apply Triggers
-- State Machine (M6.3)
DROP TRIGGER IF EXISTS trigger_enforce_rdo_status_transition ON public.rdos;
CREATE TRIGGER trigger_enforce_rdo_status_transition
    BEFORE UPDATE OF status ON public.rdos
    FOR EACH ROW
    EXECUTE FUNCTION enforce_rdo_status_transition();

-- Updated At
CREATE TRIGGER update_rdos_updated_at
    BEFORE UPDATE ON public.rdos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
