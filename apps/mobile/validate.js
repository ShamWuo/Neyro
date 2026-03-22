const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

console.log('\n=== Musicax App Structure Validation ===\n');

const checks = [
  { name: 'package.json', path: 'package.json' },
  { name: 'tsconfig.json', path: 'tsconfig.json' },
  { name: 'app.json', path: 'app.json' },
  { name: 'src/types/index.ts', path: 'src/types/index.ts' },
  { name: 'src/database/schema.ts', path: 'src/database/schema.ts' },
  { name: 'src/database/client.ts', path: 'src/database/client.ts' },
  { name: 'src/store/timerStore.ts', path: 'src/store/timerStore.ts' },
  { name: 'src/services/statsService.ts', path: 'src/services/statsService.ts' },
  { name: 'app/(tabs)/(index)/index.tsx', path: 'app/(tabs)/(index)/index.tsx' },
  { name: 'app/(tabs)/pieces/index.tsx', path: 'app/(tabs)/pieces/index.tsx' },
  { name: 'app/(tabs)/history/index.tsx', path: 'app/(tabs)/history/index.tsx' },
  { name: 'app/(tabs)/stats/index.tsx', path: 'app/(tabs)/stats/index.tsx' },
  { name: 'app/(tabs)/settings/index.tsx', path: 'app/(tabs)/settings/index.tsx' },
  { name: 'src/hooks/usePieces.ts', path: 'src/hooks/usePieces.ts' },
  { name: 'src/hooks/useSessions.ts', path: 'src/hooks/useSessions.ts' },
  { name: 'src/hooks/useSettings.ts', path: 'src/hooks/useSettings.ts' },
  { name: 'src/hooks/useStats.ts', path: 'src/hooks/useStats.ts' },
];

let passed = 0;
let failed = 0;

checks.forEach((check) => {
  const fullPath = path.join(projectRoot, check.path);
  const exists = fs.existsSync(fullPath);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
  if (exists) {
    passed++;
  } else {
    failed++;
  }
});

console.log(`\n=== Summary ===`);
console.log(`✅ Passed: ${passed}/${checks.length}`);
if (failed > 0) {
  console.log(`❌ Failed: ${failed}/${checks.length}`);
}

if (failed === 0) {
  console.log('\n🎉 All critical files are present! App structure is ready.');
} else {
  console.log('\n⚠️  Some files are missing.');
}
