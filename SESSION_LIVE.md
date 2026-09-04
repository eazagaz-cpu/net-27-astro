# NetMirror (net-27.cc) — Live Incident Remediation & Session Log

**Session Timestamp:** 2026-09-05T03:40:00+05:00  
**Domain:** `https://net-27.cc`  
**Project:** `net-27.cc`  
**Platform / Stack:** Astro 5.7 (SSG) + Cloudflare Pages Functions + TailwindCSS  
**Status:** **ACTIVE / LIVE SAVED**  

---

## 1. Incident Overview & Threat Intelligence

### 1.1 Cloudflare Phishing Warning
- **Target URL:** `https://net-27.cc/`
- **Cloudflare Report ID:** `c4038a977bbb788e`
- **Classification:** Phishing Mitigation Page (interstitial warning blocking user access)
- **Stated Grounds:** Allegation of impersonating / imitating Netflix.

### 1.2 DMCA / Legal Abuse Complaints
Cloudflare Abuse Reports received for specific catalog entries:
1. **Report ID `afd2de4e15d0c7ae`**:  
   `https://net-27.cc/movies/spider-man-brand-new-day-969681`
2. **Report ID `a37e65dce9a83274`**:  
   `https://net-27.cc/movies/the-death-of-robin-hood-1284465/`
3. **Active 451 Mitigation**:  
   `https://net-27.cc/player?id=1477712&type=movie`

### 1.3 Vendor Threat Intelligence Scans
- **Fortinet / FortiGuard Labs:** Rated domain `net-27.cc` as **"Spam URLs"**.
- **Forcepoint:** Categorized domain as **"Malicious"**.
- **VirusTotal Scan:** Identified flags stemming from third-party advertising script redirects.
- **Root Cause Identified:** The third-party popunder network **ProfitON / `sortallav.com`** was serving ad redirects to low-reputation / spam / deceptive endpoints. This compromised the domain reputation across major threat databases and triggered Cloudflare's automated and manual abuse filters.

---

## 2. Technical Remediation Actions (Completed)

### 2.1 Complete Removal of Popunder & Adware Scripts
- **`src/components/PopAd.astro`**: Emptied completely to an inert stub to prevent broken imports while permanently removing all code executing `sortallav.com` or ProfitON ad triggers.
- **`src/layouts/BaseLayout.astro`**: Set `showPopAd = false` and removed any verification meta tags (`profiton-domain-verification`).
- **`public/_headers`**: Removed `*.sortallav.com` from `Content-Security-Policy` (`script-src`, `connect-src`, `frame-src`). Removed old comments suggesting re-enabling ads.
- **Codebase Scan:** Verified zero remaining occurrences of `sortallav`, `profiton`, or unauthorized ad networks across all `.astro`, `.ts`, `.tsx`, `.js`, and `.mjs` files.

### 2.2 Brand Disassociation & Phishing Defense
- **Audit Findings:** The site never hosted fake login forms, credential harvesting scripts, or direct brand asset clones. However, rail categories like "Popular on Netflix" combined with popunder behavior triggered heuristic phishing flags.
- **Independence Disclaimer:** Added a prominent, permanent legal disclaimer on `HomePage.astro` and footer:
  > *"NetMirror is an independent catalog and search index for movie and television metadata. NetMirror is not affiliated with, endorsed by, or associated with Netflix, Disney, Amazon, or any other streaming platform. All trademarks and brand names belong to their respective owners."*
- **Platform Directory Clarification:** Verified that platform chips (`/platform/netflix/`, etc.) clearly function as content metadata filters rather than brand impersonation portals.

### 2.3 Application-Layer DMCA Enforcement
> **Critical Architectural Decision:**  
> Cloudflare Pages `_redirects` does **NOT** support HTTP 410 Gone status codes (only 301/302/303/307/308) and does **NOT** support matching query parameters (`/player?id=...`). Therefore, all DMCA denials are enforced strictly at the **application layer**.

1. **Centralized Deny List (`src/lib/dmcaDenyList.ts`)**:
   - Maintains permanent sets for `DMCA_DENIED_SLUGS` and `DMCA_DENIED_TMDB_IDS`:
     - `spider-man-brand-new-day-969681` (TMDB 969681)
     - `the-death-of-robin-hood-1284465` (TMDB 1284465)
     - TMDB ID `1477712` (Player route takedown)
   - Exports helper functions `isDmcaDenied()` and `isDmcaBlockedId()`.

2. **Static Route Omission (Genuine HTTP 404)**:
   - Updated `src/pages/movies/[slug].astro` and `src/pages/[lang]/movies/[slug].astro` to filter out all slugs in `DMCA_DENIED_SLUGS` from `getStaticPaths()`.
   - Result: HTML files for reported slugs are never written to `dist/`. Cloudflare Pages edge automatically returns genuine HTTP 404 Not Found.

3. **Edge Function for Query Parameter Blocking (`functions/player.js`)**:
   - Cloudflare Pages Function intercepts incoming requests to `/player`.
   - Inspects `id` and `type` search parameters server-side.
   - If `id` matches `1477712` (or any entry in `DMCA_BLOCKED_IDS`), the function immediately halts and returns a clean HTTP 404 response with `no-store` and `noindex` headers:
     ```json
     Status: 404 Not Found
     Content-Type: text/html; charset=utf-8
     Cache-Control: no-store
     X-Robots-Tag: noindex
     ```
   - No player iframe, third-party embed, or API call is ever loaded or rendered.

4. **Client-Side Defense-in-Depth (`src/pages/player.astro`)**:
   - Added `isDmcaBlockedId(id)` validation in the client script.
   - If accessed directly or via local preview, execution throws immediately and replaces DOM with "Content Not Available" screen.

5. **Search Engine & Sitemap Filtering (`astro.config.mjs`)**:
   - Excluded all DMCA-denied slugs from generating inside `sitemap-0.xml` and `sitemap.xml`.
   - Confirmed both DMCA slugs are absent from build artifacts and sitemaps.

6. **Redirects Cleanup (`public/_redirects`)**:
   - Removed legacy, non-functional 410 lines and query-parameter rules.
   - Preserved valid 301 rules (canonical `www` -> non-www, sitemap aliases, legacy route aliases).

---

## 3. Git & Deployment Log

| Commit SHA | Branch | Description | Status |
|---|---|---|---|
| `7b0f902` | `main` | Baseline restore point | Preserved |
| `e2fefa1` | `security/cloudflare-phishing-remediation` | Security: remediate Cloudflare phishing & abuse reports | Committed |
| `ea59459` | `main` | Merge phishing remediation branch to main | Pushed to GitHub |
| `6d9f195` | `main` | Application-layer DMCA enforcement (`functions/player.js`, `_redirects` cleanup, player guard, `SESSION_LIVE.md`) | Committed to main |

### Modified & Created Files in Current Session:
- `src/lib/dmcaDenyList.ts` (NEW / UPDATED)
- `src/components/PopAd.astro` (CLEANED)
- `src/layouts/BaseLayout.astro` (MODIFIED)
- `src/components/pages/HomePage.astro` (MODIFIED)
- `src/pages/movies/[slug].astro` (MODIFIED)
- `src/pages/[lang]/movies/[slug].astro` (MODIFIED)
- `src/pages/player.astro` (MODIFIED)
- `functions/player.js` (NEW)
- `public/_headers` (MODIFIED)
- `public/_redirects` (MODIFIED)
- `astro.config.mjs` (MODIFIED)
- `SESSION_LIVE.md` (NEW)

---

## 4. Verification & Quality Gates

- **CSP Validation (`npm run validate:csp`):**  
  `PASSED` — 0 errors. No external ad scripts loaded.
- **Route Validation (`npm run validate:routes`):**  
  `PASSED` — All primary routes, error handlers, and special files valid.
- **Sitemap Verification:**  
  Confirmed `spider-man-brand-new-day` and `the-death-of-robin-hood` are 100% absent from `sitemap-0.xml` and `sitemap.xml`.
- **Dist File Check:**  
  Verified that `dist/movies/spider-man-brand-new-day-969681` and `dist/movies/the-death-of-robin-hood-1284465` do not exist.

---

## 5. Dispute, Appeals & Whitelisting Runbook

### 5.1 Cloudflare Phishing Review Appeal
- **Action:** Submit false positive review under Report ID `c4038a977bbb788e`.
- **Form / Portal:** Cloudflare Trust & Safety Review Form (`abuse.cloudflare.com/phishing` or Cloudflare Dashboard -> Security -> Overview).
- **Appeal Statement:**
  > *"We have completed a comprehensive security remediation on net-27.cc. The malicious third-party popunder ad network (ProfitON / sortallav.com) that caused security vendor spam alerts has been permanently removed from all source code and Content Security Policy headers. Furthermore, explicit disclaimers have been added confirming net-27.cc is an independent metadata index with no affiliation to Netflix. The site does not harvest credentials or host phishing assets. We respectfully request the immediate removal of the phishing mitigation interstitial."*

### 5.2 Cloudflare DMCA Compliance Emails
Send separate confirmation emails from `admin@net-27.cc` (or registered Cloudflare account email):

#### Email 1: Report `afd2de4e15d0c7ae`
- **To:** `abuse@cloudflare.com`
- **Subject:** `Report ID afd2de4e15d0c7ae - Reported Content Removed`
- **Body:**
  ```text
  Hello Cloudflare Trust & Safety,

  The content reported under Report ID afd2de4e15d0c7ae has been permanently removed from net-27.cc.
  Reported URL: https://net-27.cc/movies/spider-man-brand-new-day-969681

  The URL now returns an HTTP 404 Not Found at the application layer, and the slug has been excluded from our sitemap and build pipeline.

  Best regards,
  NetMirror Administration (net-27.cc)
  ```

#### Email 2: Report `a37e65dce9a83274`
- **To:** `abuse@cloudflare.com`
- **Subject:** `Report ID a37e65dce9a83274 - Reported Content Removed`
- **Body:**
  ```text
  Hello Cloudflare Trust & Safety,

  The content reported under Report ID a37e65dce9a83274 has been permanently removed from net-27.cc.
  Reported URL: https://net-27.cc/movies/the-death-of-robin-hood-1284465/

  The URL now returns an HTTP 404 Not Found at the application layer, and the slug has been excluded from our sitemap and build pipeline.

  Best regards,
  NetMirror Administration (net-27.cc)
  ```

#### Email 3: Active 451 Player Notice
- **To:** `abuse@cloudflare.com`
- **Subject:** `Notice of Mitigation Compliance - /player?id=1477712`
- **Body:**
  ```text
  Hello Cloudflare Trust & Safety,

  Regarding the active mitigation for /player?id=1477712&type=movie:
  We have deployed a server-side Cloudflare Pages Function that inspects query parameters and returns an HTTP 404 Not Found before any player or embed content is loaded. The TMDB ID 1477712 is permanently blocked across our platform.

  Best regards,
  NetMirror Administration (net-27.cc)
  ```

### 5.3 Fortinet & Threat Vendor Re-categorization
1. Navigate to: `https://www.fortiguard.com/webfilter`
2. Search: `net-27.cc`
3. Request Category Change from **"Spam URLs"** to **"Entertainment / Media"**.
4. Explanation: *"The domain has purged all third-party popunder scripts (sortallav.com) and adware integrations. All scripts are now self-contained and verified clean."*

---

## 6. How to Add Future DMCA Takedowns
When a new takedown request is received:
1. Open `src/lib/dmcaDenyList.ts`.
2. Add the slug to `DMCA_DENIED_SLUGS`:
   ```ts
   export const DMCA_DENIED_SLUGS = new Set<string>([
     'spider-man-brand-new-day-969681',
     'the-death-of-robin-hood-1284465',
     'new-reported-slug-here',
   ]);
   ```
3. If a TMDB ID is specified or player route is reported, add to `DMCA_DENIED_TMDB_IDS` in `src/lib/dmcaDenyList.ts` and `DMCA_BLOCKED_IDS` in `functions/player.js`.
4. Run `astro build` and commit changes. Slugs will automatically disappear from sitemaps and return HTTP 404.
