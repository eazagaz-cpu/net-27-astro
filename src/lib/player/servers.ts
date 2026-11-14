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
  // providers first. The stuck nudge handles it if a user manually picks it.
  //
  // 2026-11-14: Added vsembed.su, vidfast.vc, aether.ist, vidrift.net,
  // vidlove.cc, vidnest.fun from streambert research — all TMDB-ID based.
  if (type === 'movie') {
    return [
      { id: 'vidsrc',     name: 'Server 1',  sandboxMode: 'none', streamMode: false, url: `https://vidsrc.to/embed/movie/${id}` },
      { id: 'vsembed',    name: 'Server 2',  sandboxMode: 'none', streamMode: false, url: `https://vsembed.su/embed/movie/${id}` },
      { id: 'vidsrc-cc',  name: 'Server 3',  sandboxMode: 'none', streamMode: false, url: `https://vidsrc.cc/v2/embed/movie/${id}` },
      { id: 'vidlink',    name: 'Server 4',  sandboxMode: 'none', streamMode: false, url: `https://vidlink.pro/movie/${id}` },
      { id: 'vidfast',    name: 'Server 5',  sandboxMode: 'none', streamMode: false, url: `https://vidfast.vc/movie/${id}` },
      { id: 'aether',     name: 'Server 6',  sandboxMode: 'none', streamMode: false, url: `https://aether.ist/media/tmdb-movie-${id}` },
      { id: 'vidrift',    name: 'Server 7',  sandboxMode: 'none', streamMode: false, url: `https://embed.vidrift.net/embed/movie/${id}` },
      { id: 'multiembed', name: 'Server 8',  sandboxMode: 'none', streamMode: false, url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
      { id: 'vidlove',    name: 'Server 9',  sandboxMode: 'none', streamMode: false, url: `https://player.vidlove.cc/embed/movie/${id}` },
      { id: 'vidnest',    name: 'Server 10', sandboxMode: 'none', streamMode: false, url: `https://vidnest.fun/movie/${id}` },
      { id: '2embed',     name: 'Server 11', sandboxMode: 'none', streamMode: false, url: `https://www.2embed.cc/embed/${id}` },
      { id: 'superembed', name: 'Server 12', sandboxMode: 'none', streamMode: false, url: `https://superembed.stream/embed/tmdb/movie/${id}` },
      { id: 'autoembed',  name: 'Server 13', sandboxMode: 'none', streamMode: false, url: `https://autoembed.co/movie/tmdb/${id}` },
    ];
  }

  return [
    { id: 'vidsrc',     name: 'Server 1',  sandboxMode: 'none', streamMode: false, url: `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { id: 'vsembed',    name: 'Server 2',  sandboxMode: 'none', streamMode: false, url: `https://vsembed.su/embed/tv/${id}/${s}/${e}` },
    { id: 'vidsrc-cc',  name: 'Server 3',  sandboxMode: 'none', streamMode: false, url: `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` },
    { id: 'vidlink',    name: 'Server 4',  sandboxMode: 'none', streamMode: false, url: `https://vidlink.pro/tv/${id}/${s}/${e}` },
    { id: 'vidfast',    name: 'Server 5',  sandboxMode: 'none', streamMode: false, url: `https://vidfast.vc/tv/${id}/${s}/${e}` },
    { id: 'aether',     name: 'Server 6',  sandboxMode: 'none', streamMode: false, url: `https://aether.ist/media/tmdb-tv-${id}/${s}/${e}` },
    { id: 'vidrift',    name: 'Server 7',  sandboxMode: 'none', streamMode: false, url: `https://embed.vidrift.net/embed/tv/${id}/${s}/${e}` },
    { id: 'multiembed', name: 'Server 8',  sandboxMode: 'none', streamMode: false, url: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
    { id: 'vidlove',    name: 'Server 9',  sandboxMode: 'none', streamMode: false, url: `https://player.vidlove.cc/embed/tv/${id}/${s}/${e}` },
    { id: 'vidnest',    name: 'Server 10', sandboxMode: 'none', streamMode: false, url: `https://vidnest.fun/tv/${id}/${s}/${e}` },
    { id: '2embed',     name: 'Server 11', sandboxMode: 'none', streamMode: false, url: `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
    { id: 'superembed', name: 'Server 12', sandboxMode: 'none', streamMode: false, url: `https://superembed.stream/embed/tmdb/tv/${id}/${s}/${e}` },
    { id: 'autoembed',  name: 'Server 13', sandboxMode: 'none', streamMode: false, url: `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
  ];
}
