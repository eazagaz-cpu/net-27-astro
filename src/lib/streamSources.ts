export interface StreamSource {
  id: string;
  name: string;
  label: string;
  url: string;
  type: 'iframe';
  priority: number;
  enabled: boolean;
  adExperience: 'minimal' | 'moderate';
  qualityScore: number;
}

/**
 * Seed localStorage quality scores from the global server-health endpoint.
 * Called once per page — uses sessionStorage to avoid hammering the API.
 */
export async function seedServerHealthScores(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const lastSeed = sessionStorage.getItem('health-seeded');
    if (lastSeed && Date.now() - Number(lastSeed) < 5 * 60 * 1000) return; // 5 min cooldown
    const res = await fetch('/api/server-health', { cache: 'default' });
    if (!res.ok) return;
    const data = await res.json() as { servers: Record<string, { score: number; ok: boolean }> };
    if (!data?.servers) return;
    // Merge into localStorage quality scores (key: netmirror:serverQuality)
    const stored = JSON.parse(localStorage.getItem('netmirror:serverQuality') || '{}');
    for (const [id, info] of Object.entries(data.servers)) {
      stored[id] = { ...(stored[id] ?? {}), qualityScore: info.score, globalOk: info.ok };
    }
    localStorage.setItem('netmirror:serverQuality', JSON.stringify(stored));
    sessionStorage.setItem('health-seeded', String(Date.now()));
  } catch {}
}

export function getStreamSources(params: {
  tmdbId: number | string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}): StreamSource[] {
  const { tmdbId, type, season, episode } = params;
  const s = season || 1;
  const e = episode || 1;

  if (type === 'movie') {
    return [
      {
        id: 'server-1', name: 'Server 1', label: 'Default',
        url: `https://vidsrc.to/embed/movie/${tmdbId}`,
        type: 'iframe', priority: 1, enabled: true,
        adExperience: 'minimal', qualityScore: 90,
      },
      {
        id: 'server-2', name: 'Server 2', label: 'Backup',
        url: `https://player.videasy.net/movie/${tmdbId}`,
        type: 'iframe', priority: 2, enabled: true,
        adExperience: 'minimal', qualityScore: 85,
      },
      {
        id: 'server-3', name: 'Server 3', label: 'Alternate',
        url: `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
        type: 'iframe', priority: 3, enabled: true,
        adExperience: 'minimal', qualityScore: 80,
      },
      {
        id: 'server-4', name: 'Server 4', label: 'Alternate',
        url: `https://autoembed.co/movie/tmdb/${tmdbId}`,
        type: 'iframe', priority: 4, enabled: true,
        adExperience: 'moderate', qualityScore: 65,
      },
      {
        id: 'server-5', name: 'Server 5', label: '2Embed',
        url: `https://www.2embed.cc/embed/${tmdbId}`,
        type: 'iframe', priority: 5, enabled: true,
        adExperience: 'moderate', qualityScore: 60,
      },
      {
        id: 'server-6', name: 'Server 6', label: 'SuperEmbed',
        url: `https://superembed.stream/embed/tmdb/movie/${tmdbId}`,
        type: 'iframe', priority: 6, enabled: true,
        adExperience: 'moderate', qualityScore: 55,
      },
    ];
  }

  return [
    {
      id: 'server-1', name: 'Server 1', label: 'Default',
      url: `https://vidsrc.to/embed/tv/${tmdbId}/${s}/${e}`,
      type: 'iframe', priority: 1, enabled: true,
      adExperience: 'minimal', qualityScore: 90,
    },
    {
      id: 'server-2', name: 'Server 2', label: 'Backup',
      url: `https://player.videasy.net/tv/${tmdbId}/${s}/${e}`,
      type: 'iframe', priority: 2, enabled: true,
      adExperience: 'minimal', qualityScore: 85,
    },
    {
      id: 'server-3', name: 'Server 3', label: 'Alternate',
      url: `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}`,
      type: 'iframe', priority: 3, enabled: true,
      adExperience: 'minimal', qualityScore: 80,
    },
    {
      id: 'server-4', name: 'Server 4', label: 'Alternate',
      url: `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`,
      type: 'iframe', priority: 4, enabled: true,
      adExperience: 'moderate', qualityScore: 65,
    },
    {
      id: 'server-5', name: 'Server 5', label: '2Embed',
      url: `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`,
      type: 'iframe', priority: 5, enabled: true,
      adExperience: 'moderate', qualityScore: 60,
    },
    {
      id: 'server-6', name: 'Server 6', label: 'SuperEmbed',
      url: `https://superembed.stream/embed/tmdb/tv/${tmdbId}/${s}/${e}`,
      type: 'iframe', priority: 6, enabled: true,
      adExperience: 'moderate', qualityScore: 55,
    },
  ];
}
