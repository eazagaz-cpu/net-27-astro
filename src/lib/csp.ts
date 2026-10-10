/**
 * csp.ts — the site's Content-Security-Policy, emitted as a <meta> tag by
 * BaseLayout.
 *
 * Why not the HTTP header: Cloudflare Pages drops any _headers value over
 * 2,000 characters, silently. Adding the Adsterra hosts (2026-09-29) took the
 * policy to ~2,900 characters and every page was served with no CSP at all.
 * A <meta> policy has no such limit. public/_headers keeps only what a meta
 * policy cannot carry (frame-ancestors) plus a few cheap non-fetch rules;
 * browsers enforce both policies together.
 *
 * The Adsterra hosts were removed with Adsterra itself on 2026-10-01.
 * /player/ additionally keeps its own, stricter header policy in _headers.
 */

/** Directive → sources. The site-wide policy as of 8632488, minus frame-ancestors (header only). */
const BASE: Record<string, string[]> = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "form-action": ["'self'"],
  "img-src": ["'self'", "data:", "blob:", "https://image.tmdb.org", "https://images.justwatch.com", "https://*.google-analytics.com", "https://*.googletagmanager.com", "https://push-sdk.com"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "script-src": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://*.google-analytics.com", "https://static.cloudflareinsights.com", "https://pagead2.googlesyndication.com", "https://tpc.googlesyndication.com", "https://googleads.g.doubleclick.net", "https://adservice.google.com", "https://ep1.adtrafficquality.google", "https://ep2.adtrafficquality.google", "https://push-sdk.com", "https://apis.google.com", "https://wy.mermenrouelle.com"],
  "connect-src": ["'self'", "https://api.themoviedb.org", "https://www.googletagmanager.com", "https://*.google-analytics.com", "https://analytics.google.com", "https://*.analytics.google.com", "https://stats.g.doubleclick.net", "https://pagead2.googlesyndication.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://push-sdk.com", "https://uidsync.net", "https://wy.mermenrouelle.com"],
  "frame-src": ["https://www.youtube.com", "https://www.youtube-nocookie.com", "https://autoembed.co", "https://*.autoembed.co", "https://vidsrc.to", "https://*.vidsrc.to", "https://vidsrc.cc", "https://*.vidsrc.cc", "https://vidlink.pro", "https://*.vidlink.pro", "https://multiembed.mov", "https://*.multiembed.mov", "https://www.2embed.cc", "https://2embed.cc", "https://*.2embed.cc", "https://superembed.stream", "https://*.superembed.stream", "https://www.2embed.skin", "https://*.2embed.skin", "https://net-27-a4cd1.firebaseapp.com"],
  "media-src": ["'self'", "blob:", "https://autoembed.co", "https://*.autoembed.co", "https://vidsrc.to", "https://*.vidsrc.to", "https://vidsrc.cc", "https://*.vidsrc.cc", "https://vidlink.pro", "https://*.vidlink.pro", "https://multiembed.mov", "https://*.multiembed.mov", "https://www.2embed.cc", "https://2embed.cc", "https://*.2embed.cc", "https://superembed.stream", "https://*.superembed.stream"],
  "worker-src": ["'self'", "blob:"],
  "upgrade-insecure-requests": [],
};

export const SITE_CSP = Object.entries(BASE)
  .map(([directive, sources]) => [directive, ...sources].join(' '))
  .join('; ');
