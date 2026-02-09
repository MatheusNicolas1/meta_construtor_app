-- M5.4: Query audit logs function (admin-only access)
-- Safe RLS-compliant function to query audit logs for an org

CREATE OR REPLACE FUNCTION get_audit_logs(
    p_org_id UUID,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0,
    p_action_filter TEXT DEFAULT NULL,
    p_entity_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMPTZ,
    actor_user_id UUID,
    action TEXT,
    entity TEXT,
    entity_id UUID,
    metadata JSONB,
    request_id UUID
) AS $$
BEGIN
    -- Check if current user is an admin of the org
    IF NOT EXISTS (
        SELECT 1 FROM public.org_members om
        WHERE om.org_id = p_org_id
          AND om.user_id = auth.uid()
          AND om.role IN ('Administrador', 'Proprietário')
          AND om.status = 'active'
    ) THEN
        RAISE EXCEPTION 'Forbidden: Only org admins can query audit logs';
    END IF;

    -- Return audit logs for the org (filtered by RLS but also explicit check)
    RETURN QUERY
    SELECT 
        al.id,
        al.created_at,
        al.actor_user_id,
        al.action,
        al.entity,
        al.entity_id,
        al.metadata,
        al.request_id
    FROM public.audit_logs al
    WHERE al.org_id = p_org_id
      AND (p_action_filter IS NULL OR al.action LIKE p_action_filter)
      AND (p_entity_filter IS NULL OR al.entity = p_entity_filter)
    ORDER BY al.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant EXECUTE to authenticated users (function enforces admin check)
GRANT EXECUTE ON FUNCTION get_audit_logs(UUID, INTEGER, INTEGER, TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION get_audit_logs IS 'Query audit logs for an org (admin-only). Filters by action/entity pattern, paginated.';
