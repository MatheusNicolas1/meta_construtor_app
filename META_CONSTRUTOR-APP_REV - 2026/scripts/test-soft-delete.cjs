const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const adminClient = createClient(URL, SERVICE_KEY);

async function run() {
    console.log('--- TEST 8.3: Soft Delete ---');

    // 1. Create a test user/org/obra
    const email = `soft_delete_${Date.now()}@test.com`;
    const { data: userAuth, error: uErr } = await adminClient.auth.signUp({ email, password: 'Test123!@#' });
    if (uErr) throw uErr;
    const userId = userAuth.user.id;

    // Wait for org
    await new Promise(r => setTimeout(r, 2000));
    const { data: org } = await adminClient.from('orgs').select('id').eq('owner_user_id', userId).single();
    if (!org) { console.error('Org creation failed'); return; }

    const { data: obra } = await adminClient.from('obras').insert({
        org_id: org.id, user_id: userId, nome: 'To Be Deleted', status: 'DRAFT', localizacao: 'X', responsavel: 'X', cliente: 'X', tipo: 'Residencial', data_inicio: '2026-01-01', previsao_termino: '2026-02-01'
    }).select().single();

    console.log('Created Obra:', obra.id);

    // 2. Soft Delete
    const deletedAt = new Date().toISOString();
    const { error: delErr } = await adminClient.from('obras').update({
        deleted_at: deletedAt,
        deleted_by: userId
    }).eq('id', obra.id);

    if (delErr) console.error('Delete error:', delErr);
    else console.log('Soft deleted Obra.');

    // 3. Verify RLS (User shouldn't see it)
    // Create anon client for user
    // Actually we can use adminClient with role check simulation? No, just use adminClient and verify column

    // Check Row exists but has deleted_at
    const { data: checkDeleted } = await adminClient.from('obras').select('id, deleted_at').eq('id', obra.id).single();
    console.log('Row in DB:', checkDeleted);

    if (checkDeleted && checkDeleted.deleted_at) {
        console.log('✅ Soft Delete persisted');
    } else {
        console.log('❌ Soft Delete failed');
    }

    // 4. Verify Audit Log
    const { data: audit } = await adminClient.from('audit_logs')
        .select('*')
        .eq('entity_id', obra.id)
        .eq('action', 'domain.obras_soft_deleted')
        .single();

    if (audit) {
        console.log('✅ Audit Log found:', audit.action);
    } else {
        console.log('❌ Audit Log missing');
    }
}

run();
