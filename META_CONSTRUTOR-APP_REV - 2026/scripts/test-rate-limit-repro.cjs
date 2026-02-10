const { spawn } = require('child_process');
const http = require('http');

// Config
const FUNCTIONS_PORT = 54399; // Unique port to avoid conflicts
const ENDPOINT = `http://127.0.0.1:${FUNCTIONS_PORT}/functions/v1/health-check`;
const TIMEOUT_MS = 30000;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function startSupabaseServe() {
    console.log(`[INFO] Spawning 'supabase functions serve' on port ${FUNCTIONS_PORT}...`);
    // NOTE: Windows might need .cmd or npx
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = ['supabase', 'functions', 'serve', '--no-verify-jwt', '--env-file', 'supabase/.env.local', '--port', FUNCTIONS_PORT.toString()];
    // If supabase/config.toml exists, it might enforce port. We try passing --port.

    // Check if port needs to be forced in config or if flag works. Standard CLI has --port.
    // If not, we might fail. Let's try.

    const child = spawn(cmd, args, {
        cwd: process.cwd(),
        shell: true,
        stdio: 'pipe'
    });

    child.stdout.on('data', (data) => {
        // console.log(`[SERVE]: ${data}`);
    });

    child.stderr.on('data', (data) => {
        // console.error(`[SERVE ERR]: ${data}`);
    });

    return child;
}

async function waitForReadiness() {
    console.log('[INFO] Waiting for function readiness...');
    const start = Date.now();
    while (Date.now() - start < TIMEOUT_MS) {
        try {
            const res = await request(ENDPOINT);
            if (res.status === 200 || res.status === 429) {
                console.log('[INFO] Endpoint valid.');
                return true;
            }
        } catch (e) {
            // ignore ref connection
        }
        await sleep(1000);
    }
    return false;
}

async function runTests() {
    console.log('[TEST] Starting 3 sequential requests...');

    try {
        // Req 1
        const r1 = await request(ENDPOINT);
        console.log(`Req 1: ${r1.status}`);
        if (r1.status !== 200) { console.error('Req 1 failed', r1.body); return false; }

        // Req 2
        const r2 = await request(ENDPOINT);
        console.log(`Req 2: ${r2.status}`);
        if (r2.status !== 200) { console.error('Req 2 failed', r2.body); return false; }

        // Req 3 (Should be 429)
        const r3 = await request(ENDPOINT);
        console.log(`Req 3: ${r3.status}`);

        if (r3.status === 429) {
            console.log('✅ PASS: Got 429 on 3rd request.');
            try {
                const body = JSON.parse(r3.body);
                console.log('Body:', JSON.stringify(body, null, 2));
            } catch (e) {
                console.log('Body (raw):', r3.body);
            }
            return true;
        } else {
            console.error(`❌ FAIL: Expected 429, got ${r3.status}`);
            console.log('Body:', r3.body);
            return false;
        }

    } catch (e) {
        console.error('Error during HTTP tests:', e);
        return false;
    }
}

async function main() {
    let child;
    try {
        child = await startSupabaseServe();
        const ready = await waitForReadiness();
        if (!ready) {
            console.error('❌ Failed to start supabase functions serve or timeout.');
            process.exit(1);
        }

        const success = await runTests();
        if (!success) process.exit(1);

    } catch (e) {
        console.error('Unexpected error:', e);
        process.exit(1);
    } finally {
        if (child) {
            console.log('[INFO] Killing process...');
            // Tree kill might be needed on Windows, but let's try standard kill
            const killCmd = process.platform === 'win32' ? `taskkill /pid ${child.pid} /t /f` : `kill -9 ${child.pid}`;
            try {
                process.kill(child.pid, 'SIGTERM');
                // Force kill if needed
                // require('child_process').execSync(killCmd); 
            } catch (e) { /* ignore */ }
        }
        console.log('[INFO] Done.');
    }
}

main();
