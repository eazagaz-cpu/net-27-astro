// GET /api/subtitles?title=Avatar&year=2024&type=movie&lang=hi,en
// Returns list of available subtitle files from OpenSubtitles

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const title = url.searchParams.get('title') || '';
  const year  = url.searchParams.get('year')  || '';
  const type  = url.searchParams.get('type')  || 'movie';
  const lang  = url.searchParams.get('lang')  || '';

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

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

// POST /api/subtitles?action=download  body: { file_id }
// Returns a one-time download URL from OpenSubtitles
export async function onRequestPost(context) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  const apiKey = context.env.OPENSUBTITLES_API_KEY;
  const username = context.env.OPENSUBTITLES_USERNAME;
  const password = context.env.OPENSUBTITLES_PASSWORD;
  if (!apiKey || !username || !password) {
    return new Response(JSON.stringify({ error: 'Unavailable' }), { headers });
  }

  const reqUrl = new URL(context.request.url);
  const debug = reqUrl.searchParams.get('debug') === '1';

  // Diagnostic: POST /api/subtitles?whoami=1 — fresh login, return account
  // status (level/vip/allowed_downloads) without exposing the token.
  if (debug && reqUrl.searchParams.get('whoami') === '1') {
    const res = await login(apiKey, username, password);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }
    return new Response(JSON.stringify({ status: res.status, user: data?.user || null, base_url: data?.base_url }), { headers });
  }

  try {
    const body = await context.request.json();
    const fileId = body.file_id;
    if (!fileId) {
      return new Response(JSON.stringify({ error: 'Missing file_id' }), { headers });
    }

    const auth = await getAuthToken(apiKey, username, password);
    if (!auth.token) {
      return new Response(JSON.stringify({ error: 'Download failed', ...(debug && { debug: auth.detail }) }), { headers });
    }

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
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Download failed', ...(debug && { debug: `download ${res.status} (token: ${auth.source}): ${text.slice(0, 300)}` }) }), { headers });
    }

    const data = JSON.parse(text);
    return new Response(JSON.stringify({ link: data.link || '', fileName: data.file_name || '' }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed', ...(debug && { debug: String(e) }) }), { headers });
  }
}
