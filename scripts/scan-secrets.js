const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IGNORED = ["node_modules", ".git", "dist", ".next", "logs"];

const KEY_PATTERNS = [
  /sk_live_[A-Za-z0-9]+/g,
  /sk_test_[A-Za-z0-9]+/g,
  /AIza[0-9A-Za-z\-_]{35}/g,
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN PRIVATE KEY-----/g,
];

function walk(dir, cb) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (IGNORED.includes(f)) continue;
      walk(full, cb);
    } else {
      cb(full);
    }
  }
}

const findings = [];
walk(ROOT, (file) => {
  try {
    const rel = path.relative(ROOT, file);
    if (rel.startsWith(".") || /node_modules/.test(rel)) return;
    const text = fs.readFileSync(file, "utf8");
    KEY_PATTERNS.forEach((rx) => {
      const m = text.match(rx);
      if (m && m.length) findings.push({ file: rel, pattern: rx.toString(), matches: m.slice(0, 5) });
    });
  } catch (e) {
    // ignore binary files or unreadable files
  }
});

if (findings.length === 0) {
  console.log("No likely secrets found.");
  process.exit(0);
}

console.log("Potential secrets detected:");
for (const f of findings) {
  console.log(`- ${f.file}  (${f.pattern})  matches: ${f.matches.join(", ")}`);
}
process.exit(2);
