/**
 * GET /api/og
 *
 * Generates a dynamic Open Graph image (1200×630 PNG) for any movie or show.
 * Uses an SVG template rendered server-side then returned as image/svg+xml
 * (browsers and social crawlers like WhatsApp, Twitter, Facebook all accept SVG
 * for og:image when served with the correct Content-Type and dimensions).
 *
 * Query params:
 *   title   — movie/show title (required)
 *   year    — release year
 *   rating  — e.g. "8.4"
 *   type    — "movie" | "tv"
 *   poster  — full TMDB poster URL (https://image.tmdb.org/t/p/w500/...)
 *   genres  — comma-separated genre list
 *   rated   — content rating, e.g. "PG-13"
 *
 * Cache: 7 days — posters don't change.
 */

const SITE_NAME = 'NetMirror';
const SITE_URL  = 'https://net-27.cc';

// Colour palette
const BG_DARK  = '#0a0a0f';
const BG_CARD  = '#13131a';
const RED      = '#e50914';
const RED_DIM  = 'rgba(229,9,20,0.12)';
const WHITE    = '#ffffff';
const MUTED    = 'rgba(255,255,255,0.45)';
const STAR_CLR = '#f5c518';

/** Truncate to at most `n` chars, breaking on a word boundary. */
function trunc(s: string, n: number): string {
  if (!s) return '';
  if (s.length <= n) return s;
  return s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}

/** Escape XML special chars so user-supplied strings are safe inside SVG. */
function esc(s: string): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Fetch the poster and return it as a base64 data URI,
 * or null if the URL is missing / fetch fails.
 */
async function posterDataUri(url: string | null): Promise<string | null> {
  if (!url) return null;
  // Only allow TMDB images
  if (!/^https:\/\/image\.tmdb\.org\//i.test(url)) return null;
  try {
    const res = await fetch(url, { cf: { cacheTtl: 86400 * 7 } } as RequestInit);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const mime = res.headers.get('content-type') || 'image/jpeg';
    return `data:${mime};base64,${b64}`;
  } catch {
    return null;
  }
}

function buildSvg(params: {
  title: string;
  year: string;
  rating: string;
  type: string;
  genres: string;
  rated: string;
  posterDataUri: string | null;
}): string {
  const { title, year, rating, type, genres, rated, posterDataUri: poster } = params;

  const titleSafe  = esc(trunc(title,  52));
  const yearSafe   = esc(year);
  const ratingNum  = parseFloat(rating);
  const ratingText = ratingNum > 0 ? ratingNum.toFixed(1) : '';
  const genreList  = genres ? esc(trunc(genres, 48)) : '';
  const typeLabel  = type === 'tv' ? 'TV SERIES' : 'MOVIE';
  const ratedBadge = rated ? esc(rated) : '';

  // Poster column width
  const posterW = 210;
  const posterH = 315; // 2:3 ratio
  const posterX = 60;
  const posterY = (630 - posterH) / 2; // vertically centred

  // Text column
  const textX = posterX + posterW + 52;
  const textW = 1200 - textX - 60;

  // Star fill (0–10 → 0–100%)
  const starFill = ratingNum > 0 ? Math.min(100, (ratingNum / 10) * 100) : 0;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#0d0d14"/>
      <stop offset="100%" stop-color="#080810"/>
    </linearGradient>
    <!-- Red glow behind poster -->
    <radialGradient id="glow" cx="${posterX + posterW / 2}" cy="${630 / 2}" r="260" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="${RED}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${RED}" stop-opacity="0"/>
    </radialGradient>
    <!-- Poster clip -->
    <clipPath id="pc">
      <rect x="${posterX}" y="${posterY}" width="${posterW}" height="${posterH}" rx="12" ry="12"/>
    </clipPath>
    <!-- Right-side gradient fade (logo area) -->
    <linearGradient id="rfade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="80%" stop-color="${BG_DARK}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${BG_DARK}"/>
    </linearGradient>
  </defs>

  <!-- BG -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle grid pattern -->
  <rect width="1200" height="630" fill="none"
        style="stroke:rgba(255,255,255,0.025);stroke-width:1"
        stroke-dasharray="40 40"/>

  <!-- Red glow -->
  <ellipse cx="${posterX + posterW / 2}" cy="${630 / 2}" rx="240" ry="260" fill="url(#glow)"/>

  <!-- Poster placeholder (shown when no poster) -->
  <rect x="${posterX}" y="${posterY}" width="${posterW}" height="${posterH}" rx="12"
        fill="${BG_CARD}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

  <!-- Poster image (if loaded) -->
  ${poster ? `<image href="${poster}" x="${posterX}" y="${posterY}" width="${posterW}" height="${posterH}" clip-path="url(#pc)" preserveAspectRatio="xMidYMid slice"/>` : `
  <!-- No-poster fallback: show title initial -->
  <text x="${posterX + posterW / 2}" y="${posterY + posterH / 2 + 18}"
        text-anchor="middle" font-family="system-ui, sans-serif"
        font-size="72" font-weight="900" fill="rgba(255,255,255,0.08)">${esc(title.charAt(0).toUpperCase())}</text>`}

  <!-- Poster border glow -->
  <rect x="${posterX}" y="${posterY}" width="${posterW}" height="${posterH}" rx="12"
        fill="none" stroke="${RED}" stroke-width="1.5" stroke-opacity="0.35"/>

  <!-- ── Text column ─────────────────────────────────────────────────────── -->

  <!-- Type badge -->
  <rect x="${textX}" y="130" width="${typeLabel.length * 9 + 20}" height="24" rx="5"
        fill="${RED_DIM}"/>
  <rect x="${textX}" y="130" width="${typeLabel.length * 9 + 20}" height="24" rx="5"
        fill="none" stroke="${RED}" stroke-width="1" stroke-opacity="0.5"/>
  <text x="${textX + 10}" y="146"
        font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800"
        fill="${RED}" letter-spacing="1.2">${typeLabel}</text>

  ${ratedBadge ? `
  <!-- Content rating badge -->
  <rect x="${textX + typeLabel.length * 9 + 36}" y="130"
        width="${ratedBadge.length * 8 + 16}" height="24" rx="5"
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <text x="${textX + typeLabel.length * 9 + 36 + (ratedBadge.length * 8 + 16) / 2}" y="146"
        text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="11" font-weight="700"
        fill="rgba(255,255,255,0.55)">${ratedBadge}</text>` : ''}

  <!-- Title -->
  <text x="${textX}" y="${titleSafe.length > 30 ? '196' : '208'}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${titleSafe.length > 36 ? '36' : '44'}"
        font-weight="900" fill="${WHITE}"
        textLength="${Math.min(textW, titleSafe.length * (titleSafe.length > 36 ? 22 : 27))}"
        lengthAdjust="spacingAndGlyphs">
    ${titleSafe}
  </text>

  <!-- Year -->
  ${yearSafe ? `<text x="${textX}" y="${titleSafe.length > 30 ? '232' : '248'}"
        font-family="system-ui, sans-serif" font-size="20" fill="${MUTED}" font-weight="500">
    ${yearSafe}
  </text>` : ''}

  <!-- Divider line -->
  <line x1="${textX}" y1="${titleSafe.length > 30 ? '254' : '270'}"
        x2="${textX + Math.min(textW, 480)}" y2="${titleSafe.length > 30 ? '254' : '270'}"
        stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Rating row -->
  ${ratingText ? `
  <text x="${textX}" y="${titleSafe.length > 30 ? '290' : '306'}"
        font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="${STAR_CLR}">★</text>
  <text x="${textX + 34}" y="${titleSafe.length > 30 ? '290' : '306'}"
        font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="${WHITE}">${ratingText}</text>
  <text x="${textX + 34 + ratingText.length * 17}" y="${titleSafe.length > 30 ? '290' : '306'}"
        font-family="system-ui, sans-serif" font-size="16" fill="${MUTED}"> /10</text>` : ''}

  <!-- Genre list -->
  ${genreList ? `<text x="${textX}" y="${titleSafe.length > 30 ? '330' : '350'}"
        font-family="system-ui, sans-serif" font-size="16" fill="${MUTED}">
    ${genreList}
  </text>` : ''}

  <!-- Watch now pill -->
  <rect x="${textX}" y="${titleSafe.length > 30 ? '380' : '400'}"
        width="190" height="44" rx="22" fill="${RED}"/>
  <text x="${textX + 95}" y="${titleSafe.length > 30 ? '408' : '428'}"
        text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="${WHITE}">
    ▶  Watch Free
  </text>

  <!-- ── Bottom branding bar ──────────────────────────────────────────────── -->
  <rect x="0" y="570" width="1200" height="60" fill="rgba(0,0,0,0.6)"/>
  <line x1="0" y1="570" x2="1200" y2="570" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

  <!-- NetMirror logo text -->
  <text x="60" y="608"
        font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900">
    <tspan fill="${RED}">Net</tspan><tspan fill="${WHITE}">Mirror</tspan>
  </text>

  <!-- Domain -->
  <text x="1140" y="608" text-anchor="end"
        font-family="system-ui, sans-serif" font-size="14" fill="${MUTED}">
    net-27.cc
  </text>

  <!-- Tagline -->
  <text x="600" y="608" text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="13" fill="rgba(255,255,255,0.25)">
    Free streaming discovery — movies, shows, anime
  </text>
</svg>`;
}

export async function onRequestGet(context: { request: Request }): Promise<Response> {
  const url    = new URL(context.request.url);
  const title  = url.searchParams.get('title')  || 'NetMirror';
  const year   = url.searchParams.get('year')   || '';
  const rating = url.searchParams.get('rating') || '';
  const type   = url.searchParams.get('type')   || 'movie';
  const poster = url.searchParams.get('poster') || '';
  const genres = url.searchParams.get('genres') || '';
  const rated  = url.searchParams.get('rated')  || '';

  // Fetch poster and encode as data URI so crawlers don't need to follow external links
  const imgData = await posterDataUri(poster);

  const svg = buildSvg({ title, year, rating, type, genres, rated, posterDataUri: imgData });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
      'Vary': 'Accept',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
