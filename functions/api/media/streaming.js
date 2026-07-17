// GET /api/media/streaming?title=X&year=YYYY&type=movie|tv&country=xx
// Legal streaming-provider availability (RapidAPI "Streaming Availability" by Movie of the Night).
// Returns official provider deep links only — never a playable/download video URL.

const RAPIDAPI_HOST = 'streaming-availability.p.rapidapi.com';
const TIMEOUT_MS = 8000;
const COUNTRY_RE = /^[a-z]{2}$/;
const MAX_TITLE_LEN = 200;

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  // ── Validate & allowlist every incoming parameter — never pass raw input upstream ──
  const title = (url.searchParams.get('title') || '').trim().slice(0, MAX_TITLE_LEN);
  if (!title) {
    return new Response(JSON.stringify({ error: 'Missing title', providers: [] }), { status: 400, headers });
  }

  const rawType = (url.searchParams.get('type') || 'movie').toLowerCase();
  const showType = rawType === 'tv' || rawType === 'show' || rawType === 'series' ? 'series' : 'movie';

  const rawYear = url.searchParams.get('year') || '';
  const year = /^(19|20)\d{2}$/.test(rawYear) ? rawYear : '';

  const rawCountry = (url.searchParams.get('country') || '').toLowerCase();
  const cfCountry = (context.request.headers.get('CF-IPCountry') || 'US').toLowerCase();
  const country = COUNTRY_RE.test(rawCountry) ? rawCountry : (COUNTRY_RE.test(cfCountry) ? cfCountry : 'us');

  const apiKey = context.env.RAPIDAPI_STREAMING_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Streaming availability unavailable', providers: [] }), { status: 503, headers });
  }

  // Fixed upstream host — callers can never supply a custom URL/hostname.
  const params = new URLSearchParams({ title, country, show_type: showType, series_granularity: 'show', output_language: 'en' });
  const upstreamUrl = `https://${RAPIDAPI_HOST}/shows/search/title?${params.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(upstreamUrl, {
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': apiKey,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    // Auth / rate-limit / server errors — never cached, never expose upstream details.
    if (res.status === 401 || res.status === 403) {
      return new Response(JSON.stringify({ error: 'Streaming availability unavailable', providers: [] }), { status: 502, headers });
    }
    if (res.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limited', providers: [] }), { status: 429, headers });
    }
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Upstream error', providers: [] }), { status: 502, headers });
    }

    const results = await res.json();
    const shows = Array.isArray(results) ? results : [];

    const match = (year ? shows.find(s => String(s.releaseYear) === year) : null) || shows[0] || null;

    const successHeaders = { ...headers, 'Cache-Control': 'public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400' };

    if (!match) {
      return new Response(JSON.stringify({ title: null, country, providers: [] }), { status: 200, headers: successHeaders });
    }

    const options = (match.streamingOptions && match.streamingOptions[country]) || [];
    const seen = new Set();
    const providers = options
      .filter(o => {
        const key = `${o.service?.id}:${o.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(o => ({
        name: o.service?.name || '',
        id: o.service?.id || '',
        type: o.type || '',
        url: o.link || '',
        quality: o.quality || '',
        price: o.price ? { amount: o.price.amount, currency: o.price.currency, formatted: o.price.formatted } : null,
      }))
      // Only surface official deep links — no entry without a real https link.
      .filter(p => p.name && /^https:\/\//i.test(p.url))
      .slice(0, 20);

    return new Response(JSON.stringify({ title: match.title || title, country, providers }), { status: 200, headers: successHeaders });
  } catch (err) {
    clearTimeout(timer);
    const timedOut = err && err.name === 'AbortError';
    return new Response(JSON.stringify({ error: timedOut ? 'Upstream timeout' : 'Failed', providers: [] }), { status: 504, headers });
  }
}
