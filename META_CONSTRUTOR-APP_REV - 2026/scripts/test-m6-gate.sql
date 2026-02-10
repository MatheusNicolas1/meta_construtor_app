-- M6 GATE RUNNER
-- Executes all verification scripts

\echo '----------------------------------------'
\echo 'RUNNING VERIFY-M6 (Audit)'
\echo '----------------------------------------'
\i scripts/verify-m6.sql

\echo '----------------------------------------'
\echo 'RUNNING RDO STATE TEST'
\echo '----------------------------------------'
\i scripts/test-m6-rdos-state.sql

\echo '----------------------------------------'
\echo 'RUNNING QUALITY STATE TEST'
\echo '----------------------------------------'
\i scripts/test-m6-quality-state.sql

\echo '----------------------------------------'
\echo 'RUNNING SECURITY ATTACKS'
\echo '----------------------------------------'
\i scripts/attack-m6-state-skip.sql

\echo '----------------------------------------'
\echo 'GATE EXECUTION COMPLETE'
\echo '----------------------------------------'
