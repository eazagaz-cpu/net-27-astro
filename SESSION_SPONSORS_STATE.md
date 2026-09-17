# NET27 Watch — Sponsor Links & Dual-Rail Workflow State
> **Last Updated:** 2026-09-17 13:15 PKT  
> **Repository:** `eazagaz-cpu/net-27-astro` (`c:\Users\ic\Desktop\Websites\net-27.cc`)  
> **Live Website:** https://net27.watch  
> **Trail 1 API:** https://net27.watch/api/sponsors  
> **Trail 2 API:** https://net27.watch/api/sponsors2  

---

## 1. Master Active Sponsor Inventory (16 Total — Sequence Wise)

### 🎯 Trail 1: Top / Featured Sponsors (9 Links)
- **Component:** `src/components/SponsorRailDynamic.tsx`
- **Theme:** Luxury Gold & Obsidian (`#f5c518`)
- **Cloudflare KV Key:** `links` (API: `/api/sponsors`)

| # | Label | Target URL | Image (public/links/) | Badge |
|---|---|---|---|---|
| **#1** | **Y9999 Game** | `https://y9999.pk/` | `y999-game.webp` | 🔥 Hot |
| **#2** | **XD777 Game (Sting)** | `https://apksting.com.pk/zentro-win-game/` | `XD777-new.webp` | 🔥 Hot |
| **#3** | **XD777 Game (Gamzu)** | `https://apkgamzu.com.pk/x777-game/` | `XD777.webp` | 🔥 Hot |
| **#4** | **JB Game** | `https://jbgame.pk` | `jb-game.webp` | ⭐ New |
| **#5** | **Bet Rupees** | `https://betrupe.com/` | `bet-rupees.webp` | 🔥 Hot |
| **#6** | **P999 PK** | `https://p999pk.org/` | `p999-pk.webp` | ⭐ New |
| **#7** | **Pak Super Game** | `https://paksupergame.cc/` | `pak-super-game.webp` | 🔥 Hot |
| **#8** | **HH98** | `https://hh98.pk/` | `HH98.webp` | ⭐ New |
| **#9** | **JJ77** | `https://jj77apk.pk/` | `JJ77.webp` | 💥 Hot |

---

### 💎 Trail 2: Popular Gaming Links (7 Links)
- **Component:** `src/components/SponsorRailSecondary.tsx`
- **Theme:** Vibrant Emerald Neon & Obsidian (`#10b981`, `#003322`)
- **Cloudflare KV Key:** `links2` (API: `/api/sponsors2`)

| # | Label | Target URL | Image (public/links/) | Badge |
|---|---|---|---|---|
| **#1** | **PKR365** | `https://gamesapks.com.pk/786ace-game/` | `pkr365.webp` | 🔥 Hot |
| **#2** | **M666 Game** | `http://m666game.net/` | `M666.webp` | ⭐ New |
| **#3** | **M19 Game** | `https://betapk.com.pk/bet939-game-2/` | `M19-game.webp` | 💥 Hot |
| **#4** | **1PPP Game** | `https://1pppp.com.pk/` | `1ppp-game.webp` | 🔥 Hot |
| **#5** | **Win786** | `https://786win.pk/` | `win786.webp` | 🔥 Hot |
| **#6** | **10win** | `https://110win.com.pk/` | `10win.webp` | ⭐ New |
| **#7** | **Xx555** | `https://Xx555.com.pk/` | `xx555.webp` | 🔥 Hot |

---

## 2. Source Images — `links/` Folder (Root)

| Filename | Corresponding Sponsor |
|---|---|
| `Y999 Game.png` | Y9999 Game (Trail 1 #1) |
| `XD 777.png` | XD777 Game - Sting (Trail 1 #2) |
| `XD777.png` | XD777 Game - Gamzu (Trail 1 #3) |
| `New Earning Games.png` | JB Game (Trail 1 #4) |
| `Bet Rupees.png` | Bet Rupees (Trail 1 #5) |
| `P999 pk.png` | P999 PK (Trail 1 #6) |
| `pak super game.png` | Pak Super Game (Trail 1 #7) |
| `HH98.png` | HH98 (Trail 1 #8) |
| `JJ77.png` | JJ77 (Trail 1 #9) |
| `Pkr365.png` | PKR365 (Trail 2 #1) |
| `M666.png` | M666 Game (Trail 2 #2) |
| `M19 game.png` | M19 Game (Trail 2 #3) |
| `1ppp game.png` | 1PPP Game (Trail 2 #4) |
| `WIN 786.png` | Win786 (Trail 2 #5) |
| `10win.png` | 10win (Trail 2 #6) |
| `Xx555.png` | Xx555 (Trail 2 #7) |

---

## 3. Architecture & Zero-Broken-Image Protection

1. **Zero Broken Image System:**
   - `scripts/push-sponsors.mjs` generates 192x192 WebP thumbnails and embeds them directly as Base64 Data URIs (`imageData`) into the KV payload for BOTH trails.
   - Images render in 0.0 seconds with zero HTTP requests. Users never see 404 errors during build/deployment windows.
2. **Fallback Avatars:**
   - Both React components (`SponsorRailDynamic.tsx` and `SponsorRailSecondary.tsx`) feature an `onError` event handler rendering an on-theme glowing casino icon instead of a broken browser icon.
3. **Unique Keys:**
   - Render keys use `${card.name}-${card.url}` so same-anchor links (like both XD777 links) never collide in React.
4. **Instant Push:**
   - Command: `node scripts/push-sponsors.mjs` updates both KV keys (`links` and `links2`) simultaneously in 5–30 seconds.

---

## 4. Key Developer Rules

- **NEVER Overwrite Same Anchors:** Two links with the same display name (e.g. "XD777") are separate campaigns. Both must be retained.
- **Auto Image Search:** Always search `links/` root folder first with fuzzy matching. Never ask user where the image is.
- **Fast Build:** `npm run build:fast` (`SKIP_SYNC=1`) bypasses heavy TMDB sync.
