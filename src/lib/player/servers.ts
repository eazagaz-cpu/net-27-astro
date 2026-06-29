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
      { id: 'vidsrc',     name: 'Server 1', sandboxMode: 'none',     streamMode: false, url: `https://vidsrc.to/embed/movie/${id}` },
      { id: '2embed',     name: 'Server 2', sandboxMode: 'none',     streamMode: false, url: `https://2embed.cc/embed/${id}` },
      { id: 'vidlink',    name: 'Server 3', sandboxMode: 'none',     streamMode: false, url: `https://vidlink.pro/movie/${id}` },
      { id: 'multiembed', name: 'Server 4', sandboxMode: 'none',     streamMode: false, url: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
      { id: 'autoembed',  name: 'Server 5', sandboxMode: 'balanced', streamMode: false, url: `https://autoembed.co/movie/tmdb/${id}` },
      { id: '2embed-sk',  name: 'Server 6', sandboxMode: 'none',     streamMode: false, url: `https://www.2embed.skin/embed/${id}` },
    ];
  }

  return [
    { id: 'vidsrc',     name: 'Server 1', sandboxMode: 'none',     streamMode: false, url: `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { id: '2embed',     name: 'Server 2', sandboxMode: 'none',     streamMode: false, url: `https://2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
    { id: 'vidlink',    name: 'Server 3', sandboxMode: 'none',     streamMode: false, url: `https://vidlink.pro/tv/${id}/${s}/${e}` },
    { id: 'multiembed', name: 'Server 4', sandboxMode: 'none',     streamMode: false, url: `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
    { id: 'autoembed',  name: 'Server 5', sandboxMode: 'balanced', streamMode: false, url: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
    { id: '2embed-sk',  name: 'Server 6', sandboxMode: 'none',     streamMode: false, url: `https://www.2embed.skin/embedtv/${id}&s=${s}&e=${e}` },
  ];
}
