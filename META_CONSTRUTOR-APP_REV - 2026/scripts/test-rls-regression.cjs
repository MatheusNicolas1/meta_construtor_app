const { execSync } = require('child_process');

console.log('=== M8.2: RLS Regression Suite ===');
console.log('Running valid flow tests (test-rls.js)...');

try {
    execSync('node scripts/test-rls.js', { stdio: 'inherit' });
    console.log('\n✅ Valid flow tests PASSED');
} catch (e) {
    console.error('\n❌ Valid flow tests FAILED');
    process.exit(1);
}

console.log('\nRunning attack vector tests (attack-rls.js)...');

try {
    execSync('node scripts/attack-rls.js', { stdio: 'inherit' });
    console.log('\n✅ Attack vector tests PASSED');
} catch (e) {
    console.error('\n❌ Attack vector tests FAILED');
    process.exit(1);
}

console.log('\n✅✅✅ M8.2 REGRESSION SUITE PASSED ✅✅✅');
