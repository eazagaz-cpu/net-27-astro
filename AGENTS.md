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

---

## ═══════════════════════════════════════════════════
## SPONSOR LINKS SYSTEM — COMPLETE AUTO-DETECTION GUIDE
## ═══════════════════════════════════════════════════

> **CRITICAL:** Yeh section agent ke liye hai. Jab bhi user koi naya sponsor/casino link de, agent ko khud sab kuch samajhna aur karna hai. User ko kuch explain nahi karna, sirf kaam karna hai.

---

### STEP 1 — AGENT KO KYA AUTOMATICALLY PATA HONA CHAHIYE

Jab user sirf yeh de:
- Ek **naam** (e.g. "XD777", "JB Game", "New Game")
- Ek **URL** (e.g. `https://example.com/`)
- Optionally: position (e.g. "top pr lagao", "#1 pr rkhna")

**Agent khud yeh kare:**

#### A) Image automatically dhundho — `links/` folder mein

```
c:\Users\ic\Desktop\Websites\net-27.cc\links\
```

Is folder mein user ke diye hue naam se milti-julti image file dhundho. Fuzzy match karo:
- Agar naam "XD777" hai → dhundho `XD777.png`, `XD 777.png`, `xd777.png`
- Agar naam "JB Game" hai → dhundho `JB Game.png`, `jb-game.png`, `New Earning Games.png` (jo bhi game jaisi lage)
- Agar naam "Bet Rupees" hai → dhundho `Bet Rupees.png`, `bet-rupees.png`

**`list_dir` tool se `links/` folder list karo** aur naam se match karo. Agar exact match na ho to closest match lo.

#### B) Agar image nahi mili `links/` mein

`public/links/` folder bhi check karo. Already processed webp ho sakti hai:
```
c:\Users\ic\Desktop\Websites\net-27.cc\public\links\
```

#### C) Current sponsor order check karo

Hamesha `scripts/push-sponsors.mjs` padho to see current sequence. Phir user ke instruction ke mutabiq position decide karo.

---

### STEP 2 — POSITION RULES (TOP/BOTTOM/SPECIFIC)

| User kehta hai | Matlab |
|---|---|
| "top pr lagao" | #1 position par |
| "pehle lagao" | #1 position par |
| "#1 pr rkhna" | #1 position par |
| "#2 pr" | #2 position par |
| kuch nahi bola | end mein add karo (last position) |
| "hata do" | us sponsor ko remove karo |
| "URL update karo" | sirf tab jab user explicitly kahe "update karo", warna NEVER overwrite! |

> ⚠️ **CRITICAL RULE — SAME ANCHOR (NAME) WITH DIFFERENT URL:**
> Agar user same naam (jaise "XD777") ka naya link de, to purane link ko **KABHI BHI EXCLUDE YA OVERWRITE NAHI KARNA!**
> Har URL ek alag client/campaign hai. Dono links site par rehte hain.
> Unhe unique `name` keys do (e.g. `xd777-sting`, `xd777-gamzu` ya `name-1`, `name-2`), taake React aur KV mein collision na ho.

---

### STEP 3 — COMPLETE WORKFLOW (ZERO USER INTERACTION)

**Jab bhi naya sponsor add karna ho:**

```powershell
# Step 3a: Image convert karo (agar nahi ki)
node -e "
const sharp = require('sharp');
sharp('links/ImageName.png').webp({quality:82,effort:6}).toFile('public/links/slug.webp', (e,i)=>console.log(i||e));
"

# Step 3b: PNG copy karo
Copy-Item "links\ImageName.png" "public\links\slug.png" -Force

# Step 3c: push-sponsors.mjs mein manually add karo (correct position par)
# Step 3d: SponsorRailDynamic.tsx FALLBACK mein add karo
# Step 3e: Ek hi command mein sab kuch live + git push:
npm run sponsors:deploy

# YA step-by-step:
# Step 3e: KV push + Cloudflare function fallbacks auto-sync
npm run sponsors:push

# Step 3f: Bulletproof safe git push (account lock + auto-rebase + push)
npm run push:safe "feat(sponsor): add <Name>"
```

**YA agar add-sponsor.mjs script use karo (end mein add hota hai):**
```powershell
node scripts/add-sponsor.mjs --name "<slug>" --label "<Display Name>" --url "<URL>" --image "<filename.png>" --tagline "<tagline>" --badge "<badge>"
npm run sponsors:deploy
```
**NOTE:** add-sponsor.mjs sirf END mein add karta hai. Agar top/specific position chahiye to manually `push-sponsors.mjs` edit karo.

---

### STEP 4 — CURRENT SPONSORS (17 Total — Always verify with push-sponsors.mjs)

#### 🎯 Trail 1: Featured Sponsors (9 Links) — KV Key: `links`

| # | Name Key | Label | URL | Image (public/links/) |
|---|---|---|---|---|
| 1 | `y999-game` | Y9999 Game | `https://y9999.pk/` | `y999-game.webp` |
| 2 | `xd777-sting` | XD777 Game | `https://apksting.com.pk/zentro-win-game/` | `XD777-new.webp` |
| 3 | `xd777-gamzu` | XD777 Game | `https://apkgamzu.com.pk/x777-game/` | `XD777.webp` |
| 4 | `jb-game` | JB Game | `https://jbgame.pk` | `jb-game.webp` |
| 5 | `Bet Rupees` | Bet Rupees | `https://betrupe.com/` | `bet-rupees.webp` |
| 6 | `P999 pk` | P999 PK | `https://p999pk.org/` | `p999-pk.webp` |
| 7 | `pak super game` | Pak Super Game | `https://paksupergame.cc/` | `pak-super-game.webp` |
| 8 | `hh98` | HH98 | `https://hh98.pk/` | `HH98.webp` |
| 9 | `jj77` | JJ77 | `https://jj77apk.pk/` | `JJ77.webp` |

#### 💎 Trail 2: Popular Gaming Links (8 Links) — KV Key: `links2`

| # | Name Key | Label | URL | Image (public/links/) |
|---|---|---|---|---|
| 1 | `pkr365` | PKR365 | `https://gamesapks.com.pk/786ace-game/` | `pkr365.webp` |
| 2 | `M666` | M666 Game | `http://m666game.net/` | `M666.webp` |
| 3 | `M19 game` | M19 Game | `https://betapk.com.pk/bet939-game-2/` | `M19-game.webp` |
| 4 | `1ppp game` | 1PPP Game | `https://1pppp.com.pk/` | `1ppp-game.webp` |
| 5 | `Win786` | Win786 | `https://786win.pk/` | `win786.webp` |
| 6 | `10win` | 10win | `https://110win.com.pk/` | `10win.webp` |
| 7 | `Xx555` | Xx555 | `https://Xx555.com.pk/` | `xx555.webp` |
| 8 | `666c` | 666C Games | `https://666cgames.pk` | `666c.webp` |

---

### STEP 5 — KEY FILES MAP (AGENT KO YAAD RAHEIN)

| File | Kya karta hai |
|---|---|
| `links/` (root folder) | User ke source images (PNG, JPG) — yahan se read karo |
| `public/links/` | Processed WebP + PNG files — yahan save karo |
| `scripts/push-sponsors.mjs` | **Master sponsor list** — `SPONSORS` (Trail 1) aur `SPONSORS_RAIL_2` (Trail 2) dono yahan se control hote hain |
| `src/components/SponsorRailDynamic.tsx` | Trail 1 React component (Gold Theme) |
| `src/components/SponsorRailSecondary.tsx` | Trail 2 React component (Emerald Theme) |
| `functions/api/sponsors.js` | Cloudflare KV endpoint for Trail 1 (`links`) & `?rail=2` |
| `functions/api/sponsors2.js` | Cloudflare KV endpoint for Trail 2 (`links2`) |

---

### DUAL TRAIL (RAIL 1 vs RAIL 2) RULES

1. **Trail 1 (Top / Featured Sponsors):**
   - Theme: Luxury Gold & Obsidian (`SponsorRailDynamic.tsx`)
   - KV Key: `links` (Endpoint: `/api/sponsors`)
   - Top VIP sponsors like Y9999, XD777, JB Game, etc. yahan rehte hain.

2. **Trail 2 (Popular Gaming & Earning Links):**
   - Theme: Vibrant Emerald Neon & Obsidian (`SponsorRailSecondary.tsx`)
   - KV Key: `links2` (Endpoint: `/api/sponsors2`)
   - Starts with initial sponsors (Win786, 10win, Xx555). Jab bhi user kahe "2nd trail mein lagao" ya new links aayein, woh `SPONSORS_RAIL_2` mein add honge.

3. **Multi-Push:**
   - `node scripts/push-sponsors.mjs` dono rails ko ek sath inline Base64 WebP ke sath push karta hai.

---

### STEP 6 — RULES (KABHI MAT TODNA)

- **Images:** HAMESHA `.webp` use karo (quality:82, effort:6). PNG sirf fallback ke liye.
- **Zero Broken Image System:** `push-sponsors.mjs` har image ka 192x192 Base64 WebP thumbnail bana kar direct KV payload mein `imageData` ke tor par inline karta hai. Is se user ko 0.0 seconds mein image milti hai — deployment build ka wait nahi karna parta aur kabhi bhi 404 broken image nahi aati!
- **Auto-Sync Function Fallbacks:** `push-sponsors.mjs` chalate hi `functions/api/sponsors.js` aur `functions/api/sponsors2.js` dono automatically inline Base64 ke saath update ho jate hain.
- **Client-Side Mount:** `HomePage.astro` mein `<SponsorRailDynamic client:only="react" />` aur `<SponsorRailSecondary client:only="react" />` hamesha `client:only="react"` ke saath mount hone chahiye — kabhi SSR hydration mismatch ya jsxDEV crash nahi hoga.
- **Fallback Avatar:** Agar koi image network glitch se load na ho, to `SponsorRailDynamic.tsx` aur `SponsorRailSecondary.tsx` mein `onError` handler stylish casino avatar render karta hai taake site par kabhi ugly broken icon na dikhe.
- **SEO:** Links `rel="noopener"` — koi `nofollow` / `sponsored` mat lagao.
- **Placement:** Sponsors sirf `SponsorRailDynamic.tsx` aur `SponsorRailSecondary.tsx` mein. `Top10Rail.astro` mein kabhi nahi.
- **Live:** KV push karo `npm run sponsors:push` se — 5-30 seconds mein dono rails live.
- **Bulletproof Safe Push:** Git push ke liye hamesha `npm run push:safe` (`node scripts/safe-push.mjs`) use karo. Yeh hamesha `eazagaz-cpu` account lock karta hai aur remote cache refreshes ko auto-rebase karta hai.

---

### STEP 7 — CASINO/GAME LINK PAKARNA (AUTO DETECTION)

Agar user in cheezein deta hai to samjho woh naya **sponsor** dena chahta hai:
- Koi `.pk`, `.com.pk`, `.cc`, `.net` domain
- "game", "earn", "win", "bet", "play" jaisi words URL ya naam mein
- Koi image `links/` folder mein already hogi — pehle `list_dir` se check karo

**User se KABHI mat poochho:**
- "Image kahan hai?" — khud `links/` folder check karo
- "Kaunsa badge lagaun?" — default `🔥 Hot` use karo
- "Kaunsi position?" — agar nahi bola to last mein add karo; agar "top" bola to #1

---

### STEP 8 — FAST BUILD & DEPLOY

```powershell
# Single-command update & deploy (KV + Git push):
npm run sponsors:deploy

# Ya alag alag:
npm run sponsors:push   # 5-30 seconds mein live
npm run push:safe       # Safe rebase and git push

# Fast build (TMDB skip) agar local verify karna ho:
npm run build:fast
```

---

## Fast Build: Use `npm run build:fast` (`SKIP_SYNC=1`) to bypass TMDB sync.
