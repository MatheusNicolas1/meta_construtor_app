-- M5 STEP T2: Runtime verification via SQL (simpler than Node script)
-- Test DB triggers fire correctly

\set QUIET on
\pset border 2
\pset format aligned

\echo ''
\echo '═══════════════════════════════════════════════════════════════════════════════'
\echo '                    M5 AUDIT VERIFICATION TESTS (SQL)'    
\echo '═══════════════════════════════════════════════════════════════════════════════'
\echo ''

-- Get org for testing
\echo '📦 Using org:'
SELECT id, name FROM orgs LIMIT 1;
\gset

\echo ''
\echo '📊 Baseline audit count:'
SELECT COUNT(*) as baseline_count FROM audit_logs WHERE org_id = :'id';

\echo ''
\echo '──────────────────────────────────────────────────────────────────────────────'
\echo 'TEST A: INSERT obra → domain.obra_created'
\echo '───────────────────────────────────────────────────────────────────────────────'

-- Insert obra
INSERT INTO obras (org_id, nome, status) 
VALUES (:'id', 'Test Obra M5 Verification', 'ATIVO')
RETURNING id as obra_id;
\gset

-- Check audit log
SELECT 
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status,
    COUNT(*) as audit_rows,
    'domain.obra_created audit log found' as details
FROM audit_logs 
WHERE org_id = :'id' 
  AND action = 'domain.obra_created' 
  AND entity_id = :'obra_id'::uuid;

\echo ''
\echo '──────────────────────────────────────────────────────────────────────────────'
\echo 'TEST B: UPDATE obra → domain.obra_updated'
\echo '──────────────────────────────────────────────────────────────────────────────'

-- Update obra
UPDATE obras SET status = 'CONCLUÍDO' WHERE id = :'obra_id'::uuid;

-- Check audit log
SELECT 
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status,
    COUNT(*) as audit_rows,
    'domain.obra_updated audit log found' as details
FROM audit_logs 
WHERE org_id = :'id' 
  AND action = 'domain.obra_updated' 
  AND entity_id = :'obra_id'::uuid;

\echo ''
\echo '──────────────────────────────────────────────────────────────────────────────'
\echo 'TEST C: DELETE obra → domain.obra_deleted'
\echo '──────────────────────────────────────────────────────────────────────────────'

-- Delete obra
DELETE FROM obras WHERE id = :'obra_id'::uuid;

-- Check audit log
SELECT 
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status,
    COUNT(*) as audit_rows,
    'domain.obra_deleted audit log found' as details
FROM audit_logs 
WHERE org_id = :'id' 
  AND action = 'domain.obra_deleted' 
  AND entity_id = :'obra_id'::uuid;

\echo ''
\echo '──────────────────────────────────────────────────────────────────────────────'
\echo 'TEST D: INSERT expense → domain.expense_created'
\echo '──────────────────────────────────────────────────────────────────────────────'

-- Insert expense
INSERT INTO expenses (org_id, description, amount) 
VALUES (:'id', 'Test Expense M5 Verification', 100.50)
RETURNING id as expense_id;
\gset

-- Check audit log
SELECT 
    CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status,
    COUNT(*) as audit_rows,
    'domain.expense_created audit log found' as details
FROM audit_logs 
WHERE org_id = :'id' 
  AND action = 'domain.expense_created' 
  AND entity_id = :'expense_id'::uuid;

-- Cleanup expense
DELETE FROM expenses WHERE id = :'expense_id'::uuid;

\echo ''
\echo '═══════════════════════════════════════════════════════════════════════════════'
\echo '                              FINAL SUMMARY'
\echo '═══════════════════════════════════════════════════════════════════════════════'
\echo ''

\echo '📊 Final audit count:'
SELECT COUNT(*) as final_count FROM audit_logs WHERE org_id = :'id';

\echo ''
\echo '✅ ALL TESTS COMPLETED'
\echo 'NOTE: Check each TEST status above. All should show ✅ PASS'
\echo ''
