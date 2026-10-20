/**
 * Networks that ran scrapers against the site. Hosting/cloud ASNs only, never
 * a consumer ISP. Trade-off: some commercial VPNs exit from these networks
 * too, so a visitor on such a VPN is refused as well (switching VPN server
 * fixes it).
 *
 * 2026-10-19/20: ~2,000 requests an hour, around the clock, from Tencent
 * Cloud Singapore (AS132203) — 49k requests in 36 hours, more than India. A
 * headless Chrome on rotating old Windows user agents that searched actor
 * names, then hit /player/, /api/media/streaming and /api/server-health. It
 * spent the TMDB key and the Functions quota, and showed up in Google
 * Analytics as "Singapore" visitors.
 *
 * What this 403 saves: TMDB calls, upstream fetches and the API calls the
 * player page would have made. It does NOT save Functions invocations — the
 * request has already started the Function. Only the zone WAF rule on
 * net27.watch, `(ip.src.asnum in {132203} and not cf.client.bot)` → Block,
 * keeps these requests off the quota and out of Google Analytics. It cannot
 * cover net-27-astro.pages.dev, where this check is the only guard. Keep the
 * WAF action at Block: this code refuses even a client that passed a challenge.
 *
 * Kept narrow on purpose. Add an ASN only after seeing it in the analytics or
 * a `pages deployment tail`, and add the same number to the WAF rule.
 * NEVER add:
 *   - AS8075 Microsoft/Azure — GitHub Actions runs the hourly sponsor watchdog
 *     and CI checks from there; a 403 triggers KV re-pushes and redeploys.
 *   - AS15169 Google, AS13335 Cloudflare/WARP — crawlers, link-health's own
 *     subrequests, and ordinary visitors on WARP.
 *   - Alibaba Cloud (AS45102, AS37963) — UC Browser, common in Pakistan and
 *     Bangladesh, fetches pages through Alibaba servers.
 */
export const SCRAPER_ASNS = new Set([
  132203, // Tencent Cloud international, all regions (ACEVILLE PTE. LTD.)
]);

/** True when the request comes from one of SCRAPER_ASNS. */
export function fromScraperNetwork(request) {
  return SCRAPER_ASNS.has(Number(request?.cf?.asn));
}

/** Short, uncached refusal; noindex in case a crawler ever records it. */
export function scraperRefusal() {
  return new Response('Forbidden', {
    status: 403,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
