-- ============================================================================
-- MILESTONE 3.2: Org Isolation Policies
-- ============================================================================
-- Purpose: Enforce strict isolation per organization using RLS policies.
-- Dependencies: 20260206170000_rbac_helpers.sql (public.is_org_member)
-- ============================================================================

-- 1. ORGS TABLE
DROP POLICY IF EXISTS "Orgs: View" ON public.orgs;
CREATE POLICY "Orgs: View" ON public.orgs FOR SELECT USING (
  public.is_org_member(id)
);

DROP POLICY IF EXISTS "Orgs: Insert" ON public.orgs;
CREATE POLICY "Orgs: Insert" ON public.orgs FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Orgs: Update" ON public.orgs;
CREATE POLICY "Orgs: Update" ON public.orgs FOR UPDATE USING (
  public.is_org_member(id)
);

-- 2. ORG_MEMBERS TABLE
DROP POLICY IF EXISTS "Members: View" ON public.org_members;
CREATE POLICY "Members: View" ON public.org_members FOR SELECT USING (
    public.is_org_member(org_id)
);

DROP POLICY IF EXISTS "Members: Insert" ON public.org_members;
CREATE POLICY "Members: Insert" ON public.org_members FOR INSERT WITH CHECK (
    public.is_org_member(org_id)
);

DROP POLICY IF EXISTS "Members: Update" ON public.org_members;
CREATE POLICY "Members: Update" ON public.org_members FOR UPDATE USING (
    public.is_org_member(org_id)
);

DROP POLICY IF EXISTS "Members: Delete" ON public.org_members;
CREATE POLICY "Members: Delete" ON public.org_members FOR DELETE USING (
    public.is_org_member(org_id)
);

-- 3. DOMAIN TABLES (Isolation by org_id)

-- OBRAS
DROP POLICY IF EXISTS "Obras: View" ON public.obras;
CREATE POLICY "Obras: View" ON public.obras FOR SELECT USING ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "Obras: Insert" ON public.obras;
CREATE POLICY "Obras: Insert" ON public.obras FOR INSERT WITH CHECK ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "Obras: Update" ON public.obras;
CREATE POLICY "Obras: Update" ON public.obras FOR UPDATE USING ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "Obras: Delete" ON public.obras;
CREATE POLICY "Obras: Delete" ON public.obras FOR DELETE USING ( public.is_org_member(org_id) );

-- RDOS
DROP POLICY IF EXISTS "RDOs: View" ON public.rdos;
CREATE POLICY "RDOs: View" ON public.rdos FOR SELECT USING ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "RDOs: Insert" ON public.rdos;
CREATE POLICY "RDOs: Insert" ON public.rdos FOR INSERT WITH CHECK ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "RDOs: Update" ON public.rdos;
CREATE POLICY "RDOs: Update" ON public.rdos FOR UPDATE USING ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "RDOs: Delete" ON public.rdos;
CREATE POLICY "RDOs: Delete" ON public.rdos FOR DELETE USING ( public.is_org_member(org_id) );

-- ATIVIDADES
DROP POLICY IF EXISTS "Atividades: View" ON public.atividades;
CREATE POLICY "Atividades: View" ON public.atividades FOR SELECT USING ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "Atividades: Insert" ON public.atividades;
CREATE POLICY "Atividades: Insert" ON public.atividades FOR INSERT WITH CHECK ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "Atividades: Update" ON public.atividades;
CREATE POLICY "Atividades: Update" ON public.atividades FOR UPDATE USING ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "Atividades: Delete" ON public.atividades;
CREATE POLICY "Atividades: Delete" ON public.atividades FOR DELETE USING ( public.is_org_member(org_id) );

-- EXPENSES
DROP POLICY IF EXISTS "Expenses: View" ON public.expenses;
CREATE POLICY "Expenses: View" ON public.expenses FOR SELECT USING ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "Expenses: Insert" ON public.expenses;
CREATE POLICY "Expenses: Insert" ON public.expenses FOR INSERT WITH CHECK ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "Expenses: Update" ON public.expenses;
CREATE POLICY "Expenses: Update" ON public.expenses FOR UPDATE USING ( public.is_org_member(org_id) );

DROP POLICY IF EXISTS "Expenses: Delete" ON public.expenses;
CREATE POLICY "Expenses: Delete" ON public.expenses FOR DELETE USING ( public.is_org_member(org_id) );

-- 4. PROFILES
DROP POLICY IF EXISTS "Profiles: View Own" ON public.profiles;
CREATE POLICY "Profiles: View Own" ON public.profiles FOR SELECT USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Profiles: Update Own" ON public.profiles;
CREATE POLICY "Profiles: Update Own" ON public.profiles FOR UPDATE USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Profiles: View Co-Members" ON public.profiles;
CREATE POLICY "Profiles: View Co-Members" ON public.profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.org_members om1
        JOIN public.org_members om2 ON om1.org_id = om2.org_id
        WHERE om1.user_id = profiles.id
        AND om2.user_id = auth.uid()
    )
);
