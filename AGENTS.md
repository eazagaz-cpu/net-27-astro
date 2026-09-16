## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Communication & Language Preference

- Always talk with the user in Roman Urdu / Urdu-English accent (Urdu written in English alphabets with natural English technical terms).
- Keep the tone respectful, friendly, and helpful ("Bhaijan", polite phrasing).
- Do not use Devanagari Hindi or stiff formal English. Always default to Roman Urdu / Urdu-English conversational style.

## Sponsor Links & System Workflow (CRITICAL CONTEXT)

Complete state documented in `SESSION_SPONSORS_STATE.md`.

- **Current Sponsors (6 Total, strictly sequence-wise):**
  1. XD777 (`https://apkgamzu.com.pk/x777-game/`, `/links/XD777.png`)
  2. hh98 (`https://hh98.pk/`, `/links/HH98.png`)
  3. jj77 (`https://jj77apk.pk/`, `/links/JJ77.png`)
  4. M666 (`http://m666game.net/`, `/links/M666.png`)
  5. M19 game (`https://betapk.com.pk/bet939-game-2/`, `/links/M19-game.png`)
  6. 1ppp game (`https://1pppp.com.pk/`, `/links/1ppp-game.png`)

- **Placement Rule:** Sponsor cards MUST ONLY appear in `SponsorRailDynamic.tsx` (above Top 10 Movies rail). They MUST NOT appear inside `Top10Rail.astro` (Top 10 slider is strictly for movies/TV shows only).
- **SEO Rule:** Links are do-follow (`rel="noopener"`, no `nofollow`/`sponsored`).
- **Instant Live Rule:** When user gives a new link (Anchor + Target URL + Image in `links/` folder):
  1. Copy image from `links/` to `public/links/`.
  2. Add to `SPONSORS` array in `scripts/push-sponsors.mjs`.
  3. Run `npm run sponsors:push` (Updates Cloudflare KV instantly, live in 5-30s).
  4. Add to `FALLBACK` array in `src/components/SponsorRailDynamic.tsx`.
  5. Git commit and push to `main`.
- **Fast Build:** Use `npm run build:fast` (`SKIP_SYNC=1`) to bypass TMDB sync.


