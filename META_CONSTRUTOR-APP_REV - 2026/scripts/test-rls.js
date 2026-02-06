import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Helpers
const log = (msg, type = 'info') => console.log(`[${type.toUpperCase()}] ${msg}`);
const fail = (msg) => { console.error(`[FAIL] ${msg}`); process.exit(1); };

// 2. Load Env (Prioritize CLI args or .env.local.test, fallback to process.env)
// For local testing, we expect keys to be passed or hardcoded if standard.
// We will try to parse 'supabase status' output logic if possible, but simplest is to assume env vars or user-provided file.
// We will look for .env.local if available.

const envPath = path.resolve(process.cwd(), '.env.local'); // Local dev env
const envVars = {};
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
        }
    });
}

// Fallback to process.env (passed by runner)
const URL = process.env.SUPABASE_URL || envVars.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || envVars.SUPABASE_ANON_KEY;

if (!SERVICE_KEY) fail('Missing SUPABASE_SERVICE_ROLE_KEY. Ensure it is set in env or .env.local');

const adminClient = createClient(URL, SERVICE_KEY);

async function run() {
    log('Starting RLS Smoke Test...');
    log(`Target: ${URL}`);

    // 3. Setup Test Data (Users)
    const emailA = `testA_${Date.now()}@test.com`;
    const emailB = `testB_${Date.now()}@test.com`;
    const emailC = `testC_${Date.now()}@test.com`;

    log('Creating Users...');
    const { data: uA, error: eA } = await adminClient.auth.admin.createUser({ email: emailA, password: 'password123', email_confirm: true });
    if (eA) fail(`Create User A: ${eA.message}`);

    const { data: uB, error: eB } = await adminClient.auth.admin.createUser({ email: emailB, password: 'password123', email_confirm: true });
    if (eB) fail(`Create User B: ${eB.message}`);

    const { data: uC, error: eC } = await adminClient.auth.admin.createUser({ email: emailC, password: 'password123', email_confirm: true });
    if (eC) fail(`Create User C: ${eC.message}`);

    // Clients
    const clientA = createClient(URL, ANON_KEY);
    await clientA.auth.signInWithPassword({ email: emailA, password: 'password123' });

    const clientB = createClient(URL, ANON_KEY);
    await clientB.auth.signInWithPassword({ email: emailB, password: 'password123' });

    const clientC = createClient(URL, ANON_KEY);
    await clientC.auth.signInWithPassword({ email: emailC, password: 'password123' });

    // Wait for triggers (handle_new_user)
    await new Promise(r => setTimeout(r, 1000));

    // Find User A's Org
    const { data: orgsA } = await clientA.from('orgs').select('id');
    if (!orgsA?.[0]) fail('User A Org not created by trigger');
    const orgIdA = orgsA[0].id;
    log(`User A Org: ${orgIdA}`);

    // Setup User C as Collaborator in Org A
    // Admin inserts member C
    const { error: errAddC } = await adminClient.from('org_members').insert({
        org_id: orgIdA,
        user_id: uC.user.id,
        role: 'Colaborador',
        status: 'active'
    });
    if (errAddC) fail(`Failed to add C to Org A: ${errAddC.message}`);
    log(`User C added to Org A as Colaborador`);

    // --- TASK A: ISOLATION TESTS ---
    log('--- Task 3.2 Isolation Tests ---');

    // Find User B's Org
    const { data: orgsB } = await clientB.from('orgs').select('id');
    const orgIdB = orgsB[0].id;

    // Test 1: A inserts into A (Success)
    const { data: obraA, error: errObraA } = await clientA.from('obras').insert({
        org_id: orgIdA,
        name: 'Obra A',
        slug: 'obra-a',
        address: 'Addr A'
    }).select().single();
    if (errObraA) fail(`User A insert own org failed: ${errObraA.message}`);
    log(`Pass: User A inserted Obra ${obraA.id}`);

    // Test 2: A inserts into B (Fail)
    const { error: errObraB } = await clientA.from('obras').insert({
        org_id: orgIdB,
        name: 'Hacker Obra',
        slug: 'hacker-obra',
        address: 'Addr B'
    });
    if (!errObraB) fail('User A inserted into Org B (Should Fail)');
    log('Pass: User A denied insert into Org B');

    // Test 3: C (Colaborador) reads A (Success)
    const { data: readC } = await clientC.from('obras').select('*').eq('org_id', orgIdA);
    if (!readC || readC.length === 0) fail('User C (Colaborador) cannot read Org A data');
    log('Pass: User C can read Org A data');

    // --- TASK B: ROLE TESTS ---
    log('--- Task 3.3 Role Tests ---');

    // Test 4: C (Colaborador) tries to DELETE Obra A (Fail)
    const { error: errDelC } = await clientC.from('obras').delete().eq('id', obraA.id);
    // If no error, check if row deleted?
    // RLS DELETE policy: USING (has_org_role(..., 'Admin'))
    // C is Colaborador. Should find 0 rows or error?
    // Postgres DELETE with RLS usually silently ignores rows if USING is false, unless check?
    // Actually, DELETE Policies act as filters. If filter excludes row, delete affects 0 rows.
    // So we check if Obra still exists.

    const { data: checkObra1 } = await adminClient.from('obras').select('id').eq('id', obraA.id);
    if (!checkObra1 || checkObra1.length === 0) fail('User C was able to DELETE Obra (Should Fail)');
    log('Pass: User C (Colaborador) could not delete Obra');

    // Test 5: A (Admin) tries to DELETE Obra A (Success)
    const { error: errDelA } = await clientA.from('obras').delete().eq('id', obraA.id);
    if (errDelA) fail(`User A (Admin) failed to delete: ${errDelA.message}`);

    const { data: checkObra2 } = await adminClient.from('obras').select('id').eq('id', obraA.id);
    if (checkObra2 && checkObra2.length > 0) fail('User A (Admin) delete did not remove row');
    log('Pass: User A (Admin) deleted Obra');

    // Cleanup
    log('Cleaning up users...');
    await adminClient.auth.admin.deleteUser(uA.user.id);
    await adminClient.auth.admin.deleteUser(uB.user.id);
    await adminClient.auth.admin.deleteUser(uC.user.id);
    log('SUCCESS: All tests passed.');
}

run().catch(e => fail(e.message));
