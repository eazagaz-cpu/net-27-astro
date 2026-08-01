// GET /api/subtitles?title=Avatar&year=2024&type=movie&lang=hi,en
//   Search: list of available subtitle files
// GET /api/subtitles?action=vtt&file_id=12345
//   Fetch + convert one subtitle to WebVTT, served directly for in-player
//   captions (embed providers that support it fetch this URL themselves —
//   it is never downloaded to the user's device)
// GET /api/subtitles?action=whoami&debug=1
//   Diagnostic: OpenSubtitles account status, no token exposed

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const action = url.searchParams.get('action');
  const debug = url.searchParams.get('debug') === '1';

  if (action === 'vtt') return handleVtt(context, url);
  if (action === 'whoami') return handleWhoami(context, debug);

  const title = url.searchParams.get('title') || '';
  const year  = url.searchParams.get('year')  || '';
  const type  = url.searchParams.get('type')  || 'movie';
  const lang  = url.searchParams.get('lang')  || '';

  const headers = { 'Content-Type': 'application/json', ...CORS_HEADERS };

  if (!title) {
    return new Response(JSON.stringify({ error: 'Missing title', subtitles: [] }), { headers });
  }

  const apiKey = context.env.OPENSUBTITLES_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Subtitles unavailable', subtitles: [] }), { headers });
  }

  try {
    const params = new URLSearchParams({
      query: title,
      type: type === 'tv' ? 'episode' : 'movie',
      ...(lang && { languages: lang }),
      ...(year && { year }),
      order_by: 'download_count',
    });

    const res = await fetch(`https://api.opensubtitles.com/api/v1/subtitles?${params}`, {
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'NetMirror v1.0',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Subtitles unavailable', subtitles: [] }), { headers });
    }

    const data = await res.json();
    const items = (data.data || []).slice(0, 30);

    // Group by language, pick top result per language
    const byLang = {};
    for (const item of items) {
      const attrs = item.attributes;
      const langCode = attrs?.language;
      if (!langCode || byLang[langCode]) continue;
      const file = attrs?.files?.[0];
      if (!file?.file_id) continue;
      byLang[langCode] = {
        language: langCode,
        langName: attrs.language_name || langCode,
        fileId: file.file_id,
        fileName: file.file_name || '',
        downloads: attrs.download_count || 0,
        rating: attrs.ratings || 0,
        format: attrs.format || 'srt',
      };
    }

    const subtitles = Object.values(byLang).sort((a, b) => b.downloads - a.downloads);

    return new Response(JSON.stringify({ subtitles }), {
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed', subtitles: [] }), { headers });
  }
}

// OpenSubtitles' /download endpoint requires a logged-in user's Bearer token
// (the Api-Key alone only covers /subtitles search). Login is rate-limited to
// 1 req/sec per IP, so the token is cached (Cache API, per-colo) and reused
// across downloads instead of logging in on every request.
const TOKEN_CACHE_KEY = 'https://net-27-internal.cache/opensubtitles-token';
const TOKEN_CACHE_TTL = 20 * 60 * 60; // OpenSubtitles JWTs last ~24h — refresh before that

async function login(apiKey, username, password) {
  return fetch('https://api.opensubtitles.com/api/v1/login', {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'NetMirror v1.0',
    },
    body: JSON.stringify({ username, password }),
  });
}

async function getAuthToken(apiKey, username, password) {
  const cache = caches.default;
  const cacheKey = new Request(TOKEN_CACHE_KEY);

  const cached = await cache.match(cacheKey);
  if (cached) {
    const { token } = await cached.json();
    if (token) return { token, source: 'cache' };
  }

  let res = await login(apiKey, username, password);
  if (res.status === 429) {
    // Respect OpenSubtitles' login rate limit and retry once.
    await new Promise(r => setTimeout(r, 1100));
    res = await login(apiKey, username, password);
  }
  const text = await res.text();
  if (!res.ok) return { token: null, detail: `login ${res.status}: ${text.slice(0, 300)}` };

  let data;
  try { data = JSON.parse(text); } catch { return { token: null, detail: `login parse error: ${text.slice(0, 200)}` }; }
  const token = data.token || null;
  if (!token) return { token: null, detail: `login: no token field: ${text.slice(0, 200)}` };

  await cache.put(cacheKey, new Response(JSON.stringify({ token }), {
    headers: { 'Cache-Control': `public, max-age=${TOKEN_CACHE_TTL}` },
  }));

  return { token, source: 'fresh' };
}

async function fetchDownloadLink(apiKey, username, password, fileId) {
  const auth = await getAuthToken(apiKey, username, password);
  if (!auth.token) return { link: null, detail: auth.detail };

  const downloadOnce = () => fetch('https://api.opensubtitles.com/api/v1/download', {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'NetMirror v1.0',
    },
    body: JSON.stringify({ file_id: fileId }),
  });

  let res = await downloadOnce();
  // OpenSubtitles' /download endpoint occasionally returns a transient 503
  // ("high traffic or maintenance") even with a valid token — retry once.
  if (res.status === 503) {
    await new Promise(r => setTimeout(r, 800));
    res = await downloadOnce();
  }

  const text = await res.text();
  if (!res.ok) return { link: null, detail: `download ${res.status} (token: ${auth.source}): ${text.slice(0, 300)}` };

  let data;
  try { data = JSON.parse(text); } catch { return { link: null, detail: `download parse error: ${text.slice(0, 200)}` }; }
  return { link: data.link || null, fileName: data.file_name || '' };
}

// SRT and WebVTT are near-identical: WebVTT needs a "WEBVTT" header, "."
// instead of "," in timestamps, and cue-number lines are optional (dropped
// here rather than validated/renumbered).
function srtToVtt(srt) {
  const body = srt
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter(line => !/^\d+$/.test(line.trim()))
    .join('\n')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  return `WEBVTT\n\n${body}`;
}

async function handleVtt(context, url) {
  const headers = { 'Content-Type': 'application/json', ...CORS_HEADERS };
  const fileId = url.searchParams.get('file_id');
  if (!fileId) return new Response(JSON.stringify({ error: 'Missing file_id' }), { headers });

  const apiKey = context.env.OPENSUBTITLES_API_KEY;
  const username = context.env.OPENSUBTITLES_USERNAME;
  const password = context.env.OPENSUBTITLES_PASSWORD;
  if (!apiKey || !username || !password) {
    return new Response(JSON.stringify({ error: 'Unavailable' }), { headers });
  }

  const dl = await fetchDownloadLink(apiKey, username, password, fileId);
  if (!dl.link) {
    return new Response(JSON.stringify({ error: 'Subtitle unavailable' }), { headers });
  }

  const srtRes = await fetch(dl.link);
  if (!srtRes.ok) {
    return new Response(JSON.stringify({ error: 'Subtitle unavailable' }), { headers });
  }

  const vtt = srtToVtt(await srtRes.text());
  return new Response(vtt, {
    headers: {
      'Content-Type': 'text/vtt; charset=utf-8',
      ...CORS_HEADERS,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

// Diagnostic only: fresh login, return account status (level/vip/allowed_downloads)
// without exposing the token. Gated behind ?debug=1 so it stays safe to leave live.
async function handleWhoami(context, debug) {
  const headers = { 'Content-Type': 'application/json', ...CORS_HEADERS };
  if (!debug) return new Response(JSON.stringify({ error: 'Not found' }), { headers, status: 404 });

  const apiKey = context.env.OPENSUBTITLES_API_KEY;
  const username = context.env.OPENSUBTITLES_USERNAME;
  const password = context.env.OPENSUBTITLES_PASSWORD;
  if (!apiKey || !username || !password) {
    return new Response(JSON.stringify({ error: 'Unavailable' }), { headers });
  }

  const res = await login(apiKey, username, password);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = null; }
  return new Response(JSON.stringify({ status: res.status, user: data?.user || null, base_url: data?.base_url }), { headers });
}
