# NET27 Watch — Sponsor Links & Workflow State
> **Last Updated:** 2026-09-17 02:13 PKT  
> **Repository:** `eazagaz-cpu/net-27-astro` (`c:\Users\ic\Desktop\Websites\net-27.cc`)  
> **Live Website:** https://net27.watch  
> **Live Sponsors API:** https://net27.watch/api/sponsors  

---

## 1. Current Live Sponsors (13 Total — Sequence Wise)

| # | Label | Target URL | Image (public/links/) | Badge |
|---|---|---|---|---|
| **#1** | **XD777 Game** | `https://apksting.com.pk/zentro-win-game/` | `XD777.webp` | 🔥 Hot |
| **#2** | **JB Game** | `https://jbgame.pk` | `jb-game.webp` | ⭐ New |
| **#3** | **Bet Rupees** | `https://betrupe.com/` | `bet-rupees.webp` | 🔥 Hot |
| **#4** | **P999 PK** | `https://p999pk.org/` | `p999-pk.webp` | ⭐ New |
| **#5** | **Pak Super Game** | `https://paksupergame.cc/` | `pak-super-game.webp` | 🔥 Hot |
| **#6** | **HH98** | `https://hh98.pk/` | `HH98.webp` | ⭐ New |
| **#7** | **JJ77** | `https://jj77apk.pk/` | `JJ77.webp` | 💥 Hot |
| **#8** | **M666 Game** | `http://m666game.net/` | `M666.webp` | ⭐ New |
| **#9** | **M19 Game** | `https://betapk.com.pk/bet939-game-2/` | `M19-game.webp` | 💥 Hot |
| **#10** | **1PPP Game** | `https://1pppp.com.pk/` | `1ppp-game.webp` | 🔥 Hot |
| **#11** | **Win786** | `https://786win.pk/` | `win786.webp` | 🔥 Hot |
| **#12** | **10win** | `https://110win.com.pk/` | `10win.webp` | ⭐ New |
| **#13** | **Xx555** | `https://Xx555.com.pk/` | `xx555.webp` | 🔥 Hot |

---

## 2. Source Images — `links/` Folder (Root)

Yeh folder user ke original source images ka hai. Jab bhi naya sponsor aata hai, image pehle yahan hoti hai:

| Filename | Corresponding Sponsor |
|---|---|
| `XD 777.png` | XD777 Game (#1) |
| `New Earning Games.png` | JB Game (#2) |
| `Bet Rupees.png` | Bet Rupees (#3) |
| `P999 pk.png` | P999 PK (#4) |
| `pak super game.png` | Pak Super Game (#5) |
| `HH98.png` | HH98 (#6) |
| `JJ77.png` | JJ77 (#7) |
| `M666.png` | M666 Game (#8) |
| `M19 game.png` | M19 Game (#9) |
| `1ppp game.png` | 1PPP Game (#10) |
| `WIN 786.png` | Win786 (#11) |
| `10win.png` | 10win (#12) |
| `Xx555.png` | Xx555 (#13) |

**Agent Rule:** Naya sponsor milne par `list_dir` se `links/` check karo → naam se match karo → convert to WebP → deploy.

---

## 3. Architecture (Cloudflare KV + Pages)

| Component | Details |
|---|---|
| **KV Namespace** | `SPONSORS` (`aa59493bbbed47c0af878405e12bd8fb`) |
| **KV Key** | `links` |
| **API Endpoint** | `https://net27.watch/api/sponsors` |
| **Push Script** | `node scripts/push-sponsors.mjs` |
| **Live Delay** | 5–30 seconds after KV push |
| **Static Images** | Cloudflare Pages deploy karta hai (`public/links/`) |
| **Cache** | `s-maxage=30, stale-while-revalidate=60` |

---

## 4. Workflow — Naya Sponsor Add Karna

### User sirf yeh deta hai:
1. Naam (e.g. "ABC Game")
2. URL (e.g. `https://abcgame.pk/`)
3. Position (optional — nahi bola to last mein)
4. Image → **khud `links/` folder mein hogi** (agent khud dhundhega)

### Agent ka complete workflow:

```powershell
# 1. Image dhundho aur WebP banao
node -e "const s=require('sharp');s('links/ABC Game.png').webp({quality:82,effort:6}).toFile('public/links/abc-game.webp',(e,i)=>console.log(i||e))"

# 2. PNG copy
Copy-Item "links\ABC Game.png" "public\links\abc-game.png" -Force

# 3. push-sponsors.mjs mein sahi position par add karo (manually edit)
# 4. SponsorRailDynamic.tsx FALLBACK mein add karo

# 5. KV push (instant live!)
node scripts/push-sponsors.mjs

# 6. Git commit + push
git add -A; git commit -m "feat(sponsor): add ABC Game"; git push origin main
```

---

## 5. Key Files

| File | Purpose |
|---|---|
| `links/` | Source images (user ke originals) |
| `public/links/` | Processed WebP + PNG (deployed via Pages) |
| `scripts/push-sponsors.mjs` | Master sponsor order + KV push |
| `src/components/SponsorRailDynamic.tsx` | React component with FALLBACK array |
| `scripts/add-sponsor.mjs` | Auto-script (end mein add karta hai) |
| `functions/api/sponsors.js` | Cloudflare Pages Function |
| `AGENTS.md` | Complete agent instructions |
| `SESSION_SPONSORS_STATE.md` | Yeh file — current state |

---

## 6. Fast Build & Deploy

```powershell
npm run build:fast        # Fast build (TMDB skip)
node scripts/push-sponsors.mjs   # Sirf KV update (instant)
git add -A; git commit -m "..."; git push origin main
```
