const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', 'tmp', 'ai-audit.json');

if (!fs.existsSync(out)) {
  console.error('AI audit not found; run `node scripts/audit-ai-calls.js` first');
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(out, 'utf8'));
const raw = data.rawCalls || [];
const safeWrappers = new Set((data.safeWrapperFiles || []).map((p) => p.replace(/\\/g, '/')));

// Consider only server-side files as actionable: /src/app/api and /src/lib
const actionable = raw.filter((r) => {
  const file = r.file.replace(/\\/g, '/');
  const wrapped = safeWrappers.has(file);

  // Quick heuristic: ignore files that are clearly client-only (contain 'use client' or window/FormData usage)
  let text = '';
  try {
    text = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  } catch (e) {}
  const looksClient = /("use client"|'use client')/.test(text) || /typeof\s+window/.test(text) || /window\.|new\s+FormData\(|FormData\(/.test(text);

  // If all matches are commented-out lines, skip
  const hasNonCommentMatch = r.matches.some((m) => {
    const t = (m.text || '').trim();
    return !(t.startsWith('//') || t.startsWith('*') || t.startsWith('/*'));
  });

  const isServer = file.startsWith('src/app/api/') || file.startsWith('src/server/') || (!looksClient && file.startsWith('src/lib/'));

  return isServer && !wrapped && hasNonCommentMatch;
});

if (actionable.length === 0) {
  console.log('AI audit: no unwrapped server-side callsites found');
  process.exit(0);
}

console.error(`AI audit: found ${actionable.length} unwrapped server-side AI/LLM callsites:`);
actionable.slice(0, 50).forEach((r) => {
  console.error('-', r.file, `(${r.matches.length} matches)`);
});
console.error('Failing CI to encourage wrapping server-side external calls with safeFetch/analyzeParaCaptureSafe.');
process.exit(3);
