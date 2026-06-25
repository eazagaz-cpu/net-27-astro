const TVMAZE_BASE = 'https://api.tvmaze.com';

export interface TvmazeShow {
  id: number;
  name: string;
  language: string;
  genres: string[];
  status: string;
  premiered: string;
  rating: { average: number | null };
  image: { medium: string; original: string } | null;
  summary: string;
}

export interface TvmazeEpisode {
  id: number;
  name: string;
  season: number;
  number: number;
  airdate: string;
  runtime: number;
  image: { medium: string; original: string } | null;
  summary: string;
}

export interface TvmazeCastMember {
  person: { id: number; name: string; image: { medium: string } | null };
  character: { id: number; name: string; image: { medium: string } | null };
}

export async function searchTvmazeShow(query: string): Promise<TvmazeShow | null> {
  if (!query) return null;
  try {
    const res = await fetch(`${TVMAZE_BASE}/singlesearch/shows?q=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function getTvmazeShowDetails(id: number): Promise<TvmazeShow | null> {
  try {
    const res = await fetch(`${TVMAZE_BASE}/shows/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function getTvmazeEpisodes(showId: number): Promise<TvmazeEpisode[]> {
  try {
    const res = await fetch(`${TVMAZE_BASE}/shows/${showId}/episodes`);
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function getTvmazeCast(showId: number): Promise<TvmazeCastMember[]> {
  try {
    const res = await fetch(`${TVMAZE_BASE}/shows/${showId}/cast`);
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}
