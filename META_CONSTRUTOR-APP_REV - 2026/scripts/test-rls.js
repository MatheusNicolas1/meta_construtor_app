import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const log = (msg) => console.log(`[INFO] ${msg}`);
const fail = (msg) => { console.error(`[FAIL] ${msg}`); process.exit(1); };
const pass = (msg) => console.log(`[PASS] ${msg}`);

const adminClient = createClient(URL, SERVICE_KEY);

async function run() {
    log('=== MILESTONE 3.2 & 3.3: RLS Validation ===');
    log(`Target: ${URL}\n`);

    // Create test users via signup (trigger path)
    const emailA = `rls_test_a_${Date.now()}@test.com`;
    const emailB = `rls_test_b_${Date.now()}@test.com`;
    const emailC = `rls_test_c_${Date.now()}@test.com`;

    log('Creating users via signup...');

    const clientA = createClient(URL, ANON_KEY);
    const { data: dataA, error: errA } = await clientA.auth.signUp({ email: emailA, password: 'Test123!@#' });
    if (errA) fail(`User A signup: ${errA.message}`);
    const userA = dataA.user;
    log(`User A: ${userA.id}`);

    const clientB = createClient(URL, ANON_KEY);
    const { data: dataB, error: errB } = await clientB.auth.signUp({ email: emailB, password: 'Test123!@#' });
    if (errB) fail(`User B signup: ${errB.message}`);
    const userB = dataB.user;
    log(`User B: ${userB.id}`);

    const clientC = createClient(URL, ANON_KEY);
    const { data: dataC, error: errC } = await clientC.auth.signUp({ email: emailC, password: 'Test123!@#' });
    if (errC) fail(`User C signup: ${errC.message}`);
    const userC = dataC.user;
    log(`User C: ${userC.id}\n`);

    // Wait for trigger
    await new Promise(r => setTimeout(r, 1500));

    // Get org IDs
    const { data: orgsA } = await adminClient.from('orgs').select('id').eq('owner_user_id', userA.id).single();
    const { data: orgsB } = await adminClient.from('orgs').select('id').eq('owner_user_id', userB.id).single();

    if (!orgsA || !orgsB) fail('Orgs not created by trigger');

    const orgIdA = orgsA.id;
    const orgIdB = orgsB.id;
    log(`Org A: ${orgIdA}`);
    log(`Org B: ${orgIdB}\n`);

    // FIX: Upgrade Org A to 'master' plan to allow adding members (M4 limits enforcement)
    const { data: masterPlan } = await adminClient.from('plans').select('id').eq('slug', 'master').single();
    if (masterPlan) {
        await adminClient.from('subscriptions').insert({
            org_id: orgIdA,
            plan_id: masterPlan.id,
            status: 'active',
            stripe_subscription_id: `sub_test_${Date.now()}`,
            stripe_customer_id: `cus_test_${Date.now()}`,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            billing_cycle: 'monthly'
        });
        log('Upgraded Org A to MASTER plan for testing');
    } else {
        log('WARNING: Master plan not found, test might fail due to limits');
    }

    // Add User C as Colaborador to Org A
    const { error: errAddC } = await adminClient.from('org_members').insert({
        org_id: orgIdA,
        user_id: userC.id,
        role: 'Colaborador',
        status: 'active'
    });
    if (errAddC) fail(`Add C to Org A: ${errAddC.message}`);
    log('User C added to Org A as Colaborador\n');

    // Seed test data using service role
    log('Seeding test data...');
    const { data: obraA, error: errObraA } = await adminClient.from('obras').insert({
        org_id: orgIdA,
        user_id: userA.id,
        nome: 'Obra A',
        slug: `obra-a-${Date.now()}`,
        localizacao: 'Location A',
        responsavel: 'User A',
        cliente: 'Client A',
        tipo: 'Residencial',
        data_inicio: new Date().toISOString().split('T')[0],
        previsao_termino: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }).select().single();
    if (errObraA) fail(`Create Obra A: ${errObraA.message}`);
    log(`Obra A created: ${obraA.id}\n`);

    // === TEST 3.2: ORG ISOLATION ===
    log('=== TEST 3.2: Org Isolation ===');

    // Test 1: UserA tries to read OrgB obras (should get 0)
    const { data: crossOrgRead } = await clientA.from('obras').select('*').eq('org_id', orgIdB);
    if (crossOrgRead && crossOrgRead.length > 0) {
        fail(`TEST 3.2.1 FAILED: User A read ${crossOrgRead.length} obras from Org B`);
    }
    pass('TEST 3.2.1: User A cannot read Org B obras (cross-org isolation)');

    // Test 2: UserA can read own org obras
    const { data: ownOrgRead } = await clientA.from('obras').select('*').eq('org_id', orgIdA);
    if (!ownOrgRead || ownOrgRead.length === 0) {
        fail('TEST 3.2.2 FAILED: User A cannot read own org obras');
    }
    pass(`TEST 3.2.2: User A read ${ownOrgRead.length} obra(s) from own Org A`);

    // Test 3: UserB tries to update ObraA (should fail/affect 0 rows)
    const { error: crossOrgUpdate } = await clientB.from('obras').update({ status: 'hacked' }).eq('id', obraA.id);
    const { data: checkUpdate } = await adminClient.from('obras').select('status').eq('id', obraA.id).single();
    if (checkUpdate.status === 'hacked') {
        fail('TEST 3.2.3 FAILED: User B updated Obra A (cross-org violation)');
    }
    pass('TEST 3.2.3: User B cannot update Org A obra (cross-org isolation)');

    // Test 4: UserB tries to delete ObraA (should fail/affect 0 rows)
    await clientB.from('obras').delete().eq('id', obraA.id);
    const { data: checkDelete } = await adminClient.from('obras').select('id').eq('id', obraA.id);
    if (!checkDelete || checkDelete.length === 0) {
        fail('TEST 3.2.4 FAILED: User B deleted Obra A (cross-org violation)');
    }
    pass('TEST 3.2.4: User B cannot delete Org A obra (cross-org isolation)\n');

    // === TEST 3.3: ROLE-BASED ACCESS ===
    log('=== TEST 3.3: Role-Based Access ===');

    // Test 5: UserC (Colaborador) can read Org A obras
    const { data: collabRead } = await clientC.from('obras').select('*').eq('org_id', orgIdA);
    if (!collabRead || collabRead.length === 0) {
        fail('TEST 3.3.1 FAILED: Colaborador cannot read org obras');
    }
    pass(`TEST 3.3.1: Colaborador read ${collabRead.length} obra(s) from Org A`);

    // Test 6: UserC (Colaborador) tries to delete Obra A (should fail - only Admin can delete)
    await clientC.from('obras').delete().eq('id', obraA.id);
    const { data: checkCollabDelete } = await adminClient.from('obras').select('id').eq('id', obraA.id);
    if (!checkCollabDelete || checkCollabDelete.length === 0) {
        fail('TEST 3.3.2 FAILED: Colaborador deleted obra (role violation)');
    }
    pass('TEST 3.3.2: Colaborador cannot delete obra (Admin-only operation)');

    // Test 7: UserA (Admin) CAN delete Obra A
    const { error: adminDelete } = await clientA.from('obras').delete().eq('id', obraA.id);
    const { data: checkAdminDelete } = await adminClient.from('obras').select('id').eq('id', obraA.id);
    if (checkAdminDelete && checkAdminDelete.length > 0) {
        fail('TEST 3.3.3 FAILED: Admin could not delete obra');
    }
    pass('TEST 3.3.3: Admin successfully deleted obra\n');

    // Cleanup
    log('Cleaning up...');
    await adminClient.auth.admin.deleteUser(userA.id);
    await adminClient.auth.admin.deleteUser(userB.id);
    await adminClient.auth.admin.deleteUser(userC.id);

    log('\n✅✅✅ ALL TESTS PASSED ✅✅✅');
    log('Milestone 3.2 (Org Isolation): VALIDATED');
    log('Milestone 3.3 (Role-Based Access): VALIDATED');
}

run().catch(e => fail(e.message));
