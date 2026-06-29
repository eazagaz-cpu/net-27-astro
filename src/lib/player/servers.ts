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
      { id: 'vidsrc-xyz',  name: 'Server 1', sandboxMode: 'none',     streamMode: false, url: `https://vidsrc.xyz/embed/movie/${id}` },
      { id: '2embed',      name: 'Server 2', sandboxMode: 'none',     streamMode: false, url: `https://2embed.cc/embed/${id}` },
      { id: 'autoembed',   name: 'Server 3', sandboxMode: 'balanced', streamMode: false, url: `https://autoembed.co/movie/tmdb/${id}` },
      { id: 'multiembed',  name: 'Server 4', sandboxMode: 'balanced', streamMode: false, url: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
      { id: 'vidsrc-me',   name: 'Server 5', sandboxMode: 'balanced', streamMode: false, url: `https://vidsrc.me/embed/movie?tmdb=${id}` },
      { id: 'vidlink',     name: 'Server 6', sandboxMode: 'none',     streamMode: false, url: `https://vidlink.pro/movie/${id}` },
    ];
  }

  return [
    { id: 'vidsrc-xyz',  name: 'Server 1', sandboxMode: 'none',     streamMode: false, url: `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` },
    { id: '2embed',      name: 'Server 2', sandboxMode: 'none',     streamMode: false, url: `https://2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
    { id: 'autoembed',   name: 'Server 3', sandboxMode: 'balanced', streamMode: false, url: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
    { id: 'multiembed',  name: 'Server 4', sandboxMode: 'balanced', streamMode: false, url: `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
    { id: 'vidsrc-me',   name: 'Server 5', sandboxMode: 'balanced', streamMode: false, url: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { id: 'vidlink',     name: 'Server 6', sandboxMode: 'none',     streamMode: false, url: `https://vidlink.pro/tv/${id}/${s}/${e}` },
  ];
}
