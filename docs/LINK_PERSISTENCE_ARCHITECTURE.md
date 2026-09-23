# Link Persistence & Fail-Safe Architecture

**Document ID:** `docs/LINK_PERSISTENCE_ARCHITECTURE.md`  
**Date:** September 24, 2026  
**Status:** Permanent Specification  
**Canonical File:** `src/data/sponsor-links.json`  

---

## 1. Architectural Overview

The link persistence system guarantees 100% uptime and zero disappearance for all sponsor, casino, and external affiliate links across `net27.watch` / `net-27.cc`.

```
                    ┌────────────────────────────────────────┐
                    │ CANONICAL SOURCE OF TRUTH              │
                    │ src/data/sponsor-links.json            │
                    │ (Version-controlled in Git)            │
                    └───────────────────┬────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
              ┌─────────────────────┐       ┌─────────────────────┐
              │ PRE-DEPLOY GATE     │       │ KV PUSH & BACKUP    │
              │ scripts/verify-links│       │ scripts/push-sponsors│
              │ (40 Integrity Checks│       │ • Last-Known-Good   │
              │  Blocks bad builds) │       │ • Empty Block       │
              └─────────────────────┘       │ • Read-Back Check   │
                                            └──────────┬──────────┘
                                                       │
                                 ┌─────────────────────┴─────────────────────┐
                                 ▼                                           ▼
                    ┌────────────────────────┐                  ┌────────────────────────┐
                    │ RUNTIME LAYER 1: KV    │                  │ RUNTIME LAYER 2: CODE  │
                    │ Cloudflare KV          │                  │ Cloudflare Pages Funcs │
                    │ Key: 'links'  (Trail 1)│                  │ • Hardcoded Base64     │
                    │ Key: 'links2' (Trail 2)│                  │ • Guaranteed Minimums  │
                    └────────────┬───────────┘                  └────────────┬───────────┘
                                 │                                           │
                                 └─────────────────────┬─────────────────────┘
                                                       │
                                                       ▼
                                      ┌─────────────────────────────────┐
                                      │ /api/sponsors & /api/sponsors2  │
                                      │ Returns KV if valid;            │
                                      │ Auto-fails safe to Layer 2      │
                                      └────────────────┬────────────────┘
                                                       │
                                                       ▼
                                      ┌─────────────────────────────────┐
                                      │ CLIENT-SIDE RENDERING           │
                                      │ SponsorRailDynamic.tsx (Gold)   │
                                      │ SponsorRailSecondary.tsx (Neon) │
                                      │ Layer 3: Bundled React Fallback │
                                      └─────────────────────────────────┘
```

---

## 2. Canonical Source of Truth (`src/data/sponsor-links.json`)

All sponsor links must be declared exclusively in:
`src/data/sponsor-links.json`

### Schema:
```json
{
  "_comment": "CANONICAL SOURCE OF TRUTH — DO NOT DUPLICATE THIS DATA ELSEWHERE.",
  "manifestVersion": "2026-09-24-01",
  "generatedAt": "2026-09-24T02:11:00.000Z",
  "expectedCounts": {
    "trail1": 10,
    "trail2": 9,
    "total": 19
  },
  "trail1": [
    {
      "id": "12th-class-result-check",
      "label": "12th Class Result Check",
      "tagline": "📢 Check Result Online!",
      "url": "https://9thclassresult.org.pk/",
      "image": "/links/12th-class-result-check.webp",
      "imageFile": "12th-class-result-check.webp",
      "badge": "🔥 Hot",
      "enabled": true,
      "priority": 1
    }
    // ...
  ],
  "trail2": [
    // ...
  ]
}
```

No code, script, or component is permitted to maintain an independent hardcoded link array. All functions, generators, and fallbacks derive automatically from this file.

---

## 3. Defense-in-Depth Layers (Triple Fail-Safe)

| Layer | Component | Behavior | Availability Guarantee |
|---|---|---|---|
| **Layer 1: Runtime KV** | Cloudflare KV (`links`, `links2`) | Fast global edge delivery with Base64 thumbnails inlined. | 99.99% edge cache |
| **Layer 2: Pages Function Fallback** | `functions/api/sponsors.js` & `sponsors2.js` | If KV is down, empty, or returns fewer items than required (`< 10` or `< 9`), the Function automatically serves the embedded verified Base64 manifest. | 100% serverless fallback |
| **Layer 3: Client React Fallback** | `SponsorRailDynamic.tsx` & `SponsorRailSecondary.tsx` | If the client device suffers a total network timeout or CORS glitch, the React component renders its embedded state. | 100% offline/client-side fallback |

---

## 4. Last-Known-Good KV Backup

Before any write to Cloudflare KV:
1. `push-sponsors.mjs` inspects the active value of key `links` and `links2`.
2. If healthy and non-empty, it copies the active value to `links_backup` and `links2_backup`.
3. Only then is the new version written to `links` and `links2`.
4. After writing, a read-back verification confirms the key has the expected number of links.

---

## 5. Build-Time Integrity Gate (`verify:links`)

Executed before any deployment in CI/CD and npm scripts:
```bash
npm run verify:links
```

Validates:
- Manifest exists and is valid JSON.
- Top-level metadata (`manifestVersion`, `expectedCounts`, arrays).
- Enabled link counts match `expectedCounts.trail1` and `expectedCounts.trail2`.
- Minimum count thresholds: Trail 1 >= 9, Trail 2 >= 8.
- No duplicate IDs across both trails.
- No empty URLs or missing labels/badges.
- Critical sponsor IDs are all present (e.g. `12th-class-result-check`, `y999-game`, `xd777-sting`, etc.).
- Computes and logs the deterministic 16-character SHA-256 hash.

If any check fails, exit code is 1, and the build/deploy pipeline immediately terminates before touching production.

---

## 6. Official Deployment Paths

Use **only** the official deployment commands:

```bash
# 1. Full Safe Deploy (Integrity Gate + KV Push + Git Rebase/Push):
npm run deploy:safe

# 2. KV Push Only (Instant live update in 5–30 seconds):
npm run sponsors:push

# 3. Post-Deploy Production Verification:
npm run verify:production

# 4. Automated Persistence Test Suite:
npm run test:sponsors
```

---

## 7. CI/CD Concurrency & Branch Safety

Both `.github/workflows/fast-deploy.yml` and `.github/workflows/daily-sync.yml` feature:
```yaml
concurrency:
  group: production-deploy
  cancel-in-progress: true
```
This guarantees that:
- Two workflows never deploy concurrently.
- If a new commit or manual dispatch arrives while a scheduled job is running, the older job is automatically terminated.
- An older build cannot overwrite a newer build in Cloudflare KV or Pages.

---

## 8. Health Diagnostic & Drift Endpoint (`/api/link-health`)

Access live at:
`https://net27.watch/api/link-health`

### Response Payload:
```json
{
  "status": "healthy",
  "manifestVersion": "2026-09-24-01",
  "manifestHash": "8e4956ba6353d9f0",
  "expectedCounts": {
    "trail1": 10,
    "trail2": 9,
    "total": 19
  },
  "activeCounts": {
    "trail1": 10,
    "trail2": 9,
    "total": 19
  },
  "trail1Healthy": true,
  "trail2Healthy": true,
  "source": "kv",
  "missingCritical": [],
  "healed": false,
  "checkedAt": "2026-09-24T02:28:55.000Z"
}
```

### Self-Healing Trigger:
If drift or degradation occurs in KV, hit:
```bash
curl -X POST https://net27.watch/api/link-health
# OR in browser:
https://net27.watch/api/link-health?heal=1
```
The Cloudflare Pages Function will automatically restore healthy sponsor data from the bundled fallback into Cloudflare KV.

---

## 9. Emergency Manual Recovery Procedure

If links are ever suspected of being out of sync:
1. Verify locally:
   ```bash
   npm run verify:links
   ```
2. Force push canonical JSON to KV:
   ```bash
   npm run sponsors:push
   ```
3. Verify live production:
   ```bash
   npm run verify:production
   ```
4. Check health endpoint in browser:
   `https://net27.watch/api/link-health`
