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
      return new Response(JSON.stringify({ error: 'Subtitles service error', subtitles: [] }), { headers });
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

// POST /api/subtitles?action=download  body: { file_id }
// Returns a one-time download URL from OpenSubtitles
export async function onRequestPost(context) {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  const apiKey = context.env.OPENSUBTITLES_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Unavailable' }), { headers });
  }

  try {
    const body = await context.request.json();
    const fileId = body.file_id;
    if (!fileId) {
      return new Response(JSON.stringify({ error: 'Missing file_id' }), { headers });
    }

    const res = await fetch('https://api.opensubtitles.com/api/v1/download', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'NetMirror v1.0',
      },
      body: JSON.stringify({ file_id: fileId }),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Download failed' }), { headers });
    }

    const data = await res.json();
    return new Response(JSON.stringify({ link: data.link || '', fileName: data.file_name || '' }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed' }), { headers });
  }
}
