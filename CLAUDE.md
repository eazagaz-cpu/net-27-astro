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

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
