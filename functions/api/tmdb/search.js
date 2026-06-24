export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const query = url.searchParams.get('q') || '';
  const apiKey = context.env.TMDB_API_KEY;

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (!query.trim()) {
    return new Response(JSON.stringify({ items: [], query: '' }), { headers });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'TMDB_API_KEY not configured', items: [] }), { headers });
  }

  try {
    const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
    const res = await fetch(tmdbUrl);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const data = await res.json();

    const items = (data.results || [])
      .filter(i => !i.adult && (i.media_type === 'movie' || i.media_type === 'tv') && (i.title || i.name))
      .slice(0, 20)
      .map(i => ({
        id: i.id,
        type: i.media_type === 'tv' ? 'tv' : 'movie',
        title: i.title || i.name,
        year: parseInt((i.release_date || i.first_air_date || '').slice(0, 4)) || 0,
        rating: Math.round((i.vote_average || 0) * 10) / 10,
        posterUrl: i.poster_path ? `https://image.tmdb.org/t/p/w500${i.poster_path}` : '',
        overview: (i.overview || '').slice(0, 200),
      }));

    return new Response(JSON.stringify({ items, query, count: items.length }), {
      headers: { ...headers, 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, items: [] }), { headers });
  }
}
