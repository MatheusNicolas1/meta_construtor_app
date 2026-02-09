-- M5.5: DB triggers for critical domain mutations
-- Ensure audit happens even if PostgREST bypasses edge functions

-- Helper function: write audit via SECURITY DEFINER (bypasses RLS) 
CREATE OR REPLACE FUNCTION write_audit_from_trigger(
    p_org_id UUID,
    p_action TEXT,
    p_entity TEXT,
    p_entity_id UUID,
    p_metadata JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (
        org_id,
        actor_user_id,
        action,
        entity,
        entity_id,
        metadata
    ) VALUES (
        p_org_id,
        auth.uid(), -- current user (might be NULL for system triggers)
        p_action,
        p_entity,
        p_entity_id,
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: audit obras INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION audit_obras_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        PERFORM write_audit_from_trigger(
            NEW.org_id,
            'domain.obra_created',
            'obra',
            NEW.id,
            jsonb_build_object('nome', NEW.nome, 'status', NEW.status)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        PERFORM write_audit_from_trigger(
            NEW.org_id,
            'domain.obra_updated',
            'obra',
            NEW.id,
            jsonb_build_object(
                'nome', NEW.nome,
                'status', NEW.status,
                'changed_fields', jsonb_build_object(
                    'nome_changed', OLD.nome <> NEW.nome,
                    'status_changed', OLD.status <> NEW.status
                )
            )
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM write_audit_from_trigger(
            OLD.org_id,
            'domain.obra_deleted',
            'obra',
            OLD.id,
            jsonb_build_object('nome', OLD.nome, 'status', OLD.status)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function: audit expenses INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION audit_expenses_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        PERFORM write_audit_from_trigger(
            NEW.org_id,
            'domain.expense_created',
            'expense',
            NEW.id,
            jsonb_build_object('description', NEW.description, 'amount', NEW.amount)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        PERFORM write_audit_from_trigger(
            NEW.org_id,
            'domain.expense_updated',
            'expense',
            NEW.id,
            jsonb_build_object(
                'description', NEW.description,
                'amount', NEW.amount,
                'changed', jsonb_build_object(
                    'amount_changed', OLD.amount <> NEW.amount
                )
            )
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM write_audit_from_trigger(
            OLD.org_id,
            'domain.expense_deleted',
            'expense',
            OLD.id,
            jsonb_build_object('description', OLD.description, 'amount', OLD.amount)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on obras
DROP TRIGGER IF EXISTS trigger_audit_obras_changes ON obras;
CREATE TRIGGER trigger_audit_obras_changes
    AFTER INSERT OR UPDATE OR DELETE ON obras
    FOR EACH ROW
    EXECUTE FUNCTION audit_obras_changes();

-- Create triggers on expenses
DROP TRIGGER IF EXISTS trigger_audit_expenses_changes ON expenses;
CREATE TRIGGER trigger_audit_expenses_changes
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION audit_expenses_changes();

-- Grant EXECUTE to authenticated (triggers run as SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION audit_obras_changes() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_expenses_changes() TO authenticated;
GRANT EXECUTE ON FUNCTION write_audit_from_trigger(UUID, TEXT, TEXT, UUID, JSONB) TO authenticated;

COMMENT ON FUNCTION audit_obras_changes IS 'Automatically audit all obras INSERT/UPDATE/DELETE operations';
COMMENT ON FUNCTION audit_expenses_changes IS 'Automatically audit all expenses INSERT/UPDATE/DELETE operations';
