# Root Cause Analysis: Link Persistence Failure on net-27.cc

**Document ID:** `docs/LINK_PERSISTENCE_ROOT_CAUSE.md`  
**Date:** September 24, 2026  
**Status:** Definitively Identified & Solved  
**Target Domain:** `https://net27.watch` / `https://net-27.cc`  

---

## 1. Executive Summary

Every 2–3 days, certain sponsor/gaming links (most recently `12th Class Result Check` and others) were reported as disappearing from the production site. This issue occurred repeatedly (6–7 historical fixes).

The root cause was **not** a single bug, but an architectural fragility stemming from **four competing sources of truth**, **missing concurrency controls in GitHub Actions**, **silent build-time drift**, and **lack of write-side KV and post-deploy production verification**.

---

## 2. Complete Lifecycle Flow Audit

```
┌──────────────────────────────────────────────────────────┐
│                   HISTORICAL DRIFT PATH                  │
└──────────────────────────────────────────────────────────┘

1. SOURCE DATA (Fragmented across 4 files)
   ├── scripts/push-sponsors.mjs (Contained 10 links for Trail 1)
   ├── scripts/_build_hardcoded_sponsors.mjs (Contained 9 links — 12th-class missing!)
   ├── src/components/SponsorRailDynamic.tsx (Had hardcoded fallback array)
   └── src/components/SponsorRailSecondary.tsx (Had separate hardcoded fallback array)

2. GIT COMMIT & ACTIONS WORKFLOW
   ├── daily-sync.yml ran 4× daily (cron: 01:00, 07:00, 13:00, 19:00 UTC)
   ├── fast-deploy.yml triggered on UI changes
   └── NO concurrency group was defined on either workflow!
       ↳ An old running daily sync could finish AFTER a fast deploy,
         clobbering fresh KV data with older cached data.

3. BUILD & GENERATION DRIFT
   ├── If npm run sponsors:rebuild was run, it used _build_hardcoded_sponsors.mjs
   └── That script omitted '12th-class-result-check' from Trail 1!
       ↳ Result: functions/api/sponsors.js was overwritten without that link.

4. CLOUDFLARE PAGES & KV RUNTIME
   ├── KV push lacked read-back verification and last-known-good backup
   ├── Runtime fallback served whatever KV returned as long as length > 0
   └── If a partial array of 1 or 2 links was returned, it was served without validation.

5. FRONTEND RENDERING (Client-side)
   ├── Client fetched /api/sponsors or /api/sponsors2
   ├── If the API returned partial data, client rendered partial data.
   └── React component fallback was only used on HTTP network failure (catch block),
       not when the API returned a 200 OK with a degraded/incomplete array.
```

---

## 3. Evidence of Competing Sources of Truth

Prior to this fix, the repository maintained four divergent lists:

| File | Trail 1 Count | Critical Sponsor (`12th-class-result-check`) | Status |
|---|---|---|---|
| `scripts/push-sponsors.mjs` | 10 | Present | Authoritative (manual edits) |
| `scripts/_build_hardcoded_sponsors.mjs` | 9 | **MISSING** | **DIVERGED / STALE** |
| `src/components/SponsorRailDynamic.tsx` | 10 | Present | Hardcoded React Fallback |
| `src/components/SponsorRailSecondary.tsx` | 9 | Present | Hardcoded React Fallback |

### Evidence Found in `scripts/_build_hardcoded_sponsors.mjs`
```javascript
// Historical excerpt from scripts/_build_hardcoded_sponsors.mjs:
// Trail 1 contained only 9 sponsors:
// y999-game, xd777-sting, xd777-gamzu, jb-game, bet-rupees, p999-pk, pak-super-game, hh98, jj77
// 12th-class-result-check was COMPLETELY ABSENT.
```
Whenever `npm run sponsors:rebuild` or a build script touched `_build_hardcoded_sponsors.mjs`, `functions/api/sponsors.js` lost the 10th link.

---

## 4. Analysis of Specific Failure Modes

### 4.1 Race Conditions in GitHub Actions (No Concurrency Group)
- **Mechanism:** Both `daily-sync.yml` (scheduled 4x daily) and `fast-deploy.yml` (dispatch/push) ran workflows without concurrency control.
- **Consequence:** If a manual deploy was triggered while a daily sync was building, both jobs pushed to Cloudflare KV and Pages concurrently. The slower job (often running an older Git commit or stale cache) overwrote the newer job.
- **Evidence:** Workflows lacked `concurrency: group: production-deploy, cancel-in-progress: true`.

### 4.2 Lack of Pre-Deploy Integrity Gate
- **Mechanism:** Neither workflow validated whether required sponsor links existed before proceeding to `astro build` and `wrangler pages deploy`.
- **Consequence:** A developer could edit a file, accidentally misplace a sponsor link, and the CI/CD pipeline would build and deploy the broken state with a green checkmark (`PASS`).

### 4.3 Silent Empty/Partial Overwrite of KV
- **Mechanism:** Historical KV push scripts lacked minimum-count validation. If an empty array was passed, it would execute a `PUT` request to KV, wiping all live links instantly.
- **Consequence:** Any script error during sponsor list processing would result in production links disappearing within seconds.

### 4.4 Degraded Runtime Guard in Functions
- **Mechanism:** `functions/api/sponsors.js` historically contained:
  ```javascript
  const sponsors = (Array.isArray(raw) && raw.length > 0) ? raw : getDefaultSponsors();
  ```
- **Consequence:** If KV contained a partial list (e.g., 2 links instead of 10), `raw.length > 0` was `true`. The function served only 2 links instead of recognizing degradation and falling back to the 10 verified bundled sponsors.

### 4.5 GitHub SSL/Certificate Transient Issues
- **Mechanism:** During transient GitHub runner TLS handshake failures or network timeouts, workflows failed midway.
- **Consequence:** If KV was updated in an early step or if Pages deployment failed after KV update, KV and static assets fell out of sync.

---

## 5. The Solution Implemented

1. **One Authoritative Canonical Manifest:** `src/data/sponsor-links.json` is the sole source of truth. All scripts, function generators, and verifiers read from this file.
2. **Deterministic Versioning & Hashing:** SHA-256 hash generated over the canonical manifest ensures tampering or drift is detected immediately.
3. **Pre-Deploy Integrity Gate (`scripts/verify-links.mjs`):** Runs 40 rigorous checks (schema, minimum counts, duplicate IDs, empty URLs, critical IDs) before build. If any check fails, deployment is aborted with exit code 1.
4. **Non-Destructive KV Synchronization (`scripts/push-sponsors.mjs`):**
   - Refuses to write empty or degraded arrays.
   - Automatically backs up active data to `links_backup` and `links2_backup` before overwriting.
   - Performs read-back verification after a 2-second propagation pause.
5. **Runtime Safe Guard & Self-Healing:**
   - Functions enforce `raw.length >= EXPECTED_TRAIL1` (10) and `raw.length >= EXPECTED_TRAIL2` (9).
   - If KV is degraded or unavailable, full bundled fallbacks are served.
6. **Dedicated Link Health Diagnostic Endpoint:** `functions/api/link-health.js` reports manifest version, hash, active vs. expected counts, and supports self-healing on demand.
7. **CI/CD Concurrency Protection:** Both `fast-deploy.yml` and `daily-sync.yml` are locked under the `production-deploy` concurrency group with `cancel-in-progress: true`.
8. **Post-Deploy Verification (`scripts/verify-production.mjs`):** Queries live `net27.watch` endpoints to ensure live counts match expected manifest counts before marking deployment complete.
