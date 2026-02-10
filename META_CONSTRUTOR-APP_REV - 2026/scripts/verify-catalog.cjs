const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(URL, SERVICE_KEY);

async function run() {
    console.log('=== 8.1.1 Catalog Evidence ===');
    const { data: d1 } = await supabase.rpc('check_rate_limit', { p_key: 'test', p_window_seconds: 1, p_max_requests: 1 }); // Just to check connection, actually we want regclass

    // We cannot run raw SQL via JS client without pg driver or rpc wrapper for sql.
    // But we have `check_rate_limit` RPC.
    // The user wants "SELECT to_regclass...". 
    // I should use the `pg` driver installed previously.

    // Check if pg is installed
    try {
        require('pg');
    } catch (e) {
        console.error('pg driver not found. Please install it.');
        process.exit(1);
    }

    const { Client } = require('pg');
    const DB_URL = 'postgres://postgres:postgres@127.0.0.1:54322/postgres';
    const client = new Client({ connectionString: DB_URL });
    await client.connect();

    try {
        console.log('\n-- Table rate_limits --');
        const res1 = await client.query("SELECT to_regclass('public.rate_limits') as exists");
        console.log(res1.rows);

        console.log('\n-- Function check_rate_limit --');
        const res2 = await client.query("SELECT proname FROM pg_proc WHERE proname = 'check_rate_limit'");
        console.log(res2.rows);

        console.log('\n-- 3. Execute RPC logic test (Simulate 3 requests, limit 2) --');
        // Req 1
        const r1 = await client.query("SELECT * FROM public.check_rate_limit('m8:test', 60, 2)");
        console.log('Req 1:', r1.rows[0]);
        // Req 2
        const r2 = await client.query("SELECT * FROM public.check_rate_limit('m8:test', 60, 2)");
        console.log('Req 2:', r2.rows[0]);
        // Req 3
        const r3 = await client.query("SELECT * FROM public.check_rate_limit('m8:test', 60, 2)");
        console.log('Req 3:', r3.rows[0]);

        console.log('\n=== 8.3.2 Catalog Evidence ===');
        console.log('-- Policies (Obras/Expenses) --');
        const res3 = await client.query("SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('obras','expenses') ORDER BY tablename, policyname");
        console.table(res3.rows);

        console.log('\n-- Triggers (Soft Delete) --');
        const res4 = await client.query("SELECT tgname FROM pg_trigger WHERE tgrelid IN ('public.obras'::regclass,'public.expenses'::regclass) AND NOT tgisinternal ORDER BY tgname");
        console.table(res4.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

run();
