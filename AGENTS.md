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
| "URL update karo" | sirf URL change karo, position same rakho |

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
# Step 3e: KV push karo
node scripts/push-sponsors.mjs

# Step 3f: Git commit + push
git add -A; git commit -m "feat(sponsor): add <Name>"; git push origin main
```

**YA agar add-sponsor.mjs script use karo (end mein add hota hai):**
```powershell
node scripts/add-sponsor.mjs --name "<slug>" --label "<Display Name>" --url "<URL>" --image "<filename.png>" --tagline "<tagline>" --badge "<badge>"
```
**NOTE:** add-sponsor.mjs sirf END mein add karta hai. Agar top/specific position chahiye to manually `push-sponsors.mjs` edit karo.

---

### STEP 4 — CURRENT SPONSORS (13 Total — Always verify with push-sponsors.mjs)

| # | Label | URL | Image (public/links/) |
|---|---|---|---|
| 1 | XD777 Game | `https://apksting.com.pk/zentro-win-game/` | `XD777.webp` |
| 2 | JB Game | `https://jbgame.pk` | `jb-game.webp` |
| 3 | Bet Rupees | `https://betrupe.com/` | `bet-rupees.webp` |
| 4 | P999 PK | `https://p999pk.org/` | `p999-pk.webp` |
| 5 | Pak Super Game | `https://paksupergame.cc/` | `pak-super-game.webp` |
| 6 | HH98 | `https://hh98.pk/` | `HH98.webp` |
| 7 | JJ77 | `https://jj77apk.pk/` | `JJ77.webp` |
| 8 | M666 Game | `http://m666game.net/` | `M666.webp` |
| 9 | M19 Game | `https://betapk.com.pk/bet939-game-2/` | `M19-game.webp` |
| 10 | 1PPP Game | `https://1pppp.com.pk/` | `1ppp-game.webp` |
| 11 | Win786 | `https://786win.pk/` | `win786.webp` |
| 12 | 10win | `https://110win.com.pk/` | `10win.webp` |
| 13 | Xx555 | `https://Xx555.com.pk/` | `xx555.webp` |

---

### STEP 5 — KEY FILES MAP (AGENT KO YAAD RAHEIN)

| File | Kya karta hai |
|---|---|
| `links/` (root folder) | User ke source images (PNG, JPG) — yahan se read karo |
| `public/links/` | Processed WebP + PNG files — yahan save karo |
| `scripts/push-sponsors.mjs` | **Master sponsor list** — yahan se order/sequence control hota hai |
| `src/components/SponsorRailDynamic.tsx` | React component — FALLBACK array yahan update karo |
| `functions/api/sponsors.js` | Cloudflare KV endpoint |
| `scripts/add-sponsor.mjs` | Auto script (sirf END mein add karta hai) |

---

### STEP 6 — RULES (KABHI MAT TODNA)

- **Images:** HAMESHA `.webp` use karo (quality:82, effort:6). PNG sirf fallback ke liye.
- **SEO:** Links `rel="noopener"` — koi `nofollow` / `sponsored` mat lagao.
- **Placement:** Sponsors sirf `SponsorRailDynamic.tsx` mein. `Top10Rail.astro` mein kabhi nahi.
- **Live:** KV push karo `node scripts/push-sponsors.mjs` se — 5-30 seconds mein live.
- **Build:** Fast build ke liye `npm run build:fast` (SKIP_SYNC=1).
- **Git:** Hamesha PowerShell mein semicolons use karo: `git add -A; git commit -m "..."; git push origin main`

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
# Fast build (TMDB skip)
npm run build:fast

# Sponsors sirf push (no build needed)
node scripts/push-sponsors.mjs

# Git push (PowerShell syntax)
git add -A; git commit -m "feat: ..."; git push origin main
```

---

## Fast Build: Use `npm run build:fast` (`SKIP_SYNC=1`) to bypass TMDB sync.
