> ⚠️ **OUTDATED SNAPSHOT — do not use as a sponsor list.** The only list is
> `src/data/sponsor-links.json`; workflow in AGENTS.md ("SPONSOR LINKS SYSTEM").
> Restoring or adding links from this file is how links went missing before.

# NET27 Watch — Sponsor Links & Dual-Rail Workflow State
> **Last Updated:** 2026-09-24 02:30 PKT  
> **Repository:** `eazagaz-cpu/net-27-astro` (`c:\Users\ic\Desktop\Websites\net-27.cc`)  
> **Canonical Source:** `src/data/sponsor-links.json`  
> **Manifest Version:** `2026-09-24-01` | **Manifest Hash:** `8e4956ba6353d9f0`  
> **Live Website:** https://net27.watch  
> **Trail 1 API:** https://net27.watch/api/sponsors  
> **Trail 2 API:** https://net27.watch/api/sponsors2  
> **Diagnostic Health:** https://net27.watch/api/link-health  

---

## 1. Master Active Sponsor Inventory (19 Total — Sequence Wise)

### 🎯 Trail 1: Top / Featured Sponsors (10 Links)
- **Component:** `src/components/SponsorRailDynamic.tsx`
- **Theme:** Luxury Gold & Obsidian (`#f5c518`)
- **Cloudflare KV Key:** `links` (Backup: `links_backup`)
- **API Endpoint:** `/api/sponsors`

| # | ID Key | Label | Target URL | Image (public/links/) | Badge |
|---|---|---|---|---|---|
| **#1** | `12th-class-result-check` | **12th Class Result Check** | `https://9thclassresult.org.pk/` | `12th-class-result-check.webp` | 🔥 Hot |
| **#2** | `y999-game` | **Y9999 Game** | `https://y9999.pk/` | `y999-game.webp` | 🔥 Hot |
| **#3** | `xd777-sting` | **XD777 Game (Sting)** | `https://apksting.com.pk/zentro-win-game/` | `XD777-new.webp` | 🔥 Hot |
| **#4** | `xd777-gamzu` | **XD777 Game (Gamzu)** | `https://apkgamzu.com.pk/x777-game/` | `XD777.webp` | 🔥 Hot |
| **#5** | `jb-game` | **JB Game** | `https://jbgame.pk` | `jb-game.webp` | ⭐ New |
| **#6** | `bet-rupees` | **Bet Rupees** | `https://betrupe.com/` | `bet-rupees.webp` | 🔥 Hot |
| **#7** | `p999-pk` | **P999 PK** | `https://p999pk.org/` | `p999-pk.webp` | ⭐ New |
| **#8** | `pak-super-game` | **Pak Super Game** | `https://paksupergame.cc/` | `pak-super-game.webp` | 🔥 Hot |
| **#9** | `hh98` | **HH98** | `https://hh98.pk/` | `HH98.webp` | ⭐ New |
| **#10** | `jj77` | **JJ77** | `https://jj77apk.pk/` | `JJ77.webp` | 💥 Hot |

---

### 💎 Trail 2: Popular Gaming Links (9 Links)
- **Component:** `src/components/SponsorRailSecondary.tsx`
- **Theme:** Vibrant Emerald Neon & Obsidian (`#10b981`, `#003322`)
- **Cloudflare KV Key:** `links2` (Backup: `links2_backup`)
- **API Endpoint:** `/api/sponsors2`

| # | ID Key | Label | Target URL | Image (public/links/) | Badge |
|---|---|---|---|---|---|
| **#1** | `12th-class-result` | **12th Class Result** | `https://12thclassresult.com.pk/` | `12th-class-result.webp` | 🎓 Hot |
| **#2** | `pkr365` | **PKR365** | `https://gamesapks.com.pk/786ace-game/` | `pkr365.webp` | 🔥 Hot |
| **#3** | `m666` | **M666 Game** | `http://m666game.net/` | `M666.webp` | ⭐ New |
| **#4** | `m19-game` | **M19 Game** | `https://betapk.com.pk/bet939-game-2/` | `M19-game.webp` | 💥 Hot |
| **#5** | `1ppp-game` | **1PPP Game** | `https://1pppp.com.pk/` | `1ppp-game.webp` | 🔥 Hot |
| **#6** | `win786` | **Win786** | `https://786win.pk/` | `win786.webp` | 🔥 Hot |
| **#7** | `10win` | **10win** | `https://110win.com.pk/` | `10win.webp` | ⭐ New |
| **#8** | `xx555` | **Xx555** | `https://Xx555.com.pk/` | `xx555.webp` | 🔥 Hot |
| **#9** | `666c` | **666C Games** | `https://666cgames.pk` | `666c.webp` | 🎮 New |

---

## 2. Fail-Safe Commands

| Command | Action |
|---|---|
| `npm run verify:links` | Pre-deploy integrity check (40 rules) |
| `npm run sponsors:push` | Push canonical JSON to Cloudflare KV + backup + auto-sync functions |
| `npm run verify:production` | Post-deploy live production validation |
| `npm run deploy:safe` | All-in-one safe deployment (Gate + KV + Push) |
| `npm run test:sponsors` | Automated test suite (45 unit/integration tests) |

---

## 3. Architecture Documentation
- **Root Cause Analysis:** `docs/LINK_PERSISTENCE_ROOT_CAUSE.md`
- **Fail-Safe Architecture:** `docs/LINK_PERSISTENCE_ARCHITECTURE.md`
