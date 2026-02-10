-- M6.3: RDO Status State Machine
-- 1. Create type
CREATE TYPE rdo_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
);

-- 2. Add column
ALTER TABLE rdos 
ADD COLUMN IF NOT EXISTS status rdo_status NOT NULL DEFAULT 'DRAFT';

-- 3. Create Index
CREATE INDEX IF NOT EXISTS idx_rdos_status ON rdos(status);

-- 4. Create trigger function
CREATE OR REPLACE FUNCTION enforce_rdo_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    v_old_status TEXT;
    v_new_status TEXT;
    v_transition_valid BOOLEAN := FALSE;
BEGIN
    v_old_status := OLD.status::TEXT;
    v_new_status := NEW.status::TEXT;

    -- If status hasn't changed, allow
    IF v_old_status = v_new_status THEN
        RETURN NEW;
    END IF;

    -- Define allowed transitions
    CASE v_old_status
        WHEN 'DRAFT' THEN
            -- DRAFT -> SUBMITTED
            v_transition_valid := v_new_status = 'SUBMITTED';
            
        WHEN 'SUBMITTED' THEN
            -- SUBMITTED -> APPROVED or REJECTED
            v_transition_valid := v_new_status IN ('APPROVED', 'REJECTED');
            
        WHEN 'REJECTED' THEN
            -- REJECTED -> SUBMITTED (Resubmission allow)
            v_transition_valid := v_new_status = 'SUBMITTED';
            
        WHEN 'APPROVED' THEN
            -- APPROVED is terminal
            v_transition_valid := FALSE;
            
        ELSE
            v_transition_valid := FALSE;
    END CASE;

    IF NOT v_transition_valid THEN
        RAISE EXCEPTION 'Invalid RDO status transition: % -> % is not allowed', v_old_status, v_new_status;
    END IF;

    -- Write audit log (using existing table, manual insert as we are inside trigger SECURITY DEFINER)
    -- Using the same pattern as M6.1
    INSERT INTO public.audit_logs (
        org_id,
        actor_user_id,
        action,
        entity,
        entity_id,
        metadata
    ) VALUES (
        NEW.org_id,
        auth.uid(), -- user executing the update
        'domain.rdo_status_changed',
        'rdo',
        NEW.id,
        jsonb_build_object(
            'from', v_old_status,
            'to', v_new_status,
            'obra_id', NEW.obra_id
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create Trigger
DROP TRIGGER IF EXISTS trigger_enforce_rdo_status_transition ON rdos;
CREATE TRIGGER trigger_enforce_rdo_status_transition
    BEFORE UPDATE OF status ON rdos
    FOR EACH ROW
    EXECUTE FUNCTION enforce_rdo_status_transition();
