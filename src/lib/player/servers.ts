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
  // autoembed.co sends X-Frame-Options: SAMEORIGIN so it's always blocked when
  // embedded from net27.watch. Moved to last position so users hit working
  // providers first. The postMessage verification timer auto-cycles past it.
  if (type === 'movie') {
    return [
      { id: 'vidsrc',     name: 'Server 1', sandboxMode: 'none', streamMode: false, url: `https://vidsrc.to/embed/movie/${id}` },
      { id: 'vidsrc-cc',  name: 'Server 2', sandboxMode: 'none', streamMode: false, url: `https://vidsrc.cc/v2/embed/movie/${id}` },
      { id: 'vidlink',    name: 'Server 3', sandboxMode: 'none', streamMode: false, url: `https://vidlink.pro/movie/${id}` },
      { id: 'multiembed', name: 'Server 4', sandboxMode: 'none', streamMode: false, url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
      { id: '2embed',     name: 'Server 5', sandboxMode: 'none', streamMode: false, url: `https://www.2embed.cc/embed/${id}` },
      { id: 'superembed', name: 'Server 6', sandboxMode: 'none', streamMode: false, url: `https://superembed.stream/embed/tmdb/movie/${id}` },
      { id: 'autoembed',  name: 'Server 7', sandboxMode: 'none', streamMode: false, url: `https://autoembed.co/movie/tmdb/${id}` },
    ];
  }

  return [
    { id: 'vidsrc',     name: 'Server 1', sandboxMode: 'none', streamMode: false, url: `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { id: 'vidsrc-cc',  name: 'Server 2', sandboxMode: 'none', streamMode: false, url: `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` },
    { id: 'vidlink',    name: 'Server 3', sandboxMode: 'none', streamMode: false, url: `https://vidlink.pro/tv/${id}/${s}/${e}` },
    { id: 'multiembed', name: 'Server 4', sandboxMode: 'none', streamMode: false, url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
    { id: '2embed',     name: 'Server 5', sandboxMode: 'none', streamMode: false, url: `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
    { id: 'superembed', name: 'Server 6', sandboxMode: 'none', streamMode: false, url: `https://superembed.stream/embed/tmdb/tv/${id}/${s}/${e}` },
    { id: 'autoembed',  name: 'Server 7', sandboxMode: 'none', streamMode: false, url: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
  ];
}
