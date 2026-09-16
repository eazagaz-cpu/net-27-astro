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

- **Current Sponsors (9 Total, strictly sequence-wise):**
  1. Bet Rupees (`https://betrupe.com/`, `/links/bet-rupees.webp`)
  2. P999 pk (`https://p999pk.org/`, `/links/p999-pk.webp`)
  3. pak super game (`https://paksupergame.cc/`, `/links/pak-super-game.webp`)
  4. XD777 (`https://apkgamzu.com.pk/x777-game/`, `/links/XD777.webp`)
  5. hh98 (`https://hh98.pk/`, `/links/HH98.webp`)
  6. jj77 (`https://jj77apk.pk/`, `/links/JJ77.webp`)
  7. M666 (`http://m666game.net/`, `/links/M666.webp`)
  8. M19 game (`https://betapk.com.pk/bet939-game-2/`, `/links/M19-game.webp`)
  9. 1ppp game (`https://1pppp.com.pk/`, `/links/1ppp-game.webp`)

- **Ultra-Fast WebP Image Rule (MANDATORY):**
  - All sponsor images MUST be optimized to `.webp` (quality: 82, effort: 6) to reduce file sizes by 90-97% (from ~2MB down to ~60-100KB) for instant loading on mobile & desktop.
  - Keep a `.png` copy in `public/links/` as a fallback inside `<picture>` tag.
  - Image paths in KV / components MUST always point to `.webp`.

- **Placement Rule:** Sponsor cards MUST ONLY appear in `SponsorRailDynamic.tsx` (above Top 10 Movies rail). They MUST NOT appear inside `Top10Rail.astro` (Top 10 slider is strictly for movies/TV shows only).
- **SEO Rule:** Links are do-follow (`rel="noopener"`, no `nofollow`/`sponsored`).
- **Instant Live & Automatic Deployment Rule:**
  Jab bhi user chat mein naya link de (Anchor + Target URL + Image in `links/` folder):
  The agent must immediately execute the automated sponsor script:
  ```powershell
  node scripts/add-sponsor.mjs --name "<Slug>" --label "<Display Name>" --url "<Target URL>" --image "<ImageFileName>" --tagline "<Tagline>" --badge "<Badge>"
  ```
  This single command automatically:
  1. Converts image to WebP with 90-95% compression.
  2. Saves both `.webp` and `.png` in `public/links/`.
  3. Adds entry to `SPONSORS` in `scripts/push-sponsors.mjs`.
  4. Adds entry to `FALLBACK` in `src/components/SponsorRailDynamic.tsx`.
  5. Pushes to Cloudflare KV immediately (live on site in 5-30 seconds).
  6. Commits and pushes to GitHub `main` so Cloudflare Pages deploys static assets.
- **Fast Build:** Use `npm run build:fast` (`SKIP_SYNC=1`) to bypass TMDB sync.


