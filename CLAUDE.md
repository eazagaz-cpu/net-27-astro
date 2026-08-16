## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Cloudflare

The site is a Cloudflare Pages project, `net-27-astro`, on the **net27.cc@gmail.com**
account (`34bdd56a73c7dc40d4223f7fa255d419`). Pushing to `main` triggers the
production build automatically — direct `wrangler pages deploy` is only for
bypassing CI.

Run this before trusting any wrangler command:

```
npm run cf:check
```

Auth must be **project-scoped**, never the bare machine-wide login. Wrangler
stores its OAuth login once per machine and shares it across every project, so
running `wrangler login` in some other repo silently repoints this one at a
different account; the next command then fails with `Failed to automatically
retrieve account IDs`. This machine has a second Cloudflare account, so that is
a live hazard, not a hypothetical.

Two setups avoid it, and `cf:check` accepts either:

- **Private login** (`npm run cf:login`) — wrangler resolves its config
  directory through `XDG_CONFIG_HOME`, and [scripts/wrangler.mjs](scripts/wrangler.mjs)
  points that at `.cf-auth/` inside the repo. Every `cf:*` script goes through
  that wrapper. **Calling `wrangler` directly bypasses it** and falls back to the
  shared store — use `npm run cf -- <args>` instead.
- **API token** in `.env.local` as `CLOUDFLARE_API_TOKEN`, which wrangler loads
  automatically and which outranks the shared login. Mint it at
  https://dash.cloudflare.com/profile/api-tokens with the **Cloudflare Pages**
  template plus *Account · Account Settings · Read*.

Note that a token can report `status: active` while still lacking the
permissions that matter — the token that broke deploys did exactly that — which
is why `cf:check` calls the real Pages endpoint instead of trusting a status
field.

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
