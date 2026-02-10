-- M6.4: Quality Checklist State Machine
-- New tables and state logic

-- 1. Create Tables if not exist
CREATE TABLE IF NOT EXISTS public.quality_checklists (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id uuid NOT NULL REFERENCES public.orgs(id),
    obra_id uuid NOT NULL REFERENCES public.obras(id),
    title text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE quality_item_status AS ENUM (
    'PENDING',
    'PASSED',
    'FAILED',
    'REWORK_REQUESTED',
    'REWORK_DONE'
);

CREATE TABLE IF NOT EXISTS public.quality_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    checklist_id uuid NOT NULL REFERENCES public.quality_checklists(id) ON DELETE CASCADE,
    title text NOT NULL,
    status quality_item_status NOT NULL DEFAULT 'PENDING',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_quality_checklists_obra ON quality_checklists(obra_id);
CREATE INDEX IF NOT EXISTS idx_quality_items_checklist ON quality_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_quality_items_status ON quality_items(status);

-- 2. Trigger Function
CREATE OR REPLACE FUNCTION enforce_quality_item_transition()
RETURNS TRIGGER AS $$
DECLARE
    v_old_status TEXT;
    v_new_status TEXT;
    v_valid BOOLEAN := FALSE;
BEGIN
    v_old_status := OLD.status::TEXT;
    v_new_status := NEW.status::TEXT;

    IF v_old_status = v_new_status THEN
        RETURN NEW;
    END IF;

    -- Transitions
    -- PENDING -> PASSED | FAILED | REWORK_REQUESTED
    -- FAILED -> REWORK_REQUESTED
    -- REWORK_REQUESTED -> REWORK_DONE
    -- REWORK_DONE -> PASSED (allowed as cycle completion) or Terminal? Spec said "REWORK_DONE terminal (or allow -> PASSED)". I will allow PASSED to close loop.

    CASE v_old_status
        WHEN 'PENDING' THEN
            v_valid := v_new_status IN ('PASSED', 'FAILED', 'REWORK_REQUESTED');
        WHEN 'FAILED' THEN
            v_valid := v_new_status = 'REWORK_REQUESTED';
        WHEN 'REWORK_REQUESTED' THEN
            v_valid := v_new_status = 'REWORK_DONE';
        WHEN 'REWORK_DONE' THEN
            v_valid := v_new_status = 'PASSED';
        WHEN 'PASSED' THEN
            v_valid := FALSE; -- Terminal
        ELSE
            v_valid := FALSE;
    END CASE;

    IF NOT v_valid THEN
        RAISE EXCEPTION 'Invalid Quality Item status transition: % -> %', v_old_status, v_new_status;
    END IF;

    -- Audit Log
    -- Need to look up org_id from parent checklist? Or assume context?
    -- Creating a more complex query here inside trigger.
    INSERT INTO public.audit_logs (
        org_id,
        actor_user_id,
        action,
        entity,
        entity_id,
        metadata
    ) 
    SELECT 
        c.org_id,
        auth.uid(),
        'domain.quality_item_status_changed',
        'quality_item',
        NEW.id,
        jsonb_build_object(
            'from', v_old_status,
            'to', v_new_status,
            'checklist_id', NEW.checklist_id,
            'title', NEW.title
        )
    FROM public.quality_checklists c
    WHERE c.id = NEW.checklist_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger
DROP TRIGGER IF EXISTS trigger_enforce_quality_item_transition ON quality_items;
CREATE TRIGGER trigger_enforce_quality_item_transition
    BEFORE UPDATE OF status ON quality_items
    FOR EACH ROW
    EXECUTE FUNCTION enforce_quality_item_transition();
