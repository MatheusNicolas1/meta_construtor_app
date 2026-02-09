DROP POLICY IF EXISTS orgs_select_policy ON public.orgs;

CREATE POLICY orgs_select_policy
  ON public.orgs FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.org_members m
      WHERE m.org_id = orgs.id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );