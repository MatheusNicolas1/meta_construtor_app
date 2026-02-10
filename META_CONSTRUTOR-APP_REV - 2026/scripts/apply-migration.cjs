const fs = require('fs');
const { Client } = require('pg');

const DB_URL = 'postgres://postgres:postgres@127.0.0.1:54322/postgres';

async function run() {
    console.log('Connecting to DB...');
    const client = new Client({ connectionString: DB_URL });

    try {
        await client.connect();
        console.log('Connected.');

        const sql = fs.readFileSync('supabase/migrations/20260210130000_create_rate_limits.sql', 'utf8');
        console.log('Applying migration...');

        await client.query(sql);
        console.log('Migration applied successfully.');

        // Verify function exists
        const res = await client.query("SELECT proname FROM pg_proc WHERE proname = 'check_rate_limit'");
        console.log('Function check:', res.rows);

    } catch (e) {
        console.error('Error applying migration:', e);
    } finally {
        await client.end();
    }
}

run();
