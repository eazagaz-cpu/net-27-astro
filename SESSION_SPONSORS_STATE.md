# NET27 Watch — Sponsor Links & Workflow State
> **Saved At:** 2026-09-16 19:20 PKT  
> **Repository:** `eazagaz-cpu/net-27-astro` (`c:\Users\ic\Desktop\Websites\net-27.cc`)  
> **Live Website:** https://net27.watch  
> **Live Sponsors API:** https://net27.watch/api/sponsors  

---

## 1. Quick Summary (Jab account switch ho tu yahan se shuru karein)

User ka setup:
- **Platform:** Astro static website on Cloudflare Pages / Workers.
- **Goal:** Sponsor / Affiliate links ko homepage par dedicated "Featured Sponsors" rail mein show karna (Top 10 Movies ke upar).
- **Current Sponsor Count:** 6 links (Sequence-wise ordered).
- **Rule on Duplicates:** Sponsor links **sirf aur sirf** upar wali dedicated trail (`SponsorRailDynamic.tsx`) mein show honge. `Top10Rail.astro` ke andar koi sponsor card nahi hona chahiye (woh pure movie slider hai).
- **Auto-Rotation (Option 2):** Har 15 seconds baad cards smoothly rotate hotay hain (1st card shifts to end), with smooth 350ms fade/shift transition. Mouse hover ya touch par auto-rotation pause ho jati hai takay click miss na ho.
- **Rule on Links:** Sab sponsor links `rel="noopener"` hain (do-follow SEO benefit ke liye — no `nofollow`/`sponsored`).
- **Images:** `public/links/` folder mein hain, `loading="eager"` aur `fetchPriority="high"` ke sath instant load hoti hain.
- **Language / Tone:** Roman Urdu / Urdu-English friendly accent ("Bhaijan", polite tone).

---

## 2. Current Live Sponsors (In Exact Sequence)

| # | Name / Anchor | Target URL | Image Path | Badge |
|---|---|---|---|---|
| **#1** | **Bet Rupees** | `https://betrupe.com/` | `/links/bet-rupees.webp` | 🔥 Hot |
| **#2** | **P999 pk** | `https://p999pk.org/` | `/links/p999-pk.webp` | ⭐ New |
| **#3** | **pak super game** | `https://paksupergame.cc/` | `/links/pak-super-game.webp` | 🔥 Hot |
| **#4** | **XD777** | `https://apkgamzu.com.pk/x777-game/` | `/links/XD777.webp` | 🔥 Hot |
| **#5** | **hh98** | `https://hh98.pk/` | `/links/HH98.webp` | ⭐ New |
| **#6** | **jj77** | `https://jj77apk.pk/` | `/links/JJ77.webp` | 💥 Hot |
| **#7** | **M666** | `http://m666game.net/` | `/links/M666.webp` | ⭐ New |
| **#8** | **M19 game** | `https://betapk.com.pk/bet939-game-2/` | `/links/M19-game.webp` | 💥 Hot |
| **#9** | **1ppp game** | `https://1pppp.com.pk/` | `/links/1ppp-game.webp` | 🔥 Hot |

---

## 3. Instant Live Architecture (Cloudflare KV + Functions)

Sponsor update ke liye full build ya redeploy ki zaroorat nahi hai:
1. **Cloudflare KV Namespace:** `SPONSORS` (`aa59493bbbed47c0af878405e12bd8fb`).
2. **Cloudflare Pages Function:** `functions/api/sponsors.js`
   - KV namespace se `/api/sponsors` endpoint par live JSON serve karta hai.
   - Cache-Control: `s-maxage=30, stale-while-revalidate=60` (5-30s update).
3. **Push Script:** `scripts/push-sponsors.mjs`
   - Command: `npm run sponsors:push`
   - `.env` se `CLOUDFLARE_ACCOUNT_ID` aur `CLOUDFLARE_API_TOKEN` use karta hai aur direct KV update kar deta hai.
4. **All-In-One Automated Addition & Deploy Script:** `scripts/add-sponsor.mjs`
   - Command: `npm run sponsors:add` ya `node scripts/add-sponsor.mjs --name ... --label ... --url ... --image ...`
   - Image ko 90-95% ultra-compressed WebP format mein convert karta hai.
   - Files ko components aur KV mein add karta hai.
   - Automatic live deployment in 5-30 seconds!
5. **Dynamic Component:** `src/components/SponsorRailDynamic.tsx`
   - Client-side React component jo `/api/sponsors` se fetch karta hai.
   - WebP image load karta hai with `<picture>` tag PNG fallback.
   - Agar API down ho ya offline ho tu built-in `FALLBACK` array display karta hai.

---

## 4. Workflow: Jab User Naya Link De (Automated & Instant)

User sirf 3 cheezain provide karega:
1. **Anchor Name** (e.g. "XYZ Game")
2. **Target URL** (e.g. "https://example.com/")
3. **Image** (user `links/` folder mein image drop karega)

### Agent ko kya karna hai (Single Automated Command):
```powershell
node scripts/add-sponsor.mjs --name "xyz-game" --label "XYZ Game" --url "https://example.com/" --image "XYZ.png" --tagline "🎰 Win Big Today!" --badge "🔥 Hot"
```

Yeh command automatically:
1. Sharp se ultra-fast WebP image banata hai (90-95% compression).
2. `public/links/` mein `.webp` aur `.png` save karta hai.
3. `scripts/push-sponsors.mjs` mein `.webp` path add karta hai.
4. `src/components/SponsorRailDynamic.tsx` ke fallback mein add karta hai.
5. Cloudflare KV ko direct API call se update karta hai (**5-30 seconds mein live!**).
6. Git add, commit, aur GitHub `main` par push kar deta hai.

---

## 5. Fast Build & Deploy System

- **`SKIP_SYNC=1`**: Movie TMDB sync bypass karta hai (build 15-20 min se kam ho kar 2-3 min ho jata hai).
- **Fast Build Command:** `npm run build:fast` (`cross-env SKIP_SYNC=1 astro build`)
- **Fast Deploy Command:** `npm run deploy:fast`
- **Instant Indexing:** `npm run index:now` (`scripts/instant-index.mjs`) — Bing & Yandex IndexNow ko auto ping karta hai.
- **GitHub Actions:** `.github/workflows/fast-deploy.yml` — component/page files push hone par auto fast build chalata hai.

---

## 6. Key Files Map

- `src/components/SponsorRailDynamic.tsx` — Homepage sponsor rail component
- `src/components/Top10Rail.astro` — Top 10 movies/shows rail (100% clean, NO sponsor cards)
- `src/components/pages/HomePage.astro` — Main page layout (SponsorRailDynamic directly above Top10Rail)
- `functions/api/sponsors.js` — Cloudflare Pages Function `/api/sponsors`
- `scripts/push-sponsors.mjs` — Direct KV push script
- `scripts/instant-index.mjs` — IndexNow submission script
- `.github/workflows/fast-deploy.yml` — Rapid CI/CD workflow
- `wrangler.toml` — KV namespace configuration
