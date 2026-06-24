export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const name = url.searchParams.get('name') || '';
  const apiKey = context.env.TMDB_API_KEY;

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (!name.trim() || !apiKey) {
    return new Response(JSON.stringify({ profileUrl: '' }), { headers });
  }

  try {
    const tmdbUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(name)}`;
    const res = await fetch(tmdbUrl);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const data = await res.json();

    const person = (data.results || [])[0];
    const profileUrl = person?.profile_path
      ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
      : '';

    return new Response(JSON.stringify({ profileUrl, name: person?.name || name }), {
      headers: { ...headers, 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
    });
  } catch {
    return new Response(JSON.stringify({ profileUrl: '' }), { headers });
  }
}
