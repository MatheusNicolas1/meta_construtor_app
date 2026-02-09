-- M5.3: DB triggers to audit org_members changes
-- Automatically log INSERT/DELETE on org_members for compliance

-- Trigger function: audit org_members INSERT
CREATE OR REPLACE FUNCTION audit_org_member_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert audit log via service_role (SECURITY DEFINER bypasses RLS)
    INSERT INTO public.audit_logs (
        org_id,
        actor_user_id,
        action,
        entity,
        entity_id,
        metadata
    ) VALUES (
        NEW.org_id,
        auth.uid(), -- current user performing INSERT (might be NULL for system)
        'membership.member_added',
        'org_member',
        NEW.id,
        jsonb_build_object(
            'user_id', NEW.user_id,
            'role', NEW.role,
            'status', NEW.status
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: audit org_members DELETE
CREATE OR REPLACE FUNCTION audit_org_member_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert audit log for deletion
    INSERT INTO public.audit_logs (
        org_id,
        actor_user_id,
        action,
        entity,
        entity_id,
        metadata
    ) VALUES (
        OLD.org_id,
        auth.uid(), -- current user performing DELETE (might be NULL for system)
        'membership.member_removed',
        'org_member',
        OLD.id,
        jsonb_build_object(
            'user_id', OLD.user_id,
            'role', OLD.role,
            'status', OLD.status
        )
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers on org_members
DROP TRIGGER IF EXISTS trigger_audit_org_member_insert ON org_members;
CREATE TRIGGER trigger_audit_org_member_insert
    AFTER INSERT ON org_members
    FOR EACH ROW
    EXECUTE FUNCTION audit_org_member_insert();

DROP TRIGGER IF EXISTS trigger_audit_org_member_delete ON org_members;
CREATE TRIGGER trigger_audit_org_member_delete
    AFTER DELETE ON org_members
    FOR EACH ROW
    EXECUTE FUNCTION audit_org_member_delete();

-- Grant EXECUTE to authenticated (trigger will run as SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION audit_org_member_insert() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_org_member_delete() TO authenticated;
