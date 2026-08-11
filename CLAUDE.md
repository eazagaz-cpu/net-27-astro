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

Auth comes from `CLOUDFLARE_API_TOKEN` in `.env.local`, **not** from
`wrangler login`. That is deliberate. Wrangler stores its OAuth login once per
machine and shares it across every project, so running `wrangler login` in some
other repo silently repoints this one at a different account; the next command
then fails with `Failed to automatically retrieve account IDs`. A token in
`.env.local` is loaded automatically and outranks the shared OAuth login, which
makes this project immune to whatever any other project did.

If `cf:check` reports a missing or under-privileged token, mint a new one at
https://dash.cloudflare.com/profile/api-tokens using the **Cloudflare Pages**
template plus *Account · Account Settings · Read*, scoped to the net27 account.
Never run `wrangler login` to "fix" this — it papers over the problem until the
next time another project logs in.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
