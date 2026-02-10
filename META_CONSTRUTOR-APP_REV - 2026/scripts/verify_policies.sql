-- Verify RLS Policies
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('rdos','quality_checklists','quality_items')
ORDER BY tablename, policyname;
