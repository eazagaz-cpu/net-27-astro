export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const type = url.searchParams.get('type') || 'movie';
  const id = url.searchParams.get('id') || '';
  const apiKey = context.env.TMDB_API_KEY;

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (!id || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing parameters or API key' }), { headers });
  }

  try {
    const tmdbUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&append_to_response=credits,recommendations,videos,similar`;
    const res = await fetch(tmdbUrl);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const d = await res.json();

    const title = d.title || d.name || '';
    const year = (d.release_date || d.first_air_date || '').slice(0, 4);

    const cast = (d.credits?.cast || []).slice(0, 15).map(c => ({
      id: c.id, name: c.name, character: c.character,
      profileUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '',
    }));

    const trailer = (d.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');

    const recs = (d.recommendations?.results || []).slice(0, 12).map(r => ({
      id: r.id, type: r.title ? 'movie' : 'tv',
      title: r.title || r.name,
      posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : '',
      rating: Math.round((r.vote_average || 0) * 10) / 10,
      year: (r.release_date || r.first_air_date || '').slice(0, 4),
    }));

    const result = {
      id: d.id, type, title, year,
      rating: Math.round((d.vote_average || 0) * 10) / 10,
      runtime: d.runtime ? `${Math.floor(d.runtime / 60)}h ${d.runtime % 60}m` : d.episode_run_time?.[0] ? `${d.episode_run_time[0]}m per ep` : '',
      posterUrl: d.poster_path ? `https://image.tmdb.org/t/p/w780${d.poster_path}` : '',
      backdropUrl: d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : '',
      overview: d.overview || '',
      genres: (d.genres || []).map(g => g.name),
      languages: (d.spoken_languages || []).map(l => l.english_name),
      cast, director: (d.credits?.crew || []).find(c => c.job === 'Director')?.name || '',
      trailerKey: trailer?.key || '', recommendations: recs,
      seasons: d.number_of_seasons || 0, episodes: d.number_of_episodes || 0,
      status: d.status || '', tagline: d.tagline || '',
    };

    return new Response(JSON.stringify(result), {
      headers: { ...headers, 'Cache-Control': 'public, max-age=21600, s-maxage=21600, stale-while-revalidate=604800' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { headers });
  }
}
