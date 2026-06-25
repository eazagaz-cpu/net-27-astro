const TMDB_BASE = 'https://api.themoviedb.org/3';

const PROVIDER_IDS = {
  netflix: '8', 'prime-video': '9', 'disney-plus': '337',
  'apple-tv-plus': '350', hulu: '15', 'hbo-max': '384',
  'paramount-plus': '531', crunchyroll: '283',
  jiohotstar: '122|220', sonyliv: '237', 'mx-player': '515',
};

const GENRE_IDS = {
  action: 28, adventure: 12, animation: 16, comedy: 35, crime: 80,
  documentary: 99, drama: 18, family: 10751, fantasy: 14,
  horror: 27, mystery: 9648, romance: 10749, 'sci-fi': 878, thriller: 53,
  kids: '16,10751',
};

const CACHE_TTLS = {
  trending: 1800, latest: 7200, popular: 3600, upcoming: 7200,
  'tv-popular': 3600, anime: 3600, kids: 3600, bollywood: 3600,
  hollywood: 3600, 'korean-drama': 3600,
};

function getEndpoints(type) {
  const today = new Date().toISOString().split('T')[0];
  switch (type) {
    case 'trending': return [{ path: '/trending/all/week', params: {} }];
    case 'latest': return [
      { path: '/discover/movie', params: { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': today, 'vote_count.gte': '10' } },
      { path: '/discover/tv', params: { sort_by: 'first_air_date.desc', 'first_air_date.lte': today, 'vote_count.gte': '10' } },
    ];
    case 'upcoming': return [{ path: '/movie/upcoming', params: { region: 'IN' } }];
    case 'popular': return [{ path: '/movie/popular', params: {} }];
    case 'tv-popular': return [{ path: '/tv/popular', params: {} }];
    case 'bollywood': return [
      { path: '/discover/movie', params: { with_original_language: 'hi', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_original_language: 'hi', sort_by: 'popularity.desc' } },
    ];
    case 'hollywood': return [{ path: '/discover/movie', params: { with_original_language: 'en', sort_by: 'popularity.desc' } }];
    case 'korean-drama': return [{ path: '/discover/tv', params: { with_original_language: 'ko', with_genres: '18', sort_by: 'popularity.desc' } }];
    case 'anime': return [
      { path: '/discover/tv', params: { with_original_language: 'ja', with_genres: '16', sort_by: 'popularity.desc' } },
      { path: '/discover/movie', params: { with_original_language: 'ja', with_genres: '16', sort_by: 'popularity.desc' } },
    ];
    case 'kids': return [
      { path: '/discover/movie', params: { with_genres: '16,10751', sort_by: 'popularity.desc' } },
      { path: '/discover/tv', params: { with_genres: '10762', sort_by: 'popularity.desc' } },
    ];
    default: {
      const pid = PROVIDER_IDS[type];
      const gid = GENRE_IDS[type];
      if (pid) return [
        { path: '/discover/movie', params: { with_watch_providers: pid, watch_region: 'IN', sort_by: 'popularity.desc' } },
        { path: '/discover/tv', params: { with_watch_providers: pid, watch_region: 'IN', sort_by: 'popularity.desc' } },
      ];
      if (gid) return [
        { path: '/discover/movie', params: { with_genres: String(gid), sort_by: 'popularity.desc' } },
      ];
      return [{ path: '/movie/popular', params: {} }];
    }
  }
}

function normalizeItem(i) {
  const isTV = !!(i.name || i.first_air_date || i.media_type === 'tv');
  return {
    id: i.id,
    type: isTV ? 'tv' : 'movie',
    title: i.title || i.name || '',
    year: parseInt((i.release_date || i.first_air_date || '').slice(0, 4)) || 0,
    rating: Math.round((i.vote_average || 0) * 10) / 10,
    posterUrl: i.poster_path ? `https://image.tmdb.org/t/p/w500${i.poster_path}` : (i.backdrop_path ? `https://image.tmdb.org/t/p/w500${i.backdrop_path}` : ''),
    backdropUrl: i.backdrop_path ? `https://image.tmdb.org/t/p/w1280${i.backdrop_path}` : '',
    overview: (i.overview || '').slice(0, 200),
  };
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const type = url.searchParams.get('type') || 'popular';
  const pages = Math.min(parseInt(url.searchParams.get('pages') || '1'), 3);
  const apiKey = context.env.TMDB_API_KEY;

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'TMDB_API_KEY not configured', items: [] }), {
      headers: { ...headers, 'Cache-Control': 'public, max-age=60' },
    });
  }

  try {
    const endpoints = getEndpoints(type);
    const allItems = [];
    const seenIds = new Set();

    for (const ep of endpoints) {
      for (let page = 1; page <= pages; page++) {
        try {
          const tmdbUrl = new URL(`${TMDB_BASE}${ep.path}`);
          tmdbUrl.searchParams.set('api_key', apiKey);
          tmdbUrl.searchParams.set('page', String(page));
          for (const [k, v] of Object.entries(ep.params)) tmdbUrl.searchParams.set(k, v);

          const res = await fetch(tmdbUrl.toString());
          if (!res.ok) continue;
          const data = await res.json();

          for (const item of (data.results || [])) {
            if (item.adult || !(item.title || item.name)) continue;
            if (seenIds.has(item.id)) continue;
            seenIds.add(item.id);
            const normalized = normalizeItem(item);
            if (normalized.posterUrl) allItems.push(normalized);
          }
        } catch { continue; }
      }
    }

    // If too few results, add popular fallback
    if (allItems.length < 20) {
      try {
        const fbRes = await fetch(`${TMDB_BASE}/movie/popular?api_key=${apiKey}`);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          for (const item of (fbData.results || [])) {
            if (seenIds.has(item.id)) continue;
            seenIds.add(item.id);
            const n = normalizeItem(item);
            if (n.posterUrl) allItems.push(n);
          }
        }
      } catch {}
    }

    const ttl = CACHE_TTLS[type] || 3600;
    return new Response(JSON.stringify({ items: allItems, type, count: allItems.length }), {
      headers: { ...headers, 'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${ttl * 24}` },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, items: [] }), {
      headers: { ...headers, 'Cache-Control': 'public, max-age=60' },
    });
  }
}
