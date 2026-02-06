-- ============================================================================
-- MILESTONE 2.2: RBAC Helpers (Source of Truth)
-- ============================================================================
-- Helpers para verificar permissões baseadas em org_members no Backend/RLS
-- ============================================================================

-- Function: Get current user's role in a specific organization
CREATE OR REPLACE FUNCTION public.current_org_role(p_org_id uuid)
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role
  FROM public.org_members
  WHERE org_id = p_org_id
  AND user_id = auth.uid()
  AND status = 'active'
  LIMIT 1;
$$;

-- Function: Check if current user is a member (active)
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE org_id = p_org_id
    AND user_id = auth.uid()
    AND status = 'active'
  );
$$;

-- Function: Check if current user has one of the allowed roles in the org
CREATE OR REPLACE FUNCTION public.has_org_role(p_org_id uuid, p_roles app_role[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_role app_role;
BEGIN
  v_role := public.current_org_role(p_org_id);
  RETURN v_role IS NOT NULL AND v_role = ANY(p_roles);
END;
$$;

-- Function: Check if current user has permission (mapped from role)
-- Can be expanded later for granular permissions.
-- For now, we stick to Role-based checks.

-- Comment on usage
COMMENT ON FUNCTION public.current_org_role IS 'Returns the app_role of the current user in the organization. Returns NULL if not a member or active.';
COMMENT ON FUNCTION public.has_org_role IS 'Returns TRUE if the current user has any of the specified roles in the organization.';
