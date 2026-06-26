import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

const LOCALES_DIR = 'src/i18n/locales';
let errors = 0;
let warnings = 0;

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys.push(...getKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function getValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

console.log('=== i18n Validation ===\n');

try {
  const enRaw = await readFile(join(LOCALES_DIR, 'en.json'), 'utf-8');
  const en = JSON.parse(enRaw);
  const enKeys = getKeys(en);
  console.log(`  English keys: ${enKeys.length}\n`);

  const files = await readdir(LOCALES_DIR);
  const localeFiles = files.filter(f => f.endsWith('.json') && f !== 'en.json');

  for (const file of localeFiles) {
    const lang = file.replace('.json', '');
    try {
      const raw = await readFile(join(LOCALES_DIR, file), 'utf-8');
      const locale = JSON.parse(raw);
      const localeKeys = getKeys(locale);

      const missing = enKeys.filter(k => !localeKeys.includes(k));
      const extra = localeKeys.filter(k => !enKeys.includes(k));
      const empty = localeKeys.filter(k => {
        const v = getValue(locale, k);
        return typeof v === 'string' && v.trim() === '';
      });

      if (missing.length === 0 && extra.length === 0 && empty.length === 0) {
        console.log(`  OK: ${lang} (${localeKeys.length} keys)`);
      } else {
        if (missing.length > 0) {
          console.error(`  ERROR: ${lang} missing ${missing.length} keys: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
          errors += missing.length;
        }
        if (extra.length > 0) {
          console.warn(`  WARN: ${lang} has ${extra.length} extra keys: ${extra.slice(0, 3).join(', ')}${extra.length > 3 ? '...' : ''}`);
          warnings += extra.length;
        }
        if (empty.length > 0) {
          console.warn(`  WARN: ${lang} has ${empty.length} empty values: ${empty.slice(0, 3).join(', ')}${empty.length > 3 ? '...' : ''}`);
          warnings += empty.length;
        }
      }
    } catch (e) {
      console.error(`  ERROR: ${lang} — ${e.message}`);
      errors++;
    }
  }

  console.log(`\nLocales checked: ${localeFiles.length + 1}`);
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);

  if (errors > 0) {
    console.log('\nFAILED: Fix missing keys');
    process.exit(1);
  }
  console.log('\nPASSED');
} catch (e) {
  console.error('Validation failed:', e.message);
  process.exit(1);
}
