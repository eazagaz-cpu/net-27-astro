import { makeProviders, makeStandardFetcher, targets } from '@movie-web/providers';

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

  const TMDB_KEY = env.TMDB_KEY || '620634e1a470fb83909c5546b2b119d0';

  try {
    // 1. Get title + year + imdb_id from TMDB
    const [tmdbEndpoint, extEndpoint] = type === 'movie'
      ? [`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`,
         `https://api.themoviedb.org/3/movie/${id}/external_ids?api_key=${TMDB_KEY}`]
      : [`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}`,
         `https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${TMDB_KEY}`];

    const [tmdbRes, extRes] = await Promise.all([fetch(tmdbEndpoint), fetch(extEndpoint)]);
    if (!tmdbRes.ok) return json({ error: 'TMDB unavailable' }, 502);

    const [tmdb, ext] = await Promise.all([tmdbRes.json(), extRes.ok ? extRes.json() : {}]);

    const title       = type === 'movie' ? tmdb.title : tmdb.name;
    const releaseYear = parseInt(((type === 'movie' ? tmdb.release_date : tmdb.first_air_date) || '').split('-')[0]);
    const imdbId      = ext.imdb_id || tmdb.imdb_id || undefined;
    if (!title) return json({ error: 'Title not found' }, 404);

    // 2. Build media object
    const media = type === 'movie'
      ? { type: 'movie', title, releaseYear, tmdbId: String(id), imdbId }
      : {
          type: 'show',
          title,
          releaseYear,
          tmdbId: String(id),
          imdbId,
          episode: { number: e, tmdbId: String(e) },
          season:  { number: s, tmdbId: String(s) },
        };

    // 3. Run providers — prioritize top-ranked sources, NATIVE target for CF Workers
    const providers = makeProviders({
      fetcher: makeStandardFetcher(fetch),
      target: targets.NATIVE,
    });

    // Try top-ranked sources first; fall back to all if needed
    const preferredOrder = ['8stream', 'ee3', 'streambox', 'soapertv', '2embed', 'whvxMirrors'];

    const result = await Promise.race([
      providers.runAll({ media, sourceOrder: preferredOrder }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('provider timeout')), 25000)),
    ]);

    if (!result?.stream) return json({ error: 'No stream found' }, 404);

    const stream = result.stream;

    // 4. Normalize sources array
    let sources = [];
    let subtitles = [];

    if (stream.type === 'hls') {
      sources = [{ url: stream.playlist, quality: 'auto', isM3U8: true }];
    } else if (stream.type === 'file') {
      sources = Object.entries(stream.qualities || {}).map(([q, v]) => ({
        url: v.url,
        quality: q,
        isM3U8: false,
      }));
    }

    subtitles = (stream.captions || []).map(c => ({
      url: c.url,
      lang: c.language,
      label: c.language,
    }));

    return json({ sources, subtitles, title });

  } catch (err) {
    const msg = String(err);
    if (msg.includes('provider timeout')) return json({ error: 'Stream resolution timed out' }, 504);
    return json({ error: msg }, 500);
  }
}
