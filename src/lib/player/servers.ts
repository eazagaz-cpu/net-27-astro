import type { SandboxMode } from './iframePolicy';

export interface PlayerServer {
  id: string;
  name: string;
  url: string;
  sandboxMode: SandboxMode;
  streamMode: boolean;
}

export function getServers(p: {
  type: 'movie' | 'tv';
  id: string;
  season: number;
  episode: number;
}): PlayerServer[] {
  const { type, id, season: s, episode: e } = p;

  if (type === 'movie') {
    return [
      { id: 'server-1', name: 'Server 1', sandboxMode: 'none',     streamMode: true,  url: '' },
      { id: 'server-2', name: 'Server 2', sandboxMode: 'balanced', streamMode: false, url: `https://autoembed.co/movie/tmdb/${id}` },
      { id: 'server-3', name: 'Server 3', sandboxMode: 'none',     streamMode: false, url: `https://player.videasy.net/movie/${id}` },
      { id: 'server-4', name: 'Server 4', sandboxMode: 'balanced', streamMode: false, url: `https://vidsrc.me/embed/movie?tmdb=${id}` },
    ];
  }

  return [
    { id: 'server-1', name: 'Server 1', sandboxMode: 'none',     streamMode: true,  url: '' },
    { id: 'server-2', name: 'Server 2', sandboxMode: 'balanced', streamMode: false, url: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
    { id: 'server-3', name: 'Server 3', sandboxMode: 'none',     streamMode: false, url: `https://player.videasy.net/tv/${id}/${s}/${e}` },
    { id: 'server-4', name: 'Server 4', sandboxMode: 'balanced', streamMode: false, url: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  ];
}
