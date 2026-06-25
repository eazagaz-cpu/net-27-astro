const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeTrailer {
  videoId: string;
  title: string;
  thumbnail: string;
  embedUrl: string;
  watchUrl: string;
  channelTitle: string;
}

export async function searchOfficialTrailer(title: string, year: number | string, type: string, apiKey: string): Promise<YouTubeTrailer | null> {
  if (!apiKey || !title) return null;
  const queries = [
    `${title} ${year} official trailer`,
    `${title} official trailer`,
    `${title} ${year} trailer`,
  ];
  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        part: 'snippet', q, type: 'video', maxResults: '5',
        videoCategoryId: '24', key: apiKey, safeSearch: 'moderate',
      });
      const res = await fetch(`${YT_BASE}/search?${params}`);
      if (!res.ok) continue;
      const data = await res.json();
      const items = data.items || [];
      const match = items.find((i: any) => {
        const t = (i.snippet?.title || '').toLowerCase();
        return (t.includes('trailer') || t.includes('teaser')) &&
          !t.includes('reaction') && !t.includes('review') && !t.includes('explained') && !t.includes('fan made');
      }) || items[0];
      if (match?.id?.videoId) {
        return {
          videoId: match.id.videoId,
          title: match.snippet?.title || '',
          thumbnail: match.snippet?.thumbnails?.high?.url || match.snippet?.thumbnails?.default?.url || '',
          embedUrl: `https://www.youtube.com/embed/${match.id.videoId}`,
          watchUrl: `https://www.youtube.com/watch?v=${match.id.videoId}`,
          channelTitle: match.snippet?.channelTitle || '',
        };
      }
    } catch { continue; }
  }
  return null;
}
