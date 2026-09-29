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

- **No Cloudflare token is kept on disk locally** (since 2026-09-27). `.env`
  and `.env.local` hold no `CLOUDFLARE_API_TOKEN`: every old token was deleted
  after the stale repo incident, and the only API token left ("Edit Cloudflare
  Workers", created 2026-09-26) lives solely in this repo's GitHub secret.
  Locally, wrangler uses the `net27` profile, and `push-sponsors.mjs` borrows a
  short-lived OAuth token from it (`wrangler auth token`). Do not paste a token
  back into `.env*`. Wrangler loads those files itself, and a token there
  outranks the profile. The same applies to any machine-wide
  `CLOUDFLARE_API_TOKEN`. A few older one-off scripts (`cf-bot-check`,
  `add-domain-redirect`, `fix-*-redirect`) still expect an env token; they now
  need one passed explicitly for that run.
- Wrangler refuses `auth create` and `auth activate` while an env token is
  loaded. `npm run cf:login` (re-create the profile) and
  `npm run cf -- auth activate net27` (re-bind the repo) run from `scripts/` to
  avoid that.
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
- The rails are **server-rendered** (`client:idle`, never `client:only`), so
  every link is a plain `<a>` in the homepage HTML even when the script is
  slow, fails, or is blocked. `verify-dist-links.mjs` (postbuild, and in CI
  between build and deploy) fails when any link is missing from a built
  homepage or sits below Top 10.
- [.github/workflows/sponsor-watchdog.yml](.github/workflows/sponsor-watchdog.yml)
  checks the live site hourly (`scripts/sponsor-watchdog.mjs`). If an API or
  KV is short, it re-pushes KV from the manifest. If the HTML is wrong, or the
  heal does not work, the run fails and GitHub emails the owner. A
  "Sponsor Links Watchdog" failure email is therefore a real outage.
  `push-sponsors.mjs` does the same against KV before writing, and refuses a
  local push of a manifest that is not yet on GitHub. When a guard fails, fix
  the manifest. Never weaken the guard.

## Ads (Adsterra, RollerAds) — never remove

The owner reported Adsterra tags "removing themselves" several times. None was
ever committed here; they were added outside git, or on the old net27.watch
repo, and the next deploy wiped them. Now:

- **[src/data/ads.json](src/data/ads.json)** holds every key, script URL and
  CSP host. BaseLayout builds the Adsterra loader from it (banner slots via
  `AdsterraBanner.astro`: 2 on the homepage, 1 on title pages, 1 above every
  footer; Social Bar site-wide after the first interaction). No ads on
  `/player/`.
- **`scripts/verify-ads.mjs`** (postbuild, CI between build and deploy, local
  deploy scripts) fails when a tag or slot is missing from the built pages, or
  when the site CSP does not allow every Adsterra host, or when any
  `public/_headers` value exceeds 2,000 characters. A tag that is present but
  blocked by CSP is as good as gone.
- The hourly watchdog checks the same on the live site and redeploys `main`
  when it fails.
- Never remove an ad tag, slot or CSP host to make something else pass. To
  change a key or add a rotated Adsterra host, edit ads.json only.

**The CSP is a `<meta>` tag, not a header.** Cloudflare Pages silently drops
any `_headers` value over 2,000 characters. Adding the Adsterra hosts took the
policy to ~2,900, and on 2026-09-29 every page was served with no CSP at all.
The resource policy now lives in [src/lib/csp.ts](src/lib/csp.ts). BaseLayout
emits it first in `<head>`, and it reads the Adsterra hosts from ads.json.
`public/_headers` keeps only header-only rules (`frame-ancestors` and a few
others), and /player/ keeps its own header policy. `validate:csp`,
`verify-ads` and the watchdog all read the meta tag.

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

**There must be no third.** The old private repo `eazagaz-cpu/net27.watch`
(created 2026-09-07, stale code, no sponsor rails, no `/api` functions) had
the same `daily-sync.yml` and the same Cloudflare secrets. It deployed into
`net-27-astro` four times a day, a few minutes after this repo's run, and
replaced the live site with its old build. That is what kept making the
sponsor links "disappear". Its workflows must stay **disabled**. If the
watchdog ever reports wrong HTML, list the Pages deployments first and look
for an `ad_hoc` deploy whose commit is not in this repo.

The second one is easy to forget, because its failures arrive as GitHub emails
that read like Cloudflare build failures. It sat broken for four days — sixteen
consecutive runs — after wrangler was pinned to 4.120.1, which requires Node 22
while the workflow asked for Node 20. Check it with `gh run list --workflow
daily-sync.yml`, not just the Pages dashboard.

Because that workflow holds a Cloudflare API token as a GitHub secret, **do not
delete API tokens without checking what uses them** — deploys survive losing the
Git integration's token but not that one.

### Build size budget: 20,000 files, hard

Cloudflare Pages rejects a deployment over **20,000 files** on this plan
(`wrangler pages deploy` → "Pages only supports up to 20,000 files"), and its
builder dies from memory well before that (see the next section). On
2026-09-28 the output reached ~27,900 files and both deploy paths failed.
Now it is ~11,100. Check `find dist -type f | wc -l` after changes that add
pages, and keep it well under 20,000.

What decides the count:

- **Titles** (`src/data/cache/titles.json`): live titles plus **retained**
  ones. A title that drops out of the trending lists keeps its English page
  for 180 days (max 1,500) instead of turning into a 404. See
  `withRetainedTitles` in `src/scripts/movie-sync.mjs`. Renamed titles get a
  301 from `src/data/slug-history.json`, emitted at build by
  `appendSlugRedirects` in `astro.config.mjs`.
- **Locales with detail pages** (`DETAIL_PAGE_LANGS` in `src/i18n/config.ts`):
  only en/hi/ur/bn build per-title and per-person pages. The other routed
  locales keep their hubs and 301 their detail URLs to English
  (`public/_redirects`). Adding a locale there multiplies every title and
  person page, so measure first.
- **People**: anyone with 3+ credits across all titles, retained included, gets
  a page in each detail locale.

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
