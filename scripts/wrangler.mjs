/**
 * wrangler.mjs — runs this project's wrangler pinned to the net27 account.
 *
 * Authentication comes from the wrangler auth profile "net27", bound to this
 * directory with `wrangler auth activate` (stored in wrangler's global config,
 * outside the repo). A token in .env.local, which wrangler loads by itself,
 * outranks that profile; both belong to the same account.
 *
 * What this wrapper adds is the account pin: wrangler reads the account from
 * CLOUDFLARE_ACCOUNT_ID ahead of anything else, and an inherited value from
 * another project would send commands to the wrong account. Run
 * `npm run auth:check` to verify the whole chain.
 *
 * Usage: node scripts/wrangler.mjs <any wrangler args>
 */
import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { cloudflareAccountId } = JSON.parse(readFileSync(join(ROOT, '.project-identity.json'), 'utf-8'));

const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: cloudflareAccountId };
// A machine-level token belongs to whichever project set it and would outrank
// this directory's profile. .env.local is unaffected: wrangler loads it itself.
delete env.CLOUDFLARE_API_TOKEN;
delete env.CF_API_TOKEN;
// Hides the profile store; an old .vscode setting pointed it at .cf-auth/.
delete env.XDG_CONFIG_HOME;

const args = process.argv.slice(2);
let cwd = ROOT;
if (args[0] === 'auth') {
  // Wrangler loads .env.local from the working directory and refuses to
  // manage profiles while it holds a token, so run from a folder without one
  // and bind the repo itself rather than that folder.
  cwd = join(ROOT, 'scripts');
  if (['activate', 'deactivate'].includes(args[1]) && args.length === (args[1] === 'activate' ? 3 : 2)) args.push(ROOT);
}

const child = spawn(process.execPath, [join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js'), ...args], {
  stdio: 'inherit',
  cwd,
  env,
});

child.on('exit', (code) => process.exit(code ?? 1));
