import { createClient } from '@supabase/supabase-js';

const URL = 'http://127.0.0.1:54321';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const adminClient = createClient(URL, SERVICE_KEY);

async function testUserCreation() {
    const testEmail = `test_${Date.now()}@test.com`;

    console.log('Creating user:', testEmail);
    const { data: user, error } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true
    });

    if (error) {
        console.error('❌ User creation FAILED:');
        console.error('Error message:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        process.exit(1);
    }

    console.log('✅ User created:', user.user.id);

    // Wait for trigger
    await new Promise(r => setTimeout(r, 1000));

    // Check all tables
    const checks = await Promise.all([
        adminClient.from('profiles').select('*').eq('id', user.user.id),
        adminClient.from('orgs').select('*').eq('owner_user_id', user.user.id),
        adminClient.from('org_members').select('*').eq('user_id', user.user.id),
        adminClient.from('user_roles').select('*').eq('user_id', user.user.id),
        adminClient.from('user_settings').select('*').eq('user_id', user.user.id),
        adminClient.from('user_credits').select('*').eq('user_id', user.user.id)
    ]);

    const [profiles, orgs, orgMembers, userRoles, userSettings, userCredits] = checks;

    console.log('\n=== TRIGGER RESULTS ===');
    console.log('profiles:', profiles.data?.length ? '✅' : '❌', profiles.data);
    console.log('orgs:', orgs.data?.length ? '✅' : '❌', orgs.data);
    console.log('org_members:', orgMembers.data?.length ? '✅' : '❌', orgMembers.data);
    console.log('user_roles:', userRoles.data?.length ? '✅' : '❌', userRoles.data);
    console.log('user_settings:', userSettings.data?.length ? '✅' : '❌', userSettings.data);
    console.log('user_credits:', userCredits.data?.length ? '✅' : '❌', userCredits.data);

    const allSuccess = checks.every(c => c.data && c.data.length > 0);

    if (allSuccess) {
        console.log('\n✅✅✅ STEP 3 COMPLETE: User creation works end-to-end!');
    } else {
        console.log('\n❌ Some tables missing data');
        process.exit(1);
    }

    // Cleanup
    await adminClient.auth.admin.deleteUser(user.user.id);
}

testUserCreation().catch(e => {
    console.error('ERROR:', e.message);
    process.exit(1);
});
