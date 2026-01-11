#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Domains that must not appear in client-side code
const forbidden = [
  'api.openai.com',
  'api.anthropic.com',
  'claude.ai',
  'api.cohere.ai',
  'api.deepgram.com',
  'openai.com/v1',
];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      // skip node_modules and .next
      if (f === 'node_modules' || f === '.next' || f === 'dist') continue;
      walk(full, fileList);
    } else if (/\.(ts|tsx|js|jsx)$/.test(f)) {
      fileList.push(full);
    }
  }
  return fileList;
}

// Only scan client-side code under src/components and src/app (pages/components may include server code)
const roots = [path.resolve(__dirname, '..', 'src', 'components'), path.resolve(__dirname, '..', 'src', 'app')];

let violations = [];
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  const files = walk(root);
  for (const file of files) {
    // Heuristic: skip server-only files by path segments (api, route.ts) and server folders
    if (file.includes(path.join('src', 'app', 'api')) || /route\.ts$/.test(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const d of forbidden) {
      if (src.includes(d)) {
        violations.push({ file: path.relative(process.cwd(), file), domain: d });
      }
    }
  }
}

if (violations.length > 0) {
  console.error('Forbidden external AI domains found in client-side code:');
  for (const v of violations) {
    console.error(` - ${v.file}: ${v.domain}`);
  }
  process.exit(2);
} else {
  console.log('No forbidden external AI domains found in client-side code.');
  process.exit(0);
}
