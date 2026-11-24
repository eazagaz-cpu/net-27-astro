/**
 * /api/tmdb/similar-tv?id=TMDB_ID
 * Returns TMDB /tv/{id}/similar results (filtered, cached 1h).
 */

const CACHE_SECONDS = 3600; // 1 hour

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const id  = url.searchParams.get('id') || '';
  const apiKey = context.env.TMDB_API_KEY;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
  };

  if (!id || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing id or API key' }), { status: 400, headers });
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/similar?api_key=${apiKey}&language=en-US&page=1`
    );
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const data = await res.json();

    const results = (data.results || [])
      .filter(r => r.poster_path)
      .slice(0, 12);

    return new Response(JSON.stringify({ results }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ results: [], error: 'upstream error' }), { headers });
  }
}
