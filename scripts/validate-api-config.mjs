import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
let errors = 0;

function check(label, condition) {
  if (condition) { console.log(`  ✅ ${label}`); }
  else { console.log(`  ❌ ${label}`); errors++; }
}

console.log('=== API Config Validation ===\n');

// Check .env.example exists
check('.env.example exists', existsSync(join(ROOT, '.env.example')));

// Check no hardcoded API keys in src/
const srcFiles = ['src/lib/tmdb.ts', 'src/lib/apis/omdb.ts', 'src/lib/apis/youtube.ts', 'src/lib/apis/watchmode.ts', 'src/lib/apis/tvmaze.ts'];
for (const f of srcFiles) {
  const path = join(ROOT, f);
  if (existsSync(path)) {
    const content = readFileSync(path, 'utf-8');
    const hasHardcodedKey = /apikey\s*[:=]\s*['"][a-zA-Z0-9]{10,}['"]/i.test(content);
    check(`${f} — no hardcoded API keys`, !hasHardcodedKey);
  }
}

// Check functions exist
const functions = ['functions/api/tmdb/category.js', 'functions/api/tmdb/search.js', 'functions/api/tmdb/details.js', 'functions/api/tmdb/person.js', 'functions/api/media/enrich.js'];
for (const f of functions) {
  check(`${f} exists`, existsSync(join(ROOT, f)));
}

// Check API adapter files exist
const adapters = ['src/lib/apis/omdb.ts', 'src/lib/apis/youtube.ts', 'src/lib/apis/tvmaze.ts', 'src/lib/apis/watchmode.ts', 'src/lib/apiAggregator.ts', 'src/lib/apiTypes.ts'];
for (const f of adapters) {
  check(`${f} exists`, existsSync(join(ROOT, f)));
}

console.log(`\n${errors === 0 ? '✅ All checks passed!' : `❌ ${errors} check(s) failed`}`);
process.exit(errors > 0 ? 1 : 0);
