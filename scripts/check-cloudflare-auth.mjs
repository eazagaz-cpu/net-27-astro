/**
 * check-cloudflare-auth.mjs — confirms this project can reach the right
 * Cloudflare account before you rely on it.
 *
 * Wrangler keeps its OAuth login in ONE machine-wide location shared by every
 * repo, so `wrangler login` in another project silently repoints this one at
 * whatever account you picked there, and the next command fails with a
 * confusing "Failed to automatically retrieve account IDs".
 *
 * Two setups avoid that, and this script accepts either:
 *   - a private login under .cf-auth/ (see scripts/wrangler.mjs), or
 *   - a CLOUDFLARE_API_TOKEN in .env.local, which outranks the shared login.
 */
import { readFileSync, existsSync } from 'fs';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ACCOUNT_ID = '34bdd56a73c7dc40d4223f7fa255d419';
const EMAIL = 'net27.cc@gmail.com';
const API = 'https://api.cloudflare.com/client/v4';

let failed = false;
const ok = (m) => console.log(`  ✅ ${m}`);
const bad = (m) => { console.log(`  ❌ ${m}`); failed = true; };
const warn = (m) => console.log(`  ⚠️  ${m}`);

/** Reads one key out of .env.local without adding a dotenv dependency. */
function fromEnvLocal(key) {
  const path = join(ROOT, '.env.local');
  if (!existsSync(path)) return null;
  for (const line of readFileSync(path, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && m[1] === key) return m[2].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

console.log('=== Cloudflare Auth Check ===\n');

const token = process.env.CLOUDFLARE_API_TOKEN || fromEnvLocal('CLOUDFLARE_API_TOKEN');
const hasPrivateStore = existsSync(join(ROOT, '.cf-auth', '.wrangler', 'config', 'default.toml'));

if (token) ok('Using CLOUDFLARE_API_TOKEN from .env.local (outranks the shared login)');
else if (hasPrivateStore) ok('Using this project\'s private login under .cf-auth/');
else {
  bad('No project-scoped credential — wrangler will fall back to the machine-wide login');
  console.log(`
  That shared login is whatever the last 'wrangler login' on this machine
  picked, from any project. Fix it once with either:

    npm run cf:login     (one browser click, stores a private login here)

  or a token from https://dash.cloudflare.com/profile/api-tokens
  ("Cloudflare Pages" template + Account · Account Settings · Read),
  added to .env.local as CLOUDFLARE_API_TOKEN=...
`);
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || fromEnvLocal('CLOUDFLARE_ACCOUNT_ID');
if (!accountId) warn('CLOUDFLARE_ACCOUNT_ID not set — wrangler has to look the account up');
else if (accountId !== ACCOUNT_ID) bad(`CLOUDFLARE_ACCOUNT_ID is ${accountId}, expected ${ACCOUNT_ID}`);
else ok('CLOUDFLARE_ACCOUNT_ID points at the net27 account');

// A token can verify as "active" and still lack the permissions that matter —
// that is exactly how the previous one failed — so always exercise the real
// Pages endpoint rather than trusting a status field.
if (token) {
  const res = await fetch(`${API}/accounts/${ACCOUNT_ID}/pages/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  if (!res.success) {
    bad(`Token cannot list Pages projects: ${res.errors?.[0]?.message ?? 'unknown error'}`);
    console.log('\n  It is missing "Cloudflare Pages · Edit" on this account.\n');
  } else {
    const names = res.result.map((p) => p.name);
    ok(`Pages reachable — ${names.length} project(s): ${names.join(', ')}`);
    if (!names.includes('net-27-astro')) bad('Project "net-27-astro" is not visible to this token');
  }
} else {
  // Go through the wrapper so we test the private store, not the shared one.
  try {
    const { stdout } = await run(process.execPath, [join(ROOT, 'scripts', 'wrangler.mjs'), 'whoami']);
    if (stdout.includes(EMAIL)) ok(`Logged in as ${EMAIL}`);
    else {
      const seen = stdout.match(/associated with the email ([^\s.]+)/)?.[1];
      bad(`Logged in as ${seen ?? 'an unknown account'}, expected ${EMAIL}`);
    }
    if (stdout.includes(ACCOUNT_ID)) ok('Account ID matches net27');
    else bad('net27 account ID not listed for this login');
  } catch {
    bad('wrangler could not authenticate — run: npm run cf:login');
  }
}

console.log(`\n${failed ? '❌ Cloudflare auth needs attention (see above)' : '✅ Cloudflare auth is good — deploys will work'}`);
process.exit(failed ? 1 : 0);
