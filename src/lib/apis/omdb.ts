const OMDB_BASE = 'https://www.omdbapi.com';

export interface OmdbResult {
  imdbID?: string;
  Title?: string;
  Year?: string;
  Runtime?: string;
  Genre?: string;
  Plot?: string;
  Poster?: string;
  imdbRating?: string;
  Metascore?: string;
  Awards?: string;
  Ratings?: { Source: string; Value: string }[];
}

export interface NormalizedRatings {
  imdb: string;
  rottenTomatoes: string;
  metacritic: string;
}

export async function getOmdbByImdbId(imdbId: string, apiKey: string): Promise<OmdbResult | null> {
  if (!apiKey || !imdbId) return null;
  try {
    const res = await fetch(`${OMDB_BASE}/?i=${imdbId}&apikey=${apiKey}&plot=full`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.Response === 'False' ? null : data;
  } catch { return null; }
}

export async function getOmdbByTitle(title: string, year: number | string, apiKey: string): Promise<OmdbResult | null> {
  if (!apiKey || !title) return null;
  try {
    const params = new URLSearchParams({ t: title, apikey: apiKey, plot: 'full' });
    if (year) params.set('y', String(year));
    const res = await fetch(`${OMDB_BASE}/?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.Response === 'False' ? null : data;
  } catch { return null; }
}

export function extractRatings(omdb: OmdbResult): NormalizedRatings {
  const ratings: NormalizedRatings = { imdb: '', rottenTomatoes: '', metacritic: '' };
  if (omdb.imdbRating && omdb.imdbRating !== 'N/A') ratings.imdb = `${omdb.imdbRating}/10`;
  if (omdb.Metascore && omdb.Metascore !== 'N/A') ratings.metacritic = `${omdb.Metascore}/100`;
  for (const r of omdb.Ratings || []) {
    if (r.Source === 'Rotten Tomatoes') ratings.rottenTomatoes = r.Value;
  }
  return ratings;
}
