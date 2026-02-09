import { createClient } from '@supabase/supabase-js';

const URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const client = createClient(URL, ANON_KEY);

async function testSignup() {
    const email = `signup_test_${Date.now()}@test.com`;
    const password = 'Test123!@#';

    console.log('Attempting signup:', email);
    console.log('Timestamp:', new Date().toISOString());

    const { data, error } = await client.auth.signUp({
        email,
        password
    });

    if (error) {
        console.log('\n=== SIGNUP ERROR ===');
        console.log('Status:', error.status);
        console.log('Message:', error.message);
        console.log('Code:', error.code);
        console.log('Full error object:', JSON.stringify(error, null, 2));
        process.exit(1);
    }

    console.log('\n=== SIGNUP SUCCESS ===');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    process.exit(0);
}

testSignup().catch(e => {
    console.error('Uncaught error:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
});
