-- M6 Final Evidence Script
-- Run these commands to verify the state of Milestone 6 artifacts.

-- 1. RDO Objects (6.3)
\echo 'RDO Policies:'
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'rdos';
\echo 'RDO Triggers:'
SELECT tgname FROM pg_trigger WHERE tgrelid='public.rdos'::regclass AND NOT tgisinternal;
\echo 'RDO Indices:'
SELECT indexname FROM pg_indexes WHERE tablename='rdos';

-- 2. Quality Objects (6.4)
\echo 'Quality Policies:'
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename IN ('quality_checklists', 'quality_items') ORDER BY tablename;
\echo 'Quality Triggers:'
SELECT tgname FROM pg_trigger WHERE tgrelid='public.quality_items'::regclass AND NOT tgisinternal;

-- 3. Audit Logs (6.5 Evidence)
\echo 'Audit Logs (Recent):'
SELECT created_at, action, metadata 
FROM audit_logs 
WHERE action IN ('domain.rdo_status_changed', 'domain.quality_item_status_changed')
ORDER BY created_at DESC LIMIT 5;
