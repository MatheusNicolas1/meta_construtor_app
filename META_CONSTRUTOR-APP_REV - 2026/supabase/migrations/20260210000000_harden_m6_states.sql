-- M6 Hardening: RLS Policies and Security Baseline
-- Fixes insecure 'Enable all' on RDOs and adds missing RLS for Quality tables

BEGIN;

-- 1. RDO Hardening
-- Remove insecure dev policy
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.rdos;

-- Ensure RLS is on
ALTER TABLE public.rdos ENABLE ROW LEVEL SECURITY;

-- Policy: View RDOs (Member of Org)
CREATE POLICY "Users can view RDOs of their orgs" ON public.rdos
FOR SELECT TO authenticated
USING (
    org_id IN (
        SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
);

-- Policy: Manage RDOs (Admin/Manager/Collaborator of Org) -> Simplified to any member for now, or use roles?
-- Implementation Plan says: "Users can manage...". Let's stick to simple org membership for MVP M6, 
-- refining roles in M3.3 logic if needed. Assuming writes allowed for members for now.
CREATE POLICY "Users can insert RDOs for their orgs" ON public.rdos
FOR INSERT TO authenticated
WITH CHECK (
    org_id IN (
        SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update RDOs of their orgs" ON public.rdos
FOR UPDATE TO authenticated
USING (
    org_id IN (
        SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
);

-- 2. Quality Checklists Hardening
ALTER TABLE public.quality_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklists of their orgs" ON public.quality_checklists
FOR SELECT TO authenticated
USING (
    org_id IN (
        SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage checklists for their orgs" ON public.quality_checklists
FOR ALL TO authenticated
USING (
    org_id IN (
        SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
);

-- 3. Quality Items Hardening
ALTER TABLE public.quality_items ENABLE ROW LEVEL SECURITY;

-- Items link to Checklist, which links to Org.
-- READ
CREATE POLICY "Users can view quality items of their orgs" ON public.quality_items
FOR SELECT TO authenticated
USING (
    checklist_id IN (
        SELECT c.id FROM public.quality_checklists c
        WHERE c.org_id IN (
            SELECT m.org_id FROM public.org_members m WHERE m.user_id = auth.uid()
        )
    )
);

-- WRITE (All actions)
CREATE POLICY "Users can manage quality items of their orgs" ON public.quality_items
FOR ALL TO authenticated
USING (
    checklist_id IN (
        SELECT c.id FROM public.quality_checklists c
        WHERE c.org_id IN (
            SELECT m.org_id FROM public.org_members m WHERE m.user_id = auth.uid()
        )
    )
);

COMMIT;
