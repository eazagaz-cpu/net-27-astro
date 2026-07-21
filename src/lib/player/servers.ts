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

  // sandboxMode is 'none' — several providers (vidlink, autoembed) actively
  // detect the iframe `sandbox` attribute and refuse to play ("Please Disable
  // Sandbox" / "Playback blocked... restricted (sandboxed) frame") rather
  // than just losing popup capability, so 'strict' breaks playback outright.
  // `embedsu` was removed — embed.su no longer resolves (dead domain).
  if (type === 'movie') {
    return [
      { id: 'autoembed',  name: 'Server 1', sandboxMode: 'none', streamMode: false, url: `https://autoembed.co/movie/tmdb/${id}` },
      { id: 'vidsrc',     name: 'Server 2', sandboxMode: 'none', streamMode: false, url: `https://vidsrc.to/embed/movie/${id}` },
      { id: 'vidsrc-cc',  name: 'Server 3', sandboxMode: 'none', streamMode: false, url: `https://vidsrc.cc/v2/embed/movie/${id}` },
      { id: 'vidlink',    name: 'Server 4', sandboxMode: 'none', streamMode: false, url: `https://vidlink.pro/movie/${id}` },
      { id: 'multiembed', name: 'Server 5', sandboxMode: 'none', streamMode: false, url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
    ];
  }

  return [
    { id: 'autoembed',  name: 'Server 1', sandboxMode: 'none', streamMode: false, url: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
    { id: 'vidsrc',     name: 'Server 2', sandboxMode: 'none', streamMode: false, url: `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { id: 'vidsrc-cc',  name: 'Server 3', sandboxMode: 'none', streamMode: false, url: `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` },
    { id: 'vidlink',    name: 'Server 4', sandboxMode: 'none', streamMode: false, url: `https://vidlink.pro/tv/${id}/${s}/${e}` },
    { id: 'multiembed', name: 'Server 5', sandboxMode: 'none', streamMode: false, url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  ];
}
