// M5 Verification Test Gate - STEP T2
// Runtime verification: DB triggers + admin-only query
// Using local Supabase connection (Docker)

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function test(name, passed, details) {
    results.total++;
    if (passed) {
        results.passed++;
        results.tests.push({ name, status: 'PASS', details });
    } else {
        results.failed++;
        results.tests.push({ name, status: 'FAIL', details });
    }
}

async function main() {
    console.log('\n🔍 M5 Audit Verification Tests\n');

    // Setup: Get org
    const { data: org, error: orgError } = await adminClient
        .from('orgs')
        .select('id, name')
        .limit(1)
        .single();

    if (orgError || !org) {
        console.error('❌ No org found for testing:', orgError?.message);
        process.exit(1);
    }

    console.log(`📦 Using org: ${org.name} (${org.id})\n`);

    // Get baseline audit count
    const { count: baselineCount } = await adminClient
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id);

    console.log(`📊 Baseline audit count: ${baselineCount || 0}\n`);

    // TEST A: Insert obra → domain.obra_created
    let obraId = null;
    try {
        const obraName = `Test Obra ${Date.now()}`;
        const { data: obra, error } = await adminClient
            .from('obras')
            .insert({
                org_id: org.id,
                nome: obraName,
                status: 'ATIVO'
            })
            .select('id')
            .single();

        if (error) throw error;
        obraId = obra.id;

        // Wait a bit for trigger to fire
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check audit log
        const { data: auditLogs } = await adminClient
            .from('audit_logs')
            .select('action, entity, metadata')
            .eq('org_id', org.id)
            .eq('action', 'domain.obra_created')
            .eq('entity_id', obra.id);

        test(
            'A) INSERT obra → domain.obra_created',
            auditLogs && auditLogs.length > 0,
            auditLogs ? `Found ${auditLogs.length} audit row` : 'No audit log found'
        );
    } catch (err) {
        test('A) INSERT obra', false, `Error: ${err.message}`);
    }

    // TEST B: Update obra → domain.obra_updated
    if (obraId) {
        try {
            const { error: updateError } = await adminClient
                .from('obras')
                .update({ status: 'CONCLUÍDO' })
                .eq('id', obraId);

            if (updateError) throw updateError;

            await new Promise(resolve => setTimeout(resolve, 100));

            const { data: updateAudit } = await adminClient
                .from('audit_logs')
                .select('action')
                .eq('org_id', org.id)
                .eq('action', 'domain.obra_updated')
                .eq('entity_id', obraId);

            test(
                'B) UPDATE obra → domain.obra_updated',
                updateAudit && updateAudit.length > 0,
                updateAudit ? `Found ${updateAudit.length} audit row` : 'No audit log found'
            );
        } catch (err) {
            test('B) UPDATE obra', false, `Error: ${err.message}`);
        }
    }

    // TEST C: Delete obra → domain.obra_deleted
    if (obraId) {
        try {
            const { error: deleteError } = await adminClient
                .from('obras')
                .delete()
                .eq('id', obraId);

            if (deleteError) throw deleteError;

            await new Promise(resolve => setTimeout(resolve, 100));

            const { data: deleteAudit } = await adminClient
                .from('audit_logs')
                .select('action')
                .eq('org_id', org.id)
                .eq('action', 'domain.obra_deleted')
                .eq('entity_id', obraId);

            test(
                'C) DELETE obra → domain.obra_deleted',
                deleteAudit && deleteAudit.length > 0,
                deleteAudit ? `Found ${deleteAudit.length} audit row` : 'No audit log found'
            );
        } catch (err) {
            test('C) DELETE obra', false, `Error: ${err.message}`);
        }
    }

    // TEST D: Insert + delete expense → domain.expense_created/deleted
    try {
        const { data: expense, error } = await adminClient
            .from('expenses')
            .insert({
                org_id: org.id,
                description: `Test Expense ${Date.now()}`,
                amount: 100.50
            })
            .select('id')
            .single();

        if (error) throw error;

        await new Promise(resolve => setTimeout(resolve, 100));

        const { data: expenseAudit } = await adminClient
            .from('audit_logs')
            .select('action')
            .eq('org_id', org.id)
            .eq('action', 'domain.expense_created')
            .eq('entity_id', expense.id);

        test(
            'D) INSERT expense → domain.expense_created',
            expenseAudit && expenseAudit.length > 0,
            expenseAudit ? `Found ${expenseAudit.length} audit row` : 'No audit log found'
        );

        // Cleanup
        await adminClient.from('expenses').delete().eq('id', expense.id);
    } catch (err) {
        test('D) INSERT expense', false, `Error: ${err.message}`);
    }

    // Final audit count
    const { count: finalCount } = await adminClient
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id);

    const delta = (finalCount || 0) - (baselineCount || 0);
    console.log(`\n📊 Final audit count: ${finalCount || 0} (delta: +${delta})\n`);

    // Print results table
    console.log('═'.repeat(80));
    console.log('TEST RESULTS');
    console.log('═'.repeat(80));
    console.log(`${'TEST NAME'.padEnd(50)} | ${'STATUS'.padEnd(6)} | DETAILS`);
    console.log('─'.repeat(80));

    results.tests.forEach(t => {
        const statusEmoji = t.status === 'PASS' ? '✅' : '❌';
        console.log(`${t.name.padEnd(50)} | ${(statusEmoji + ' ' + t.status).padEnd(8)} | ${t.details}`);
    });

    console.log('═'.repeat(80));
    console.log(`\nSUMMARY: ${results.passed}/${results.total} passed | ${results.failed} failed\n`);

    if (results.failed > 0) {
        console.error('❌ TESTS FAILED');
        process.exit(1);
    } else {
        console.log('✅ ALL TESTS PASSED');
        process.exit(0);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
