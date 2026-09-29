#!/usr/bin/env node
/**
 * dmca-gmail-auth.mjs — one-time setup that lets .github/workflows/dmca-watch.yml
 * read the inbox where DMCA notices arrive.
 *
 *   npm run dmca:setup -- --client path/to/client_secret.json
 *
 * The client file is the "Desktop app" OAuth client downloaded from Google
 * Cloud (Gmail API enabled). This opens a Google sign-in in the browser, asks
 * for read-only Gmail access, and writes GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET,
 * GMAIL_REFRESH_TOKEN and GMAIL_ADDRESS straight into the repo's GitHub
 * secrets as eazagaz-cpu (the repo-pinned login, whatever gh's active account
 * is). Nothing is printed and nothing is written to disk.
 *
 * The npm script runs the auth preflight first; do not call this directly.
 */
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ID = JSON.parse(readFileSync(join(ROOT, '.project-identity.json'), 'utf8'));
const REPO = `${ID.githubOwner}/${ID.githubRepo}`;
const SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

const at = process.argv.indexOf('--client');
const clientPath = at > 0 ? process.argv[at + 1] : null;
if (!clientPath) {
  console.error('Usage: npm run dmca:setup -- --client path/to/client_secret.json');
  process.exit(1);
}
const raw = JSON.parse(readFileSync(clientPath, 'utf8'));
const client = raw.installed ?? raw.web;
if (!client?.client_id || !client?.client_secret) {
  console.error('❌ That file is not an OAuth client (expected "installed.client_id"). Download the Desktop app client JSON.');
  process.exit(1);
}

// The repo-pinned GitHub login, same as the git credential helper in .git/config.
let ghToken;
try {
  ghToken = execFileSync('gh', ['auth', 'token', '--user', ID.githubOwner], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
} catch {
  console.error(`❌ gh has no login for ${ID.githubOwner}. Run: gh auth login (as ${ID.githubOwner}) — do not switch other repos' accounts.`);
  process.exit(1);
}

const verifier = randomBytes(32).toString('base64url');
const challenge = createHash('sha256').update(verifier).digest('base64url');
const state = randomBytes(16).toString('hex');
let redirect;

const code = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    if (u.pathname !== '/') { res.writeHead(404).end(); return; }
    const ok = u.searchParams.get('state') === state && u.searchParams.get('code');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      .end(ok ? '<h2>Done — you can close this tab.</h2>' : `<h2>Sign-in failed: ${u.searchParams.get('error') ?? 'bad state'}</h2>`);
    server.close();
    ok ? resolve(u.searchParams.get('code')) : reject(new Error(u.searchParams.get('error') ?? 'state mismatch'));
  });
  server.listen(0, '127.0.0.1', () => {
    redirect = `http://127.0.0.1:${server.address().port}`;
    const auth = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
      client_id: client.client_id, redirect_uri: redirect, response_type: 'code', scope: SCOPE,
      access_type: 'offline', prompt: 'consent', state, code_challenge: challenge, code_challenge_method: 'S256',
    });
    console.log('\nOpening Google sign-in. Sign in with the inbox that receives DMCA notices.');
    console.log(`If no browser opens, paste this link:\n${auth}\n`);
    if (process.platform === 'win32') spawn('rundll32', ['url.dll,FileProtocolHandler', auth], { detached: true, stdio: 'ignore' }).unref();
    else spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [auth], { detached: true, stdio: 'ignore' }).unref();
  });
  setTimeout(() => { server.close(); reject(new Error('timed out after 5 minutes')); }, 300_000).unref();
});

const tok = await (await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: client.client_id, client_secret: client.client_secret, code,
    code_verifier: verifier, redirect_uri: redirect, grant_type: 'authorization_code',
  }),
})).json();
if (!tok.refresh_token) {
  console.error(`❌ Google returned no refresh token (${tok.error ?? 'unknown'}${tok.error_description ? `: ${tok.error_description}` : ''}).`);
  process.exit(1);
}

const profile = await (await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
  headers: { Authorization: `Bearer ${tok.access_token}` },
})).json();
if (!profile.emailAddress) { console.error('❌ Gmail API refused the token — is the Gmail API enabled in that Google Cloud project?'); process.exit(1); }

const secrets = {
  GMAIL_CLIENT_ID: client.client_id,
  GMAIL_CLIENT_SECRET: client.client_secret,
  GMAIL_REFRESH_TOKEN: tok.refresh_token,
  GMAIL_ADDRESS: profile.emailAddress,
};
for (const [name, value] of Object.entries(secrets)) {
  execFileSync('gh', ['secret', 'set', name, '--repo', REPO], {
    input: value, env: { ...process.env, GH_TOKEN: ghToken }, stdio: ['pipe', 'ignore', 'inherit'],
  });
  console.log(`  ✅ ${name} saved to ${REPO}`);
}
console.log(`\nDone. The watcher now reads ${profile.emailAddress.replace(/^(.).*(@.*)$/, '$1***$2')}.`);
console.log('Test it now: GitHub → Actions → "DMCA Watcher" → Run workflow.');
