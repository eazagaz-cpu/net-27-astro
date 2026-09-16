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
- **Rule on Links:** Sab sponsor links `rel="noopener"` hain (do-follow SEO benefit ke liye — no `nofollow`/`sponsored`).
- **Images:** `public/links/` folder mein hain, `loading="eager"` aur `fetchPriority="high"` ke sath instant load hoti hain.
- **Language / Tone:** Roman Urdu / Urdu-English friendly accent ("Bhaijan", polite tone).

---

## 2. Current Live Sponsors (In Exact Sequence)

| # | Name / Anchor | Target URL | Image Path | Badge |
|---|---|---|---|---|
| **#1** | **XD777** | `https://apkgamzu.com.pk/x777-game/` | `/links/XD777.png` | 🔥 Hot |
| **#2** | **hh98** | `https://hh98.pk/` | `/links/HH98.png` | ⭐ New |
| **#3** | **jj77** | `https://jj77apk.pk/` | `/links/JJ77.png` | 💥 Hot |
| **#4** | **M666** | `http://m666game.net/` | `/links/M666.png` | ⭐ New |
| **#5** | **M19 game** | `https://betapk.com.pk/bet939-game-2/` | `/links/M19-game.png` | 💥 Hot |
| **#6** | **1ppp game** | `https://1pppp.com.pk/` | `/links/1ppp-game.png` | 🔥 Hot |

> ⏳ **Pending Next Sponsor:** `pak super game.png` image folder mein aa chuki hai aur `public/links/pak-super-game.png` copy ho chuki hai. User se iska Anchor & Target URL lena hai (e.g. Pak Super Game as #7).


---

## 3. Instant Live Architecture (Cloudflare KV + Functions)

Sponsor update ke liye full build ya redeploy ki zaroorat nahi hai:
1. **Cloudflare KV Namespace:** `SPONSORS` (`1368eb99137f4ea983e4a6c11b4feab8`).
2. **Cloudflare Pages Function:** `functions/api/sponsors.js`
   - KV namespace se `/api/sponsors` endpoint par live JSON serve karta hai.
   - Cache-Control: `s-maxage=30, stale-while-revalidate=60` (5-30s update).
3. **Push Script:** `scripts/push-sponsors.mjs`
   - Command: `npm run sponsors:push`
   - `.env` se `CLOUDFLARE_ACCOUNT_ID` aur `CLOUDFLARE_API_TOKEN` use karta hai aur direct KV update kar deta hai.
4. **Dynamic Component:** `src/components/SponsorRailDynamic.tsx`
   - Client-side React component jo `/api/sponsors` se fetch karta hai.
   - Agar API down ho ya offline ho tu built-in `FALLBACK` array display karta hai.

---

## 4. Workflow: Jab User Naya Link De (Step-by-Step)

User sirf 3 cheezain provide karega:
1. **Anchor Name** (e.g. "XYZ Game")
2. **Target URL** (e.g. "https://example.com/")
3. **Image** (user `c:\Users\ic\Desktop\Websites\net-27.cc\links\` folder mein image drop karega)

### Agent ko kya karna hai:
1. **Image copy karein:**
   ```powershell
   Copy-Item "links\[ImageName].png" "public\links\[ImageName].png" -Force
   ```
2. **`scripts/push-sponsors.mjs` edit karein:**
   `SPONSORS` array mein aage naya item sequence wise add karein:
   ```javascript
   {
     name: 'NewGame',
     label: 'New Game',
     tagline: '🎯 Play & Win!',
     url: 'https://example.com/',
     image: '/links/NewGame.png',
     badge: '⭐ New',
   },
   ```
3. **Instant KV Push run karein:**
   ```powershell
   npm run sponsors:push
   ```
   *(Yeh 5-30 seconds mein live ho jayega bina kisi rebuild ke!)*
4. **Fallback update karein:**
   `src/components/SponsorRailDynamic.tsx` ke `FALLBACK` array mein bhi yahi entry add kar dein.
5. **Git Commit & Push:**
   ```powershell
   git add -A
   git commit -m "feat: [Name] added as #[Number] sponsor"
   git pull origin main --rebase
   git push origin main
   ```

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
