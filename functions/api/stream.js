export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'movie';
  const id   = url.searchParams.get('id') || '';
  const s    = parseInt(url.searchParams.get('s') || '1');
  const e    = parseInt(url.searchParams.get('e') || '1');

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  if (!id) return json({ error: 'Missing id' }, 400);

  const CONSUMET  = (env.CONSUMET_URL || 'https://consumet-api.vercel.app').replace(/\/$/, '');
  const TMDB_KEY  = env.TMDB_KEY || '620634e1a470fb83909c5546b2b119d0';

  try {
    // 1. Get title from TMDB
    const tmdbUrl = type === 'movie'
      ? `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`
      : `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}`;

    const tmdbRes = await fetch(tmdbUrl);
    if (!tmdbRes.ok) return json({ error: 'TMDB unavailable' }, 502);
    const tmdb = await tmdbRes.json();

    const title = type === 'movie' ? tmdb.title : tmdb.name;
    const year  = ((type === 'movie' ? tmdb.release_date : tmdb.first_air_date) || '').split('-')[0];
    if (!title) return json({ error: 'Title not found' }, 404);

    // 2. Search FlixHQ
    const searchRes = await fetch(`${CONSUMET}/movies/flixhq/${encodeURIComponent(title)}`);
    if (!searchRes.ok) return json({ error: 'Search unavailable' }, 502);
    const search = await searchRes.json();
    if (!search.results?.length) return json({ error: 'Not found on stream provider' }, 404);

    // 3. Find best match (type + year)
    const wantType = type === 'movie' ? 'Movie' : 'Tv Series';
    let media = search.results.find(r => r.type === wantType && String(r.releaseDate || '').includes(year));
    if (!media) media = search.results.find(r => r.type === wantType);
    if (!media) return json({ error: 'No matching media' }, 404);

    // 4. Get episode ID from info
    const infoRes = await fetch(`${CONSUMET}/movies/flixhq/info?id=${encodeURIComponent(media.id)}`);
    if (!infoRes.ok) return json({ error: 'Info unavailable' }, 502);
    const info = await infoRes.json();
    const episodes = info.episodes || [];

    let ep;
    if (type === 'movie') {
      ep = episodes[0];
    } else {
      ep = episodes.find(x => x.season === s && x.number === e) || episodes[0];
    }
    if (!ep) return json({ error: 'Episode not found' }, 404);

    // 5. Get stream sources
    const watchRes = await fetch(
      `${CONSUMET}/movies/flixhq/watch?episodeId=${encodeURIComponent(ep.id)}&mediaId=${encodeURIComponent(media.id)}`
    );
    if (!watchRes.ok) return json({ error: 'Stream unavailable' }, 502);
    const watch = await watchRes.json();

    if (!watch.sources?.length) return json({ error: 'No sources available' }, 404);

    return json({
      sources:   watch.sources,
      subtitles: watch.subtitles || [],
      title,
    });

  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}
