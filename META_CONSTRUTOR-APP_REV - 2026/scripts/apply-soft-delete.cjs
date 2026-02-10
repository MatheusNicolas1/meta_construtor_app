const fs = require('fs');
const { Client } = require('pg');

const DB_URL = 'postgres://postgres:postgres@127.0.0.1:54322/postgres';

async function run() {
    console.log('Connecting to DB...');
    const client = new Client({ connectionString: DB_URL });

    try {
        await client.connect();
        console.log('Connected.');

        const sql = fs.readFileSync('supabase/migrations/20260210140000_soft_delete.sql', 'utf8');
        console.log('Applying Soft Delete migration...');

        await client.query(sql);
        console.log('Soft Delete migration applied.');

    } catch (e) {
        console.error('Error applying migration:', e);
    } finally {
        await client.end();
    }
}

run();
