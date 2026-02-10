-- M6 Audit Script: Verify State Machines, RLS, and Logging
-- Read-only queries to inspect Milestone 6 artifacts

-- 1. ENUM values
SELECT t.typname, e.enumlabel
FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid
WHERE t.typname IN ('rdo_status','obra_status','quality_item_status')
ORDER BY t.typname, e.enumsortorder;

-- 2. Column types
SELECT table_name, column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('rdos','quality_items', 'quality_checklists')
  AND column_name IN ('status', 'org_id', 'user_id')
ORDER BY table_name, column_name;

-- 3. Triggers
SELECT c.relname AS table_name, tgname
FROM pg_trigger tg
JOIN pg_class c ON c.oid=tg.tgrelid
WHERE c.relname IN ('rdos','quality_items')
  AND NOT tgisinternal
ORDER BY c.relname, tgname;

-- 4. RLS Enabled & Policies
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('rdos','quality_checklists','quality_items');

SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('rdos','quality_checklists','quality_items')
ORDER BY tablename, policyname;

-- 5. Audit Log Evidence (Last 10 relevant)
SELECT created_at, action, entity, entity_id, metadata
FROM public.audit_logs
WHERE action IN ('domain.rdo_status_changed','domain.quality_item_status_changed')
ORDER BY created_at DESC
LIMIT 10;
