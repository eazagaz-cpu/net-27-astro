## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Auth safety rule (all agents)

Before any of these, **always run `npm run auth:check`** and read its result:

- `git push`
- a GitHub Actions workflow change
- a Cloudflare deploy (Pages or Worker)
- a DNS change
- a KV / D1 / R2 mutation (this includes `npm run sponsors:push`)

If the preflight fails, **do not repair it by switching accounts**, whether with
`gh auth switch`, `wrangler login`, `wrangler auth activate`, or by editing
tokens or account IDs. Report the exact mismatch it printed and stop. Never
deploy to an account that was guessed.

Every expected identity lives in [.project-identity.json](.project-identity.json)
(no secrets). The npm scripts that push, deploy or write KV already run the
preflight first; the CI workflows run `node scripts/preflight-auth.mjs --ci`
before any KV write or deploy.

This machine has **three** Cloudflare accounts and **three** GitHub accounts,
and both CLIs keep one machine-wide "active" identity that any other repo can
flip. That is why each identity is pinned to this directory, as below.

## Cloudflare

The site is a Cloudflare Pages project, `net-27-astro`, on the **net27.cc@gmail.com**
account (`34bdd56a73c7dc40d4223f7fa255d419`), serving **net27.watch** (old
domain: net-27.cc). Pushing to `main` triggers the production build
automatically. A direct `wrangler pages deploy` is only for bypassing CI.

Local auth is the wrangler auth profile **`net27`**, bound to this directory
with `wrangler auth activate`. Profiles and bindings live in wrangler's global
store (`%APPDATA%\xdg.config\.wrangler\`), outside the repo. Any tool that runs
wrangler from this folder, including VS Code, Codex, Claude and AntiGravity,
gets the net27 login without extra setup. `wrangler login` in another repo
only changes the `default` profile and cannot reach this one.

Precedence details that matter:

- `CLOUDFLARE_API_TOKEN` in the environment **outranks** the profile. Never
  set one machine-wide. Wrangler also loads `.env.local` by itself, and the
  token there (same account; `push-sponsors.mjs` needs it) is what `wrangler`
  actually uses at the repo root. The profile is what it uses everywhere else
  in the tree.
- For the same reason, wrangler refuses `auth create` and `auth activate` while
  that token is loaded. Run them from outside the repo root:
  `npm run cf:login` (re-create the profile) does that for you, and
  `npm run cf -- auth activate net27` re-binds the repo.
- `CLOUDFLARE_ACCOUNT_ID` in the environment outranks everything. A user-level
  one pointing at another account (`364bc935…`) was removed on 2026-09-25.
- `account_id` **cannot** go in `wrangler.toml`: Pages config rejects it
  ("does not support account_id") and every deploy would fail. It stays a
  comment there.
- `XDG_CONFIG_HOME` hides the profile store. The old `.cf-auth/` +
  `.vscode/settings.json` setup that used it is retired.

`npm run cf -- <args>` runs the project's wrangler with the account pinned.
`npm run cf:check` is an alias of `auth:check`.

A token can report `status: active` while still lacking the permissions that
matter (the token that broke deploys did exactly that), so the preflight calls
the real Pages endpoint instead of trusting a status field.

## GitHub auth

The repo is `eazagaz-cpu/net-27-astro`. gh stores all three GitHub logins in
the Windows keyring, and its global git helper (`gh auth setup-git`) only
serves the **active** account, so pushes used to depend on which project last
ran `gh auth switch`. `.git/config` therefore has a repo-local helper that
always asks the keyring for `eazagaz-cpu`'s token. It stores a command, never
a token:

```
git config --local --unset-all credential.https://github.com.helper
git config --local --add credential.https://github.com.helper ''
git config --local --add credential.https://github.com.helper '!f() { test "$1" = get || exit 0; t=$("/c/Program Files/GitHub CLI/gh.exe" auth token --user eazagaz-cpu 2>/dev/null) || exit 0; echo username=eazagaz-cpu; echo "password=$t"; }; f'
```

Plain `gh` commands (PRs, runs, secrets) still act as the active account; the
preflight warns when that is not `eazagaz-cpu`. Never disable TLS
verification (`http.sslVerify false`, `GIT_SSL_NO_VERIFY`,
`NODE_TLS_REJECT_UNAUTHORIZED=0`); the preflight fails on all three.

## Sponsor links (the homepage casino/app rails)

Full workflow: the "SPONSOR LINKS SYSTEM" section of [AGENTS.md](AGENTS.md).
The rules that stop links vanishing:

- **[src/data/sponsor-links.json](src/data/sponsor-links.json) is the only list.**
  `functions/api/sponsors*.js`, `link-health.js`, the components' fallbacks and
  KV are all generated from it. Never edit those by hand, and never write KV
  directly. CI rewrites KV from the *committed* manifest four times a day, so
  anything that is not in the manifest on GitHub disappears within hours. That
  single fact is why links "kept disappearing" 10-12 times before 2026-09-25.
- Add: `npm run sponsors:add -- --url … --label … --image …`. Remove, only when
  the user explicitly asks: `npm run sponsors:remove -- --url …`. That records
  the link under `removed` rather than deleting it. Then run
  `npm run sponsors:deploy`.
- Guards: `verify-links.mjs` (CI, `prebuild`, `sponsors:deploy`) blocks the
  deploy when a link that is live on net27.watch is missing from the manifest
  without a `removed` record, when HomePage.astro stops mounting a rail, or
  when a rail moves below `<Top10Rail>`. The owner wants the rails above the
  Top 10 rails; at the page bottom they were reported as "gone" twice.
  `push-sponsors.mjs` does the same against KV before writing, and refuses a
  local push of a manifest that is not yet on GitHub. When a guard fails, fix
  the manifest. Never weaken the guard.

### A `_headers` change needs a cache purge

Editing [public/_headers](public/_headers) alone does **not** reach visitors on
`net-27.cc`, even after the deploy reports success. If a page's HTML body has not
changed, its ETag has not changed either, so the edge revalidates, gets a 304,
and keeps serving the response it already had — old headers included. The fix is
live at origin the whole time: `net-27-astro.pages.dev` shows the new header
while `net-27.cc` shows the old one.

How to tell: `curl -sI https://net-27.cc/movies/` and look at `cf-cache-status`.
`REVALIDATED` means you are seeing cached headers; `MISS`, `EXPIRED` or
`DYNAMIC` means you are seeing current ones. Appending a unique query string
(`?cb=123`) forces a `MISS` and reveals what the origin is really sending.

Purging needs *Zone · Cache Purge*, which the project login does not have — the
API answers `Authentication error [10000]`. So it is a dashboard step:
**net-27.cc → Caching → Configuration → Purge Everything**.

This bit once, on the CSP fix that unblocked the ProfitON popunder: the ad tag
was correct, the vendor answered 200, the policy was fixed and deployed, and the
home page still blocked the script for as long as its cached headers survived.
`npm run validate:csp` catches the policy mistake at build time; only a purge
gets the corrected policy to visitors.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

### Two deploy paths, not one

Production is reached two ways, and both must stay green:

1. **Git integration** — pushing to `main` builds on Cloudflare's own builder.
2. **[.github/workflows/daily-sync.yml](.github/workflows/daily-sync.yml)** — runs
   4× daily on cron, refreshes the TMDB cache, builds, and deploys with
   `wrangler pages deploy` using `secrets.CLOUDFLARE_API_TOKEN`.

The second one is easy to forget, because its failures arrive as GitHub emails
that read like Cloudflare build failures. It sat broken for four days — sixteen
consecutive runs — after wrangler was pinned to 4.120.1, which requires Node 22
while the workflow asked for Node 20. Check it with `gh run list --workflow
daily-sync.yml`, not just the Pages dashboard.

Because that workflow holds a Cloudflare API token as a GitHub secret, **do not
delete API tokens without checking what uses them** — deploys survive losing the
Git integration's token but not that one.

### A silently truncated build is out of memory, not a timeout

Astro renders every page into memory. When a Pages build log stops mid-render
with no error, Node ran out of heap; a timeout would not truncate the log that
way, and build time here barely tracks page count anyway (5,400 pages took 250s,
10,668 took 237s — the clock goes to movie-sync fetching from TMDB).

Routing 16 locales — 21,205 pages — died that way. The fix is
`NODE_OPTIONS=--max-old-space-size=4096` in the Pages project's environment
variables: a dev machine gives Node a 4.19GB heap by default and builds all
25,156 pages inside it, while the builder's default is smaller. Raise that
number first if it happens again.

### "Active" in `wrangler pages deployment list` does not mean live

That Status column reports the **build** stage, so a deployment still compiling
shows `Active` — the same word it shows once the deployment is serving. Reading
it as "done" sends you off checking URLs that legitimately 404 or serve the
previous build, and the obvious next conclusion — that the build silently
dropped pages — is wrong. This has cost time twice.

Ask the API for the stage instead. `deploy=success` is the only state that means
visitors can see it:

```
GET /accounts/{account}/pages/projects/net-27-astro/deployments
  → result[].latest_stage.{name,status}
  → result[].deployment_trigger.metadata.commit_hash
```

A build in progress reads `build:active deploy:idle`; a finished one reads
`build:success deploy:success`. Until the second one appears, the site is still
serving the previous deployment, and comparing a file's ETag against the local
copy will keep disagreeing for a perfectly ordinary reason.
