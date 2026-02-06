import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Handling __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Helpers
const log = (msg, type = 'info') => console.log(`[${type.toUpperCase()}] ${msg}`);
const fail = (msg) => { console.error(`[FAIL] ${msg}`); process.exit(1); };

// 2. Load Env
const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const [k, v] = line.split('=');
        if (k && v) envVars[k.trim()] = v.trim().replace(/"/g, '');
    });
}
const URL = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;

if (!SERVICE_KEY) fail('Missing SUPABASE_SERVICE_ROLE_KEY so cannot setup test users.');
if (!ANON_KEY) fail('Missing VITE_SUPABASE_ANON_KEY.');

const adminClient = createClient(URL, SERVICE_KEY);

async function run() {
    log('Starting RLS Smoke Test...');

    // 3. Setup Test Data (Users)
    const emailA = `testA_${Date.now()}@test.com`;
    const emailB = `testB_${Date.now()}@test.com`;

    log(`Creating User A: ${emailA}`);
    const { data: uA, error: eA } = await adminClient.auth.admin.createUser({ email: emailA, password: 'password123', email_confirm: true });
    if (eA) fail(`Create User A: ${eA.message}`);

    log(`Creating User B: ${emailB}`);
    const { data: uB, error: eB } = await adminClient.auth.admin.createUser({ email: emailB, password: 'password123', email_confirm: true });
    if (eB) fail(`Create User B: ${eB.message}`);

    log(`Created Users IDs: ${uA.user.id} (A), ${uB.user.id} (B)`);

    // Clients
    const clientA = createClient(URL, ANON_KEY);
    await clientA.auth.signInWithPassword({ email: emailA, password: 'password123' });

    const clientB = createClient(URL, ANON_KEY);
    await clientB.auth.signInWithPassword({ email: emailB, password: 'password123' });

    // 4. Test Isolation
    // wait a bit for triggers? usually fast.
    await new Promise(r => setTimeout(r, 1000));

    // Find Org A
    const { data: orgsA } = await clientA.from('orgs').select('id, name');
    if (!orgsA || orgsA.length === 0) fail('User A has no Personal Org created by trigger');
    const orgIdA = orgsA[0].id;
    log(`User A Org: ${orgIdA}`);

    // Find Org B
    const { data: orgsB } = await clientB.from('orgs').select('id, name');
    const orgIdB = orgsB[0].id;
    log(`User B Org: ${orgIdB}`);

    // Test 1: A tries to Insert into Org B (Obras)
    log('Test 1: Cross-Org Insert (Expect Fail)');
    const { error: errInsert } = await clientA.from('obras').insert({
        org_id: orgIdB,
        name: 'Hacker Obra',
        slug: 'hacker-obra',
        address: 'Nowhere'
    });

    // With RLS, insert usually throws error if WITH CHECK fails, or policy not found
    if (!errInsert) {
        fail('User A was able to insert into Org B (should be denied)');
    } else {
        log(`Pass: User A denied insert into Org B (${errInsert.message})`);
    }

    // Test 2: A tries to Select from Org B
    log('Test 2: Cross-Org Select (Expect Empty)');
    // Insert something as B first
    await clientB.from('obras').insert({ org_id: orgIdB, slug: 'b-obra', name: 'B Obra', address: 'B' });

    const { data: spyData } = await clientA.from('obras').select('*').eq('org_id', orgIdB);
    if (spyData && spyData.length > 0) fail('User A could see Org B data');
    log('Pass: User A cannot see Org B data');

    // Test 3: A inserts into Org A
    log('Test 3: Own-Org Insert (Expect Success)');
    const { data: myData, error: myError } = await clientA.from('obras').insert({
        org_id: orgIdA,
        name: 'Legit Obra',
        slug: 'legit-obra',
        address: 'Home'
    }).select().single();

    if (myError) fail(`User A failed to insert into own Org: ${myError.message}`);
    log(`Pass: User A inserted obra ${myData.id} into own Org`);

    // Test 4 (Task 3.3 Role check placeholder)
    // We will update this script for Task B later.

    // Cleanup
    log('Cleaning up...');
    await adminClient.auth.admin.deleteUser(uA.user.id);
    await adminClient.auth.admin.deleteUser(uB.user.id);
    log('Success: All smoke tests passed.');
}

run().catch(e => fail(e.message));
