/**
 * preflight-auth.mjs — proves GitHub and Cloudflare point at THIS project
 * before anything is pushed, deployed or mutated.
 *
 *   npm run auth:check          local machine (VS Code, Codex, Claude, AntiGravity)
 *   node scripts/preflight-auth.mjs --ci    inside GitHub Actions
 *
 * Everything expected comes from .project-identity.json; nothing here is a
 * secret. Tokens are fetched only to make API calls and are never printed.
 *
 * This machine has three Cloudflare accounts and three GitHub accounts, and
 * both CLIs keep a single machine-wide "active" identity that any other repo
 * can flip. So the checks below verify what the tools will ACTUALLY use from
 * this directory, not what a status field claims. Any mismatch exits 1 —
 * fix the exact thing reported, never switch accounts until it goes green.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { homedir } from 'os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CI = process.argv.includes('--ci') || process.env.GITHUB_ACTIONS === 'true';
const ID = JSON.parse(readFileSync(join(ROOT, '.project-identity.json'), 'utf-8'));
const CF_API = 'https://api.cloudflare.com/client/v4';
const WRANGLER = join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

const failures = [];
const ok = (m) => console.log(`  ✅ ${m}`);
const warn = (m) => console.log(`  ⚠️  ${m}`);
const fail = (m, fix) => {
  console.log(`  ❌ ${m}${fix ? `\n     → ${fix}` : ''}`);
  failures.push(m);
};
const section = (t) => console.log(`\n── ${t}`);

/** Runs a command without a shell; returns trimmed stdout, or null on failure. */
function run(cmd, args, opts = {}) {
  try {
    return execFileSync(cmd, args, {
      cwd: ROOT, encoding: 'utf-8', timeout: 90_000,
      stdio: ['pipe', 'pipe', 'pipe'], ...opts,
    }).trim();
  } catch {
    return null;
  }
}

/** Wrangler's JSON output, run from `cwd` with `env`. */
function wranglerJson(args, cwd, env) {
  const out = run(process.execPath, [WRANGLER, ...args, '--json'], { cwd, env });
  try { return out ? JSON.parse(out) : null; } catch { return null; }
}

async function cfGet(path, token) {
  try {
    const res = await fetch(`${CF_API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    return await res.json();
  } catch (e) {
    return { success: false, errors: [{ message: e.cause?.code ?? e.message }] };
  }
}

function fromEnvLocal(key) {
  const path = join(ROOT, '.env.local');
  if (!existsSync(path)) return null;
  for (const line of readFileSync(path, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && m[1] === key) return m[2].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

/** "https://user@github.com/owner/repo.git" → { owner, repo } */
function parseGitHubUrl(url) {
  const m = url?.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  return m ? { owner: m[1], repo: m[2] } : null;
}

const samePath = (a, b) => process.platform === 'win32'
  ? resolve(a).toLowerCase() === resolve(b).toLowerCase()
  : resolve(a) === resolve(b);

console.log(`=== Auth preflight: ${ID.project} (${CI ? 'CI' : 'local'}) ===`);
console.log(`    expects GitHub ${ID.githubOwner}/${ID.githubRepo}, Cloudflare ${ID.cloudflareAccountId} / ${ID.cloudflareProject}`);

// ─────────────────────────────────────────────────────────────── TLS
section('TLS verification');
{
  const sslVerify = run('git', ['config', '--get-regexp', '^http\\..*sslverify$']) ?? '';
  const disabled = sslVerify.split('\n').filter((l) => /\s(false|0|no|off)$/i.test(l));
  if (disabled.length) fail(`git has TLS verification disabled: ${disabled.join(', ')}`,
    'git config --unset <key> (in the scope that set it) and fix the certificate instead');
  else ok('git TLS verification is on');
  if (process.env.GIT_SSL_NO_VERIFY) fail('GIT_SSL_NO_VERIFY is set', 'unset it; fix the certificate chain instead');
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') fail('NODE_TLS_REJECT_UNAUTHORIZED=0 is set', 'unset it');
}

// ─────────────────────────────────────────────────────────────── Git
section('Git repository');
let branch = null;
{
  if (CI) {
    const repo = process.env.GITHUB_REPOSITORY;
    if (repo?.toLowerCase() === `${ID.githubOwner}/${ID.githubRepo}`.toLowerCase()) ok(`Workflow repo is ${repo}`);
    else fail(`Workflow repo is ${repo ?? '(unset)'}, expected ${ID.githubOwner}/${ID.githubRepo}`);
    branch = process.env.GITHUB_REF_NAME ?? null;
  } else {
    for (const kind of ['fetch', 'push']) {
      const url = run('git', ['remote', 'get-url', ...(kind === 'push' ? ['--push'] : []), 'origin']);
      const parsed = parseGitHubUrl(url);
      if (!parsed) fail(`origin ${kind} URL is not a GitHub repo: ${url ?? '(no origin)'}`,
        `git remote set-url origin ${ID.githubRemote}`);
      else if (parsed.owner.toLowerCase() !== ID.githubOwner.toLowerCase() || parsed.repo.toLowerCase() !== ID.githubRepo.toLowerCase())
        fail(`origin ${kind} points at ${parsed.owner}/${parsed.repo}, expected ${ID.githubOwner}/${ID.githubRepo}`,
          `git remote set-url origin ${ID.githubRemote}`);
      else ok(`origin ${kind} → ${parsed.owner}/${parsed.repo}`);
    }
    branch = run('git', ['branch', '--show-current']) || null;
  }
  if (!branch) fail('Could not detect the current branch (detached HEAD?)', 'git switch <branch>');
  else if (branch === ID.productionBranch) ok(`Branch ${branch} — pushes/deploys here go to PRODUCTION`);
  else ok(`Branch ${branch} — Cloudflare builds this as a PREVIEW, not production (${ID.productionBranch})`);
}

// ─────────────────────────────────────────────────────────────── GitHub
section('GitHub identity');
if (CI) {
  ok('CI uses the built-in GITHUB_TOKEN (no personal token needed)');
} else {
  const ver = run('gh', ['--version'])?.match(/gh version (\d+)\.(\d+)\.(\d+)/);
  if (!ver) {
    fail('GitHub CLI (gh) is not installed or not on PATH', 'winget install --id GitHub.cli');
  } else {
    const [maj, min] = [+ver[1], +ver[2]];
    // 2.40 added multi-account login and `gh auth token --user`, both relied on below.
    if (maj < 2 || (maj === 2 && min < 40)) fail(`gh ${ver[0].split(' ').pop()} is too old (need ≥ 2.40)`, 'winget upgrade --id GitHub.cli');
    else ok(`gh ${ver[1]}.${ver[2]}.${ver[3]}`);

    const ownerToken = run('gh', ['auth', 'token', '--hostname', 'github.com', '--user', ID.githubOwner]);
    if (!ownerToken) {
      fail(`gh has no login for ${ID.githubOwner}`, `gh auth login --hostname github.com  (sign in as ${ID.githubOwner})`);
    } else {
      ok(`gh keyring holds a login for ${ID.githubOwner}`);

      const repo = run('gh', ['api', `repos/${ID.githubOwner}/${ID.githubRepo}`,
        '--jq', '[.owner.login, .default_branch, .permissions.push] | @tsv'],
        { env: { ...process.env, GH_TOKEN: ownerToken } });
      if (!repo) fail(`${ID.githubOwner} cannot read ${ID.githubOwner}/${ID.githubRepo} via the API`, 'gh auth refresh --user ' + ID.githubOwner);
      else {
        const [owner, defaultBranch, canPush] = repo.split('\t');
        if (owner !== ID.githubOwner) fail(`Repo owner is ${owner}, expected ${ID.githubOwner}`);
        else ok(`Repo owner is ${owner}`);
        if (canPush !== 'true') fail(`${ID.githubOwner} has no push permission on the repo`);
        if (defaultBranch !== ID.productionBranch) fail(`GitHub default branch is ${defaultBranch}, identity says ${ID.productionBranch}`);
      }
    }

    // What git will actually send on push. The global gh helper only serves
    // the ACTIVE account, so this repo has its own helper (see CLAUDE.md).
    const fill = spawnSync('git', ['credential', 'fill'], {
      cwd: ROOT, encoding: 'utf-8', timeout: 30_000,
      input: `protocol=https\nhost=github.com\npath=${ID.githubOwner}/${ID.githubRepo}.git\nusername=${ID.githubOwner}\n\n`,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
    });
    const user = fill.stdout?.match(/^username=(.*)$/m)?.[1];
    const hasPassword = /^password=.+$/m.test(fill.stdout ?? '');
    if (fill.status === 0 && user === ID.githubOwner && hasPassword) ok(`git push authenticates as ${user}`);
    else fail(`git push would not authenticate as ${ID.githubOwner} (got ${user ?? 'no credential'})`,
      'restore the repo-local credential helper — see "GitHub auth" in CLAUDE.md');

    const active = run('gh', ['api', 'user', '--jq', '.login']);
    if (active === ID.githubOwner) ok(`gh active account is ${active}`);
    else warn(`gh active account is ${active ?? 'unknown'} — git push is unaffected, but plain \`gh\` commands`
      + ` (PRs, runs, secrets) act as that user.\n     → gh auth switch --hostname github.com --user ${ID.githubOwner}`);
  }
}

// ─────────────────────────────────────────────────────────────── Cloudflare
section('Cloudflare identity');
let apiToken = null;
{
  const expected = ID.cloudflareAccountId;

  // An account ID in the environment outranks wrangler.toml and .env.local.
  const envAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (CI && !envAccount) fail('CLOUDFLARE_ACCOUNT_ID is not set', 'pass secrets.CLOUDFLARE_ACCOUNT_ID to this step');
  else if (envAccount && envAccount !== expected) fail(`CLOUDFLARE_ACCOUNT_ID in the environment is ${envAccount}, expected ${expected}`,
    CI ? 'fix the CLOUDFLARE_ACCOUNT_ID repository secret'
      : 'this shell inherited another project\'s value — remove it from user/system env vars and restart the editor/terminal');
  else if (envAccount) ok(`CLOUDFLARE_ACCOUNT_ID = ${expected}`);

  if (CI) {
    apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!apiToken) fail('CLOUDFLARE_API_TOKEN is not set', 'pass secrets.CLOUDFLARE_API_TOKEN to this step');
  } else {
    // A token in the shell environment (not .env.local) comes from the machine
    // or another project and silently outranks this directory's profile.
    for (const k of ['CLOUDFLARE_API_TOKEN', 'CF_API_TOKEN', 'CLOUDFLARE_API_KEY']) {
      if (process.env[k]) fail(`${k} is set in the shell environment`,
        'unset it (user/system env var or shell profile) — it overrides the net27 profile for every project');
    }
    if (process.env.XDG_CONFIG_HOME) fail(`XDG_CONFIG_HOME is set (${process.env.XDG_CONFIG_HOME}) — wrangler cannot see its profile store`,
      'unset it; an old .vscode setting pointed it at .cf-auth/ — reload the VS Code window');

    const localAccount = fromEnvLocal('CLOUDFLARE_ACCOUNT_ID');
    if (localAccount && localAccount !== expected) fail(`.env.local CLOUDFLARE_ACCOUNT_ID is ${localAccount}, expected ${expected}`);

    // 1. The directory binding, straight from wrangler's own store.
    const stores = [
      process.env.XDG_CONFIG_HOME && join(process.env.XDG_CONFIG_HOME, '.wrangler'),
      process.env.APPDATA && join(process.env.APPDATA, 'xdg.config', '.wrangler'),
      join(homedir(), '.config', '.wrangler'),
      join(homedir(), 'Library', 'Preferences', '.wrangler'),
      join(homedir(), '.wrangler'),
    ].filter(Boolean);
    const bindingsFile = stores.map((s) => join(s, 'profiles', 'directory-bindings.json')).find(existsSync);
    const bindings = bindingsFile ? JSON.parse(readFileSync(bindingsFile, 'utf-8')) : {};
    const bound = Object.entries(bindings).find(([dir]) => samePath(dir, ROOT))?.[1];
    if (bound === ID.cloudflareProfile) ok(`wrangler profile "${bound}" is bound to this directory`);
    else fail(`wrangler profile bound here is ${bound ? `"${bound}"` : 'none'}, expected "${ID.cloudflareProfile}"`,
      `run from OUTSIDE the repo (so .env.local is not loaded): npx wrangler auth activate ${ID.cloudflareProfile} "${ROOT}"`);

    // 2. The profile's own login. Run from scripts/ so .env.local is not
    //    loaded and wrangler has to fall back to the directory binding.
    const profileEnv = { ...process.env };
    for (const k of ['CLOUDFLARE_API_TOKEN', 'CF_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID']) delete profileEnv[k];
    const prof = wranglerJson(['whoami'], join(ROOT, 'scripts'), profileEnv);
    if (!prof?.loggedIn) fail(`profile "${ID.cloudflareProfile}" is not logged in`,
      `npx wrangler auth create ${ID.cloudflareProfile}  (sign in as ${ID.cloudflareEmail}), run from outside the repo`);
    else if (!prof.accounts?.some((a) => a.id === expected)) fail(`profile "${ID.cloudflareProfile}" is ${prof.email} and cannot see account ${expected}`,
      `re-create it signed in as ${ID.cloudflareEmail}: npx wrangler auth create ${ID.cloudflareProfile}`);
    else ok(`profile login: ${prof.email} → ${expected}`);

    // 3. What wrangler ACTUALLY uses from the repo root — including
    //    .env.local, which it loads on its own and which outranks the profile.
    const eff = wranglerJson(['whoami'], ROOT, process.env);
    if (!eff?.loggedIn) fail('wrangler is not authenticated in this directory', 'npm run cf:login');
    else {
      const ids = (eff.accounts ?? []).map((a) => a.id);
      if (!ids.includes(expected)) fail(`wrangler here resolves to ${eff.email} (${ids.join(', ') || 'no accounts'}), expected ${expected}`,
        'report this mismatch — do not switch accounts to make it pass');
      else if (ids.length > 1) fail(`wrangler here can see ${ids.length} accounts — a deploy without CLOUDFLARE_ACCOUNT_ID could pick the wrong one`,
        `use the npm run cf wrapper, which pins ${expected}`);
      else ok(`wrangler here: ${eff.authType} for ${eff.email} → ${expected}`
        + (/api token/i.test(eff.authType) ? ' (.env.local token outranks the profile; same account)' : ''));
    }

    const tok = wranglerJson(['auth', 'token'], ROOT, process.env);
    apiToken = tok?.token ?? null;
  }

  // 4. The Pages project, through the same credential a deploy would use.
  if (apiToken) {
    const res = await cfGet(`/accounts/${expected}/pages/projects/${ID.cloudflareProject}`, apiToken);
    if (!res.success) fail(`Pages project ${ID.cloudflareProject} not reachable in account ${expected}: ${res.errors?.[0]?.message ?? 'unknown error'}`,
      CI ? 'the CLOUDFLARE_API_TOKEN secret belongs to another account or lacks Pages access' : 'report this — do not switch accounts');
    else {
      const p = res.result;
      ok(`Pages project ${p.name} found in account ${expected}`);
      if (p.production_branch !== ID.productionBranch) fail(`Pages production branch is ${p.production_branch}, identity says ${ID.productionBranch}`);
      else ok(`Pages production branch is ${p.production_branch}`);
      if (!p.domains?.includes(ID.domain)) fail(`${ID.domain} is not a custom domain of ${p.name} (has: ${p.domains?.join(', ')})`);
      else ok(`${ID.domain} is served by ${p.name}`);
      const src = p.source?.config;
      if (src && (src.owner !== ID.githubOwner || src.repo_name !== ID.githubRepo))
        fail(`Pages Git integration builds ${src.owner}/${src.repo_name}, expected ${ID.githubOwner}/${ID.githubRepo}`);
      else if (src) ok(`Pages Git integration builds ${src.owner}/${src.repo_name}`);
    }
    if (ID.cloudflareWorker) {
      const w = await cfGet(`/accounts/${expected}/workers/scripts/${ID.cloudflareWorker}/settings`, apiToken);
      if (!w.success) fail(`Worker ${ID.cloudflareWorker} not found in account ${expected}`);
      else ok(`Worker ${ID.cloudflareWorker} found`);
    }
  } else if (!failures.length) {
    fail('No Cloudflare API credential available to verify the Pages project');
  }
}

// ─────────────────────────────────────────────────────────────── Config
section('Deploy targets in config');
{
  const project = ID.cloudflareProject;
  const toml = readFileSync(join(ROOT, 'wrangler.toml'), 'utf-8');
  const name = toml.match(/^\s*name\s*=\s*"([^"]+)"/m)?.[1];
  if (name !== project) fail(`wrangler.toml name is ${name}, expected ${project}`);
  else ok(`wrangler.toml name = ${name}`);
  // Pages config rejects account_id outright ("does not support"), so it must
  // stay a comment there; the account is pinned by this script instead.
  if (/^\s*account_id\s*=/m.test(toml)) fail('wrangler.toml sets account_id, which Pages config rejects — every deploy would fail',
    'keep it as a comment; the account is pinned in .project-identity.json');

  const targets = [];
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
  for (const [k, v] of Object.entries(pkg.scripts ?? {})) targets.push([`package.json "${k}"`, v]);
  const wfDir = join(ROOT, '.github', 'workflows');
  for (const f of existsSync(wfDir) ? readdirSync(wfDir) : []) {
    const src = readFileSync(join(wfDir, f), 'utf-8');
    src.split('\n').forEach((l, i) => targets.push([`${f}:${i + 1}`, l]));
    for (const m of src.matchAll(/CLOUDFLARE_ACCOUNT_ID:\s*['"]?([0-9a-f]{32})/g)) {
      if (m[1] !== ID.cloudflareAccountId) fail(`${f} hardcodes account ${m[1]}`);
    }
  }
  let deploys = 0;
  for (const [where, line] of targets) {
    if (!/pages\s+deploy/.test(line)) continue;
    deploys++;
    const proj = line.match(/--project-name[= ]+([\w-]+)/)?.[1];
    const br = line.match(/--branch[= ]+([\w./-]+)/)?.[1];
    if (proj !== project) fail(`${where} deploys to project ${proj ?? '(unspecified)'}, expected ${project}`);
    if (br && br !== ID.productionBranch) fail(`${where} deploys with --branch ${br}, production is ${ID.productionBranch}`);
  }
  ok(`${deploys} pages deploy command(s) target ${project}/${ID.productionBranch}`);

  for (const f of readdirSync(join(ROOT, 'scripts')).filter((n) => n.endsWith('.mjs'))) {
    const src = readFileSync(join(ROOT, 'scripts', f), 'utf-8');
    for (const m of src.matchAll(/ACCOUNT_ID\s*=\s*['"]([0-9a-f]{32})['"]/g)) {
      if (m[1] !== ID.cloudflareAccountId) fail(`scripts/${f} hardcodes account ${m[1]}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────── Result
console.log(failures.length
  ? `\n❌ AUTH PREFLIGHT FAILED — ${failures.length} problem(s). Do not push or deploy.\n   Report the mismatch above; do not switch accounts to make it pass.`
  : '\n✅ AUTH PREFLIGHT PASSED — safe to push/deploy.');
// Not process.exit(): on Windows, exiting while fetch's keep-alive sockets are
// closing trips a libuv assertion that turns the exit code into 127.
process.exitCode = failures.length ? 1 : 0;
