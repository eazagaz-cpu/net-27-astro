export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const title = url.searchParams.get('title') || '';
  const year = url.searchParams.get('year') || '';
  const type = url.searchParams.get('type') || 'movie';
  const imdbId = url.searchParams.get('imdbId') || '';
  const tmdbId = url.searchParams.get('tmdbId') || '';

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (!title) {
    return new Response(JSON.stringify({ error: 'Missing title' }), { headers });
  }

  const result = { ratings: null, awards: null, trailer: null, availability: [], imdbId: imdbId || null };
  const tasks = [];

  // OMDb enrichment
  const omdbKey = context.env.OMDB_API_KEY;
  if (omdbKey) {
    tasks.push((async () => {
      try {
        const params = imdbId ? `i=${imdbId}` : `t=${encodeURIComponent(title)}${year ? `&y=${year}` : ''}`;
        const res = await fetch(`https://www.omdbapi.com/?${params}&apikey=${omdbKey}&plot=short`);
        if (!res.ok) return;
        const d = await res.json();
        if (d.Response === 'False') return;
        result.ratings = {
          imdb: d.imdbRating && d.imdbRating !== 'N/A' ? `${d.imdbRating}/10` : '',
          rottenTomatoes: '',
          metacritic: d.Metascore && d.Metascore !== 'N/A' ? `${d.Metascore}/100` : '',
        };
        for (const r of d.Ratings || []) {
          if (r.Source === 'Rotten Tomatoes') result.ratings.rottenTomatoes = r.Value;
        }
        if (d.Awards && d.Awards !== 'N/A') result.awards = d.Awards;
        if (d.imdbID) result.imdbId = d.imdbID;
      } catch {}
    })());
  }

  // YouTube trailer
  const ytKey = context.env.YOUTUBE_API_KEY;
  if (ytKey) {
    tasks.push((async () => {
      try {
        const q = `${title} ${year} official trailer`;
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=3&key=${ytKey}`);
        if (!res.ok) return;
        const d = await res.json();
        const items = d.items || [];
        const match = items.find(i => {
          const t = (i.snippet?.title || '').toLowerCase();
          return (t.includes('trailer') || t.includes('teaser')) && !t.includes('reaction') && !t.includes('review');
        }) || items[0];
        if (match?.id?.videoId) {
          result.trailer = {
            videoId: match.id.videoId,
            embedUrl: `https://www.youtube.com/embed/${match.id.videoId}`,
            watchUrl: `https://www.youtube.com/watch?v=${match.id.videoId}`,
            thumbnail: match.snippet?.thumbnails?.high?.url || '',
            title: match.snippet?.title || '',
          };
        }
      } catch {}
    })());
  }

  // Watchmode availability
  const wmKey = context.env.WATCHMODE_API_KEY;
  if (wmKey) {
    tasks.push((async () => {
      try {
        const res = await fetch(`https://api.watchmode.com/v1/search/?apiKey=${wmKey}&search_field=name&search_value=${encodeURIComponent(title)}`);
        if (!res.ok) return;
        const d = await res.json();
        const match = (d.title_results || []).find(r => r.year === Number(year)) || (d.title_results || [])[0];
        if (!match) return;
        const srcRes = await fetch(`https://api.watchmode.com/v1/title/${match.id}/sources/?apiKey=${wmKey}`);
        if (!srcRes.ok) return;
        const sources = await srcRes.json();
        if (Array.isArray(sources)) {
          result.availability = sources.slice(0, 10).map(s => ({
            name: s.name || '', type: s.type || '', webUrl: s.web_url || '',
          }));
        }
      } catch {}
    })());
  }

  // TVmaze episode guide (TV shows only — free tier, no key needed)
  if (type === 'tv') {
    tasks.push((async () => {
      try {
        const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`);
        if (!res.ok) return;
        const searchResults = await res.json();
        const show = searchResults[0]?.show;
        if (!show) return;

        const epRes = await fetch(`https://api.tvmaze.com/shows/${show.id}/episodes`);
        if (!epRes.ok) return;
        const allEps = await epRes.json();

        const seasonMap = {};
        for (const ep of allEps) {
          const s = ep.season;
          if (!seasonMap[s]) seasonMap[s] = [];
          seasonMap[s].push({
            s: ep.season,
            e: ep.number,
            name: ep.name || '',
            airdate: ep.airdate || '',
            summary: ep.summary ? ep.summary.replace(/<[^>]+>/g, '').slice(0, 150) : '',
          });
        }

        result.episodeGuide = {
          totalSeasons: Object.keys(seasonMap).length,
          totalEpisodes: allEps.length,
          seasons: seasonMap,
        };
      } catch {}
    })());
  }

  await Promise.allSettled(tasks);

  return new Response(JSON.stringify(result), {
    headers: { ...headers, 'Cache-Control': 'public, max-age=43200, s-maxage=43200, stale-while-revalidate=86400' },
  });
}
