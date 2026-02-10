const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(URL, SERVICE_KEY);

async function run() {
    console.log('--- TEST 8.1.3 A: RPC Rate Limit Logic ---');
    const key = 'test:rpc_key';

    // Cleanup
    await supabase.from('rate_limits').delete().eq('key', key);

    // 1. First Request
    const { data: d1, error: e1 } = await supabase.rpc('check_rate_limit', {
        p_key: key, p_window_seconds: 60, p_max_requests: 2
    });
    console.log('Req 1:', d1 ? d1[0] : e1);

    // 2. Second Request
    const { data: d2, error: e2 } = await supabase.rpc('check_rate_limit', {
        p_key: key, p_window_seconds: 60, p_max_requests: 2
    });
    console.log('Req 2:', d2 ? d2[0] : e2);

    // 3. Third Request (Should be blocked)
    const { data: d3, error: e3 } = await supabase.rpc('check_rate_limit', {
        p_key: key, p_window_seconds: 60, p_max_requests: 2
    });
    console.log('Req 3:', d3 ? d3[0] : e3);

    // Cleanup
    await supabase.from('rate_limits').delete().eq('key', key);
}

run();
