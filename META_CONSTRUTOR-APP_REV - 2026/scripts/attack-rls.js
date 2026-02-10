/**
 * MILESTONE 3.4: Direct RLS Attack Script
 * 
 * Tests direct API attack vectors against RLS policies
 * Run: node scripts/attack-rls.js
 * 
 * Attack Vectors:
 * 1. Cross-org read by ID
 * 2. Cross-org read by filter  
 * 3. Cross-org update
 * 4. Cross-org delete
 * 5. Role-restricted delete (Colaborador → Admin-only)
 */

import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const log = (msg) => console.log(`[INFO] ${msg}`);
const attack = (vector, expected, actual, pass) => {
    const status = pass ? 'PASS' : 'FAIL';
    const icon = pass ? '✅' : '❌';
    console.log(`\n${icon} [${status}] ${vector}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
    return pass;
};

const adminClient = createClient(URL, SERVICE_KEY);

async function run() {
    log('=== MILESTONE 3.4: Direct RLS Attack Script ===\n');

    const results = [];

    // Setup: Create attacker and victim
    log('Setting up attack scenario...');

    const victimEmail = `victim_${Date.now()}@test.com`;
    const attackerEmail = `attacker_${Date.now()}@test.com`;

    // Create victim
    const victimClient = createClient(URL, ANON_KEY);
    const { data: victimAuth, error: vErr } = await victimClient.auth.signUp({ email: victimEmail, password: 'Test123!@#' });
    if (vErr || !victimAuth.user) {
        console.error('Victim signup failed:', vErr);
        process.exit(1);
    }
    const victim = victimAuth.user;

    // Create attacker  
    const attackerClient = createClient(URL, ANON_KEY);
    const { data: attackerAuth, error: aErr } = await attackerClient.auth.signUp({ email: attackerEmail, password: 'Test123!@#' });
    if (aErr || !attackerAuth.user) {
        console.error('Attacker signup failed:', aErr);
        process.exit(1);
    }
    const attacker = attackerAuth.user;

    log('Waiting for triggers to create orgs...');
    await new Promise(r => setTimeout(r, 3000)); // Increased wait

    // Get orgs
    const { data: victimOrg, error: vOrgErr } = await adminClient.from('orgs').select('id').eq('owner_user_id', victim.id).single();
    if (vOrgErr || !victimOrg) {
        console.error('Victim org not found:', vOrgErr);
        process.exit(1);
    }

    const { data: attackerOrg, error: aOrgErr } = await adminClient.from('orgs').select('id').eq('owner_user_id', attacker.id).single();
    if (aOrgErr || !attackerOrg) {
        console.error('Attacker org not found:', aOrgErr);
        process.exit(1);
    }

    log(`Victim Org: ${victimOrg.id}`);
    log(`Attacker Org: ${attackerOrg.id}`);

    // Create victim obra
    const { data: victimObra, error: obraErr } = await adminClient.from('obras').insert({
        org_id: victimOrg.id,
        user_id: victim.id,
        nome: 'Victim Obra - Confidential',
        slug: `victim-obra-${Date.now()}`,
        localizacao: 'Secret Location',
        responsavel: 'Victim',
        cliente: 'Secret Client',
        tipo: 'Comercial',
        status: 'ACTIVE', // M6: Enum required
        data_inicio: new Date().toISOString().split('T')[0],
        previsao_termino: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }).select().single();

    if (obraErr || !victimObra) {
        console.error('Victim Obra creation failed:', obraErr);
        process.exit(1);
    }

    log(`Victim Obra ID: ${victimObra.id}\n`);

    log('=== ATTACK VECTORS ===\n');

    // ATTACK 1: Cross-org read by ID
    const { data: attack1Data, error: attack1Error } = await attackerClient
        .from('obras')
        .select('*')
        .eq('id', victimObra.id)
        .maybeSingle();

    results.push(attack(
        'Vector 1: Cross-org read by ID',
        'null (RLS blocks)',
        attack1Data ? `LEAKED: ${attack1Data.nome}` : 'null',
        attack1Data === null
    ));

    // ATTACK 2: Cross-org read by filter
    const { data: attack2Data } = await attackerClient
        .from('obras')
        .select('*')
        .eq('org_id', victimOrg.id);

    results.push(attack(
        'Vector 2: Cross-org read by filter',
        '0 rows',
        `${attack2Data?.length || 0} rows`,
        (attack2Data?.length || 0) === 0
    ));

    // ATTACK 3: Cross-org update
    await attackerClient
        .from('obras')
        .update({ nome: 'HACKED', status: 'COMPROMISED' })
        .eq('id', victimObra.id);

    const { data: check3 } = await adminClient.from('obras').select('nome,status').eq('id', victimObra.id).single();

    results.push(attack(
        'Vector 3: Cross-org update',
        'No change (RLS blocks)',
        check3.nome === 'HACKED' ? 'MODIFIED!' : 'No change',
        check3.nome !== 'HACKED'
    ));

    // ATTACK 4: Cross-org delete
    await attackerClient
        .from('obras')
        .delete()
        .eq('id', victimObra.id);

    const { data: check4 } = await adminClient.from('obras').select('id').eq('id', victimObra.id);

    results.push(attack(
        'Vector 4: Cross-org delete',
        'Row still exists',
        check4?.length > 0 ? 'Row exists' : 'DELETED!',
        check4?.length > 0
    ));

    // ATTACK 5: Role-restricted delete (add attacker as Colaborador to victim org)
    await adminClient.from('org_members').insert({
        org_id: victimOrg.id,
        user_id: attacker.id,
        role: 'Colaborador',
        status: 'active'
    });

    // Create new session for attacker with updated role
    await attackerClient.auth.signOut();
    await attackerClient.auth.signInWithPassword({ email: attackerEmail, password: 'Test123!@#' });
    await new Promise(r => setTimeout(r, 500));

    await attackerClient
        .from('obras')
        .delete()
        .eq('id', victimObra.id);

    const { data: check5 } = await adminClient.from('obras').select('id').eq('id', victimObra.id);

    results.push(attack(
        'Vector 5: Role-restricted delete (Colaborador→Admin-only)',
        'Row still exists (role blocks)',
        check5?.length > 0 ? 'Row exists' : 'DELETED!',
        check5?.length > 0
    ));

    // Cleanup
    log('\nCleaning up...');
    await adminClient.auth.admin.deleteUser(victim.id);
    await adminClient.auth.admin.deleteUser(attacker.id);

    // Summary
    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log('\n' + '='.repeat(60));
    console.log(`FINAL RESULT: ${passed}/${total} attacks blocked`);
    console.log('='.repeat(60));

    if (passed === total) {
        log('\n✅✅✅ ALL ATTACKS BLOCKED - RLS SECURE ✅✅✅');
        log('Milestone 3.4: VALIDATED');
    } else {
        console.error(`\n❌ ${total - passed} VULNERABILITIES DETECTED`);
        process.exit(1);
    }
}

run().catch(e => {
    console.error('[ERROR]', e.message);
    process.exit(1);
});
