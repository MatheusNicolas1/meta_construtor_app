-- M6.1: Obra status enum + transition enforcement
-- State machine for obras with DB-level validation

-- Create obra_status enum
CREATE TYPE obra_status AS ENUM (
    'DRAFT',
    'ACTIVE',
    'ON_HOLD',
    'COMPLETED',
    'CANCELED'
);

-- Add status column to obras (if not exists)
ALTER TABLE obras 
ADD COLUMN IF NOT EXISTS status obra_status NOT NULL DEFAULT 'DRAFT';

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_obras_status ON obras(status);

-- Trigger function: enforce obra status transitions
CREATE OR REPLACE FUNCTION enforce_obras_status_transition()
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
            v_transition_valid := v_new_status IN ('ACTIVE', 'CANCELED');
        WHEN 'ACTIVE' THEN
            v_transition_valid := v_new_status IN ('ON_HOLD', 'COMPLETED', 'CANCELED');
        WHEN 'ON_HOLD' THEN
            v_transition_valid := v_new_status IN ('ACTIVE', 'CANCELED');
        WHEN 'COMPLETED' THEN
            v_transition_valid := FALSE; -- No transitions allowed from COMPLETED
        WHEN 'CANCELED' THEN
            v_transition_valid := FALSE; -- No transitions allowed from CANCELED
        ELSE
            v_transition_valid := FALSE;
    END CASE;
    
    -- Block invalid transition
    IF NOT v_transition_valid THEN
        RAISE EXCEPTION 'Invalid obra status transition: % -> % is not allowed', 
            v_old_status, v_new_status;
    END IF;
    
    -- Write audit log for status change
    INSERT INTO public.audit_logs (
        org_id,
        actor_user_id,
        action,
        entity,
        entity_id,
        metadata
    ) VALUES (
        NEW.org_id,
        auth.uid(),
        'domain.obra_status_changed',
        'obra',
        NEW.id,
        jsonb_build_object(
            'from', v_old_status,
            'to', v_new_status,
            'obra_nome', NEW.nome
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on obras for status transitions
DROP TRIGGER IF EXISTS trigger_enforce_obras_status_transition ON obras;
CREATE TRIGGER trigger_enforce_obras_status_transition
    BEFORE UPDATE OF status ON obras
    FOR EACH ROW
    EXECUTE FUNCTION enforce_obras_status_transition();

-- Grant EXECUTE
GRANT EXECUTE ON FUNCTION enforce_obras_status_transition() TO authenticated;

COMMENT ON TYPE obra_status IS 'State machine for obras: DRAFT -> ACTIVE -> ON_HOLD/COMPLETED/CANCELED';
COMMENT ON FUNCTION enforce_obras_status_transition IS 'Validates obra status transitions and logs to audit_logs';
