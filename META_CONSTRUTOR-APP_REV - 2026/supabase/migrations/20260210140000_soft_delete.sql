-- M8.3: Soft Delete for Obras and Expenses
-- Add deleted_at and deleted_by columns
-- Update RLS and Audit Triggers

-- 1. Obras Table
ALTER TABLE public.obras 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_obras_deleted_at ON public.obras (deleted_at) WHERE deleted_at IS NULL;

-- 2. Expenses Table (Despesas)
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_deleted_at ON public.expenses (deleted_at) WHERE deleted_at IS NULL;

-- 3. RLS Check (Ensure policies filter out deleted items by default)
-- Note: Existing policies usually rely on org_id. We should update them or add a broad check?
-- Better to UPDATE existing policies or ADD a new one?
-- Adding "AND deleted_at IS NULL" to existing policies is best, but modifying policies is tedious in SQL (DROP/CREATE).
-- Alternatively, create a View or just enforce it in app?
-- PRD says: "Ajustar policies SELECT para não retornar deletados por padrão"

-- Let's DROP and RECREATE the default read policies for Obras and Expenses.
-- Checking existing policies... (Blindly recreating common ones)

DROP POLICY IF EXISTS "Users can view obras in their org" ON public.obras;
CREATE POLICY "Users can view obras in their org" ON public.obras
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM org_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Users can view expenses in their org" ON public.expenses;
CREATE POLICY "Users can view expenses in their org" ON public.expenses
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM org_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
        AND deleted_at IS NULL
    );

-- 4. Audit Triggers for Soft Delete
CREATE OR REPLACE FUNCTION audit_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Detect Soft Delete (update where deleted_at goes from NULL to NOT NULL)
    IF (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL) THEN
        INSERT INTO public.audit_logs (
            org_id,
            actor_user_id,
            action,
            entity,
            entity_id,
            metadata
        ) VALUES (
            OLD.org_id,
            coalesce(NEW.deleted_by, auth.uid()), -- Use deleted_by found in record row, or current auth
            'domain.' || TG_TABLE_NAME || '_soft_deleted', -- e.g. domain.obras_soft_deleted
            TG_TABLE_NAME,
            OLD.id,
            jsonb_build_object(
                'before', row_to_json(OLD),
                'deleted_at', NEW.deleted_at
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Obras
DROP TRIGGER IF EXISTS trg_audit_soft_delete_obras ON public.obras;
CREATE TRIGGER trg_audit_soft_delete_obras
    AFTER UPDATE ON public.obras
    FOR EACH ROW
    EXECUTE FUNCTION audit_soft_delete();

-- Trigger for Expenses
DROP TRIGGER IF EXISTS trg_audit_soft_delete_expenses ON public.expenses;
CREATE TRIGGER trg_audit_soft_delete_expenses
    AFTER UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION audit_soft_delete();
