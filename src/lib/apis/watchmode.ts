const WM_BASE = 'https://api.watchmode.com/v1';

export interface WatchmodeSource {
  name: string;
  type: string;
  region: string;
  webUrl: string;
  format: string;
  price?: string;
}

export interface WatchmodeTitle {
  id: number;
  title: string;
  year: number;
  imdb_id: string;
  tmdb_id: number;
  type: string;
}

export async function searchWatchmodeTitle(title: string, year: number | string, apiKey: string): Promise<WatchmodeTitle | null> {
  if (!apiKey || !title) return null;
  try {
    const params = new URLSearchParams({ apiKey, search_field: 'name', search_value: title });
    const res = await fetch(`${WM_BASE}/search/?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.title_results || [];
    const match = results.find((r: any) => r.year === Number(year)) || results[0];
    return match || null;
  } catch { return null; }
}

export async function getWatchmodeSources(titleId: number, apiKey: string): Promise<WatchmodeSource[]> {
  if (!apiKey || !titleId) return [];
  try {
    const res = await fetch(`${WM_BASE}/title/${titleId}/sources/?apiKey=${apiKey}`);
    if (!res.ok) return [];
    const sources = await res.json();
    if (!Array.isArray(sources)) return [];
    return sources.map((s: any) => ({
      name: s.name || '',
      type: s.type || '',
      region: s.region || '',
      webUrl: s.web_url || '',
      format: s.format || '',
      price: s.price ? String(s.price) : undefined,
    }));
  } catch { return []; }
}
