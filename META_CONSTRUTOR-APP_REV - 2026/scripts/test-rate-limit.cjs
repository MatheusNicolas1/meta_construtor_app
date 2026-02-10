// Node 18+ has fetch built-in.

const URL = 'http://localhost:54321/functions/v1/health-check';

async function run() {
    console.log(`Testing Rate Limit at ${URL} (Limit: 2)`);

    for (let i = 1; i <= 3; i++) {
        const start = Date.now();
        try {
            const res = await fetch(URL, {
                method: 'GET',
            });
            const body = await res.json();
            const duration = Date.now() - start;

            console.log(`Req ${i}: Status ${res.status} (${duration}ms)`);

            if (i === 3) {
                if (res.status !== 429) {
                    console.error('❌ Expected 429, got', res.status);
                    console.log('Body:', JSON.stringify(body, null, 2));
                    process.exit(1);
                } else {
                    console.log('✅ Body:', JSON.stringify(body, null, 2));
                    if (body.error !== 'rate_limited') {
                        console.error('❌ Expected error: "rate_limited"');
                        process.exit(1);
                    }
                }
            } else {
                if (res.status !== 200) {
                    console.error('❌ Expected 200, got', res.status);
                    console.log('Body:', JSON.stringify(body));
                }
            }
        } catch (e) {
            console.error(`Req ${i} Failed:`, e.message);
        }
    }
}

// Check for global fetch, otherwise warn
if (typeof fetch === 'undefined') {
    console.error('This script requires Node 18+ or a fetch polyfill.');
    process.exit(1);
}

run();
