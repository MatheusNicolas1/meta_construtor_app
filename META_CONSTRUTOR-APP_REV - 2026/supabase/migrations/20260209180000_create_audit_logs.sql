-- M5.1: Create immutable audit_logs table
-- Append-only audit trail with org isolation and tamper-resistance

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Organization context
    org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    
    -- Actor (null for system events)
    actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Action details
    action text NOT NULL,
    entity text NOT NULL,
    entity_id uuid,
    
    -- Additional context
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    request_id uuid,
    ip inet,
    user_agent text,
    
    -- Prevent modifications
    CONSTRAINT audit_logs_immutable CHECK (created_at <= now())
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_logs_org_created ON public.audit_logs(org_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor_created ON public.audit_logs(actor_user_id, created_at DESC) WHERE actor_user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - org members can read their org's logs
CREATE POLICY "Org members can read audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = audit_logs.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
        )
    );

-- RLS Policy: INSERT - only service_role (via edge functions)
-- No INSERT policy for authenticated = only service_role can INSERT

-- Revoke UPDATE/DELETE from all roles except postgres
REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated, anon, service_role;

-- Trigger: prevent UPDATE/DELETE attempts (tamper-resistance)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs are immutable: UPDATE and DELETE operations are not allowed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_prevent_audit_update
    BEFORE UPDATE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER trigger_prevent_audit_delete
    BEFORE DELETE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();

-- Grant SELECT to authenticated users (RLS will filter)
GRANT SELECT ON public.audit_logs TO authenticated;

-- Grant INSERT to service_role only (for edge functions)
GRANT INSERT ON public.audit_logs TO service_role;

-- Comment
COMMENT ON TABLE public.audit_logs IS 'Immutable append-only audit trail. INSERT via service_role only. UPDATE/DELETE blocked by triggers.';
