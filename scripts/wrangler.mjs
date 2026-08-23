/**
 * wrangler.mjs — runs wrangler against THIS project's own credential store.
 *
 * Wrangler keeps its OAuth login in one machine-wide location, shared by every
 * repo, so `wrangler login` in another project silently repoints this one at a
 * different account and deploys start failing with "Failed to automatically
 * retrieve account IDs".
 *
 * Wrangler resolves that location through XDG_CONFIG_HOME, so pointing it at a
 * folder inside the project gives this repo a private login that nothing
 * outside it can touch. Everything here goes through this wrapper for that
 * reason — calling `wrangler` directly falls back to the shared store.
 *
 * Usage: node scripts/wrangler.mjs <any wrangler args>
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env, XDG_CONFIG_HOME: join(ROOT, '.cf-auth') };

// This repo uses a private OAuth login. A stale machine-level token can outrank
// that login and break Pages deploys, so keep wrapper calls scoped to OAuth.
delete env.CLOUDFLARE_API_TOKEN;
delete env.CF_API_TOKEN;

const child = spawn('npx', ['wrangler', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env,
});

child.on('exit', (code) => process.exit(code ?? 1));
