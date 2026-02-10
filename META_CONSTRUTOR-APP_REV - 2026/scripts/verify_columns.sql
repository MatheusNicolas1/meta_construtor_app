-- Verify Columns for Quality tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('quality_checklists', 'quality_items')
  AND column_name IN ('org_id', 'obra_id', 'status')
ORDER BY table_name, column_name;
