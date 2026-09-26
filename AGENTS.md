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

## 🔐 Auth Safety Rule (HAR AGENT KE LIYE — KABHI MAT TODNA)

In mein se koi bhi kaam karne se **PEHLE** hamesha chalao:

```
npm run auth:check
```

- `git push`
- GitHub Actions workflow change
- Cloudflare deploy (Pages ya Worker)
- DNS change
- KV / D1 / R2 mutation (`npm run sponsors:push` bhi)

**Agar preflight FAIL ho:** account switch karke "theek" mat karo — na `gh auth switch`,
na `wrangler login`, na `wrangler auth activate`, na token ya account ID badlo.
Jo exact mismatch print hua hai woh user ko report karo aur ruk jao.
Kabhi bhi andaze wale account par deploy nahi karna.

Expected identities: [.project-identity.json](.project-identity.json) — GitHub `eazagaz-cpu/net-27-astro`,
Cloudflare account `34bdd56a73c7dc40d4223f7fa255d419` (net27.cc@gmail.com), Pages project
`net-27-astro`, production branch `main`, domain `net27.watch`. Cloudflare local auth = wrangler
profile `net27` (is folder se bound). Poori tafseel CLAUDE.md mein "Auth safety rule",
"Cloudflare" aur "GitHub auth" sections mein hai.

---

## Communication & Language Preference

- Always talk with the user in Roman Urdu / Urdu-English accent (Urdu written in English alphabets with natural English technical terms).
- Keep the tone respectful, friendly, and helpful ("Bhaijan", polite phrasing).
- Do not use Devanagari Hindi or stiff formal English. Always default to Roman Urdu / Urdu-English conversational style.

---

## ═══════════════════════════════════════════════════
## SPONSOR LINKS SYSTEM — (2026-09-25 se naya, KABHI MAT TODNA)
## ═══════════════════════════════════════════════════

> **CRITICAL:** Links 10-12 dafa "gayab" hue kyunke agents unhe ghalat file mein add
> karte the (purana `push-sponsors.mjs` array, component FALLBACK, `functions/api/sponsors.js`,
> ya seedha KV). CI din mein 4 dafa KV ko **git wali manifest** se overwrite karta hai,
> is liye har aisa link kuch ghanton mein mit jata tha. Ab sirf EK list hai.

### EK HI LIST: `src/data/sponsor-links.json`

- `trail1` = Featured Sponsors (gold, `/api/sponsors`, KV key `links`)
- `trail2` = Popular Gaming Links (emerald, `/api/sponsors2`, KV key `links2`)
- `removed` = jo links user ke kehne par hataye gaye (record, delete nahi)

In files ko **KABHI hath se edit mat karo** — yeh sab manifest se generate hoti hain:
`functions/api/sponsors.js`, `functions/api/sponsors2.js`, `functions/api/link-health.js`,
`SponsorRailDynamic.tsx` / `SponsorRailSecondary.tsx` (FALLBACK manifest se banta hai).
KV ko kabhi seedha API/wrangler se mat likho.

### NAYA LINK ADD KARNA (user sirf naam + URL + image de)

```powershell
npm run sponsors:add -- --url "<URL>" --label "<Display Name>" --image "<file>" [--trail 2] [--position 1] [--tagline "..."] [--badge "..."]
npm run sponsors:deploy
```

- **Image:** khud dhoondo — `links/`, `public/links/`, phir project root. Script fuzzy match
  karta hai ("XD 777" → `XD777.png`) aur `public/links/<id>.webp` (quality 82) banata hai.
- **Position:** kuch nahi bola → end · "top pr / pehle / #1" → `--position 1` · "#2" → `--position 2`
  · "2nd trail mein" → `--trail 2`.
- **Defaults:** badge `🔥 Hot`, tagline `🎰 Play & Win Big!` (movie/app links ke liye munasib tagline do).
- **Same naam, naya URL:** naya entry banta hai (`xd777-2`), purana link KABHI replace/exclude nahi.
- User se image/badge/position mat poochho — upar ke rules se khud decide karo.

### LINK HATANA — sirf jab user khud saaf kahe ("hata do")

```powershell
npm run sponsors:remove -- --url "<URL>" --reason "user asked"
npm run sponsors:deploy
```

JSON se entry hath se delete mat karo: CI gate (`verify-links.mjs`) har us link par **deploy rok
deta hai** jo net27.watch par live ho magar manifest mein na ho aur `removed` mein bhi na ho.
URL badalna ho (sirf jab user kahe "update karo"): purana `sponsors:remove`, naya `sponsors:add`.

### `npm run sponsors:deploy` kya karta hai (order zaroori hai)

1. `auth:check` — sahi GitHub/Cloudflare account (fail ho to ruk jao, account switch mat karo)
2. `verify-links` — manifest valid + koi live link chupke se nahi hata + homepage par dono rails
3. functions files manifest se regenerate
4. `safe-push` — commit + push (CI + Cloudflare deploy trigger)
5. KV push (5-30s mein live) — **sirf** push ke baad; uncommitted manifest ko KV mein jane nahi deta

### GUARDS (inhe bypass / "fix" mat karna)

- `push-sponsors.mjs` KV likhne se pehle live KV parhta hai; koi link manifest se ghaib ho to kuch
  nahi likhta aur fail hota hai. Local se sirf GitHub par pushed manifest hi KV mein jata hai.
- `verify-links.mjs` CI, `prebuild` aur `sponsors:deploy` mein chalta hai.
- Agar guard fail ho: jo link list hua hai use manifest mein wapas add karo, ya (sirf user ke kehne
  par) `sponsors:remove` karo. Guard ka check hatana/kamzor karna mana hai.

### BAAQI RULES

- **SEO:** `rel="noopener"` — `nofollow` / `sponsored` mat lagao.
- **Placement:** rails sirf `HomePage.astro` mein `<SponsorRailDynamic client:only="react" />` aur
  `<SponsorRailSecondary client:only="react" />` — yeh lines hatana deploy block kar deta hai.
  **Jagah: "Top 10 Movies Today" (`<Top10Rail>`) se UPAR, ContinueWatching ke baad** — user ka
  faisla (2026-09-26). Page ke neeche le jane par (bbef911) links "gayab" samjhe gaye; ab
  `verify-links` rails ko `<Top10Rail>` se neeche hone par deploy rok deta hai. Inhein neeche/footer
  mein mat le jao. `Top10Rail.astro` ke andar kabhi nahi.
- **Images:** `push-sponsors.mjs` har image ka 192px Base64 thumbnail KV payload mein inline karta hai;
  broken image par component casino-avatar fallback dikhata hai.
- Health check: https://net27.watch/api/link-health

### CASINO/GAME LINK PAKARNA (AUTO DETECTION)

Agar user `.pk` / `.com.pk` / `.cc` / `.net` / `.pro` domain, ya "game/earn/win/bet/play" wala naam +
URL de, to woh naya sponsor hai — upar wala "NAYA LINK ADD KARNA" flow chalao.

---

## Fast Build: Use `npm run build:fast` (`SKIP_SYNC=1`) to bypass TMDB sync.
