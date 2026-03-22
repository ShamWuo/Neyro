import * as fs from 'fs';
import * as path from 'path';

const projectRoot = __dirname;
const srcDir = path.join(projectRoot, 'src');

interface ValidationResult {
    passed: boolean;
    checks: { name: string; status: 'pass' | 'fail'; message?: string }[];
}

const result: ValidationResult = { passed: true, checks: [] };

function check(name: string, condition: boolean, message?: string) {
    result.checks.push({
        name,
        status: condition ? 'pass' : 'fail',
        message: condition ? undefined : message,
    });
    if (!condition) result.passed = false;
}

// Essential Files
check('package.json exists', fs.existsSync(path.join(projectRoot, 'package.json')));
check('tsconfig.json exists', fs.existsSync(path.join(projectRoot, 'tsconfig.json')));
check('app.json exists', fs.existsSync(path.join(projectRoot, 'app.json')));

// Core Directories
check('src/store exists', fs.existsSync(path.join(srcDir, 'store')));
check('src/components exists', fs.existsSync(path.join(srcDir, 'components')));
check('src/services exists', fs.existsSync(path.join(srcDir, 'services')));

// Critical Files
check('src/services/classifierService.ts exists', fs.existsSync(path.join(srcDir, 'services', 'classifierService.ts')));
check('src/store/useNeyroStore.ts exists', fs.existsSync(path.join(srcDir, 'store', 'useNeyroStore.ts')));
check('NEYRO_OVERVIEW.md exists', fs.existsSync(path.join(projectRoot, 'NEYRO_OVERVIEW.md')));

console.log('\n=== Neyro Project Verification ===\n');
result.checks.forEach(c => console.log(`${c.status === 'pass' ? '✅' : '❌'} ${c.name}`));

if (result.passed) {
    console.log('\n✅ All checks passed.');
    process.exit(0);
} else {
    console.error('\n❌ Verification failed.');
    process.exit(1);
}
