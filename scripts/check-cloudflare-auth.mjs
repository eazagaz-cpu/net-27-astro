/**
 * check-cloudflare-auth.mjs — confirms this project can talk to the right
 * Cloudflare account before you rely on it.
 *
 * Wrangler keeps its OAuth login in ONE place per machine, shared by every
 * project. Running `wrangler login` in another repo silently repoints this one
 * at whatever account you picked there, and the next deploy fails with a
 * confusing "Failed to automatically retrieve account IDs".
 *
 * The fix is a project-scoped API token in .env.local: wrangler loads that file
 * automatically and CLOUDFLARE_API_TOKEN outranks the shared OAuth login, so
 * this project stops caring what any other project did. This script verifies
 * that setup is actually in place and still works.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const EXPECTED_ACCOUNT_ID = '34bdd56a73c7dc40d4223f7fa255d419'; // net27.cc@gmail.com
const EXPECTED_EMAIL = 'net27.cc@gmail.com';
const API = 'https://api.cloudflare.com/client/v4';

let failed = false;
const ok = (msg) => console.log(`  ✅ ${msg}`);
const bad = (msg) => { console.log(`  ❌ ${msg}`); failed = true; };
const warn = (msg) => console.log(`  ⚠️  ${msg}`);

/** Reads a key out of .env.local without pulling in a dotenv dependency. */
function readEnvLocal(key) {
  const path = join(ROOT, '.env.local');
  if (!existsSync(path)) return null;
  for (const line of readFileSync(path, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && m[1] === key) return m[2].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

async function cf(path, token) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

console.log('=== Cloudflare Auth Check ===\n');

const token = process.env.CLOUDFLARE_API_TOKEN || readEnvLocal('CLOUDFLARE_API_TOKEN');
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || readEnvLocal('CLOUDFLARE_ACCOUNT_ID');

if (!token) {
  bad('No CLOUDFLARE_API_TOKEN in .env.local or the environment');
  console.log(`
  Without it, wrangler falls back to the machine-wide OAuth login, which any
  other project can repoint at a different account.

  Create one at https://dash.cloudflare.com/profile/api-tokens
    → Create Token → "Cloudflare Pages" template (Edit)
    → add permission: Account · Account Settings · Read
    → Account Resources: ${EXPECTED_EMAIL}'s Account
  Then add to .env.local:  CLOUDFLARE_API_TOKEN=<the token>
`);
  process.exit(1);
}
ok('CLOUDFLARE_API_TOKEN found');

if (!accountId) warn('CLOUDFLARE_ACCOUNT_ID not set — wrangler will have to look the account up');
else if (accountId !== EXPECTED_ACCOUNT_ID) bad(`CLOUDFLARE_ACCOUNT_ID is ${accountId}, expected ${EXPECTED_ACCOUNT_ID}`);
else ok('CLOUDFLARE_ACCOUNT_ID points at the net27 account');

const verify = await cf('/user/tokens/verify', token);
if (!verify.success) bad(`Token rejected: ${verify.errors?.[0]?.message ?? 'unknown error'}`);
else if (verify.result.status !== 'active') bad(`Token status is "${verify.result.status}", not active`);
else ok('Token is valid and active');

// A token can verify fine and still lack the permissions that matter, which is
// exactly how the previous one failed — so exercise the real Pages endpoint.
const projects = await cf(`/accounts/${EXPECTED_ACCOUNT_ID}/pages/projects`, token);
if (!projects.success) {
  bad(`Cannot list Pages projects: ${projects.errors?.[0]?.message ?? 'unknown error'}`);
  console.log('\n  The token is missing "Cloudflare Pages · Edit" for this account.\n');
} else {
  const names = projects.result.map((p) => p.name);
  ok(`Pages reachable — ${names.length} project(s): ${names.join(', ')}`);
  if (!names.includes('net-27-astro')) bad('Project "net-27-astro" not visible to this token');
}

console.log(`\n${failed ? '❌ Cloudflare auth needs attention (see above)' : '✅ Cloudflare auth is good — deploys will work'}`);
process.exit(failed ? 1 : 0);
