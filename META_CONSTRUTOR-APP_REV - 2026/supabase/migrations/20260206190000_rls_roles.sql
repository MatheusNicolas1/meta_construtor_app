-- ============================================================================
-- MILESTONE 3.3: Role-Based RLS Policies
-- ============================================================================
-- Purpose: Enforce RBAC at database level (Admin, Gerente, Colaborador).
-- Dependencies: 20260206183000_rls_isolation.sql
-- ============================================================================

-- 1. OBRAS: Restrict DELETE to Admin
DROP POLICY IF EXISTS "Obras: Delete" ON public.obras;
CREATE POLICY "Obras: Delete" ON public.obras FOR DELETE USING (
  public.has_org_role(org_id, ARRAY['Administrador'::app_role])
);

-- 2. EXPENSES: Restrict DELETE to Admin
DROP POLICY IF EXISTS "Expenses: Delete" ON public.expenses;
CREATE POLICY "Expenses: Delete" ON public.expenses FOR DELETE USING (
  public.has_org_role(org_id, ARRAY['Administrador'::app_role])
);

-- 3. ORG_MEMBERS: Manage Team - Admin Only
-- Update (Change Roles)
DROP POLICY IF EXISTS "Members: Update" ON public.org_members;
CREATE POLICY "Members: Update" ON public.org_members FOR UPDATE USING (
  public.has_org_role(org_id, ARRAY['Administrador'::app_role])
);

-- Delete (Remove Member)
DROP POLICY IF EXISTS "Members: Delete" ON public.org_members;
CREATE POLICY "Members: Delete" ON public.org_members FOR DELETE USING (
  public.has_org_role(org_id, ARRAY['Administrador'::app_role])
);

-- Insert (Invite Member)
DROP POLICY IF EXISTS "Members: Insert" ON public.org_members;
CREATE POLICY "Members: Insert" ON public.org_members FOR INSERT WITH CHECK (
  public.has_org_role(org_id, ARRAY['Administrador'::app_role])
);

-- 4. RDOS: Delete restricted (Optional, maybe Manager too?)
-- For now, allow Manager + Admin
DROP POLICY IF EXISTS "RDOs: Delete" ON public.rdos;
CREATE POLICY "RDOs: Delete" ON public.rdos FOR DELETE USING (
  public.has_org_role(org_id, ARRAY['Administrador'::app_role, 'Gerente'::app_role])
);
