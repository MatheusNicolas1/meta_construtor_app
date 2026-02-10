const http = require('http');

function makeRequest(i) {
    return new Promise((resolve) => {
        const req = http.request('http://localhost:54321/functions/v1/health-check', { method: 'GET' }, (res) => {
            console.log(`Request ${i}: Status ${res.statusCode}`);
            res.on('data', () => { }); // Consume
            resolve();
        });
        req.on('error', (e) => {
            console.log(`Request ${i}: Error ${e.message}`);
            resolve();
        });
        req.end();
    });
}

async function run() {
    await makeRequest(1);
    await makeRequest(2);
    await makeRequest(3);
}

run();
