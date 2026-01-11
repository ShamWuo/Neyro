const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'tmp');

const SEARCH_TERMS = [
  'openai',
  'api.openai.com',
  'createChatCompletion',
  'createCompletion',
  'chat.completions',
  'anthropic',
  'claude',
  'gpt-4',
  'gpt-4o',
  'openai.create',
  'fetch(',
];

function walk(dir) {
  const out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (it.name === 'node_modules' || it.name === '.git' || it.name === 'tmp') continue;
      out.push(...walk(full));
    } else if (/\.([tj]s|tsx|jsx|json|md)$/.test(it.name)) {
      out.push(full);
    }
  }
  return out;
}

function scanFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  // Remove block and line comments to avoid false positives in commented examples
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\n)\s*\/\/.*/g, '\n');
  const lines = stripped.split(/\r?\n/);
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    for (const term of SEARCH_TERMS) {
      if (l.toLowerCase().includes(term.toLowerCase())) {
        matches.push({ line: i + 1, text: l.trim(), term });
      }
    }
  }
  return matches;
}

function run() {
  if (!fs.existsSync(SRC)) {
    console.error('src/ folder not found; aborting');
    process.exit(2);
  }
  const files = walk(SRC);
  const rawCalls = [];
  const safeWrapperFiles = [];

  for (const f of files) {
    const matches = scanFile(f);
    if (matches.length) {
      // Record if file uses our safe wrapper(s)
      const text = fs.readFileSync(f, 'utf8');
      if (
        text.includes('analyzeParaCaptureSafe') ||
        text.includes('prompt-logger') ||
        text.includes('safeFetch') ||
        text.includes('safe-fetch') ||
        text.includes('safe-fetch-url') ||
        text.includes('safeFetchUrlChecked')
      ) {
        safeWrapperFiles.push(f.replace(ROOT + path.sep, ''));
      }

      rawCalls.push({ file: f.replace(ROOT + path.sep, ''), matches });
    }
  }

  // Identify unwrapped server-side fetch calls: files that mention fetch( but do not import/use safe wrappers and are not client-only
  const unwrappedServerCalls = [];
  for (const entry of rawCalls) {
    const fullPath = path.join(ROOT, entry.file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const isClient = /(^|\n)\s*["']use client["']/.test(content) || /\b(window|document|navigator|localStorage|sessionStorage|FormData|Blob)\b/.test(content);
    const hasSafe = safeWrapperFiles.includes(entry.file);
    if (!isClient && !hasSafe) {
      // Does the file contain a direct fetch( or openai/anthropic client usage?
      const hasDirectFetch = /\bfetch\s*\(/.test(content);
      const hasDirectOpenAI = /openai|api\.openai\.com|anthropic|claude|gpt-4/.test(content.toLowerCase());
      if (hasDirectFetch || hasDirectOpenAI) {
        unwrappedServerCalls.push(entry.file);
      }
    }
  }

  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const outPath = path.join(OUT, 'ai-audit.json');
  const out = { timestamp: new Date().toISOString(), rawCalls, safeWrapperFiles, unwrappedServerCalls };
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('AI audit complete — results:', outPath);
}

if (require.main === module) run();
