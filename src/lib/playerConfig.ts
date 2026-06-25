export interface PlayerSource {
  id: string;
  name: string;
  url: string;
  trusted: boolean;
  sandbox: string;
  allow: string;
  referrerPolicy: string;
}

const DEFAULT_SANDBOX = 'allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox';
const DEFAULT_ALLOW = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
const DEFAULT_REFERRER = 'no-referrer-when-downgrade';

const TRUSTED_DOMAINS = ['autoembed.co', '2embed.cc', 'youtube.com', 'www.youtube.com'];

export function isTrustedSource(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return TRUSTED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
  } catch { return false; }
}

export function getIframeConfig(source: { url: string; trusted?: boolean }) {
  const trusted = source.trusted ?? isTrustedSource(source.url);
  return {
    sandbox: trusted ? '' : DEFAULT_SANDBOX,
    allow: DEFAULT_ALLOW,
    referrerPolicy: DEFAULT_REFERRER,
    allowFullscreen: true,
  };
}

export function getStreamSources(params: {
  tmdbId: number | string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}): PlayerSource[] {
  const { tmdbId, type, season, episode } = params;
  const s = season || 1;
  const e = episode || 1;

  if (type === 'movie') {
    return [
      {
        id: 'server-1', name: 'Server 1',
        url: `https://autoembed.co/movie/tmdb/${tmdbId}`,
        trusted: true, sandbox: '', allow: DEFAULT_ALLOW, referrerPolicy: DEFAULT_REFERRER,
      },
      {
        id: 'server-2', name: 'Server 2',
        url: `https://www.2embed.cc/embed/${tmdbId}`,
        trusted: true, sandbox: '', allow: DEFAULT_ALLOW, referrerPolicy: DEFAULT_REFERRER,
      },
    ];
  }

  return [
    {
      id: 'server-1', name: 'Server 1',
      url: `https://autoembed.co/tv/tmdb/${tmdbId}-${s}-${e}`,
      trusted: true, sandbox: '', allow: DEFAULT_ALLOW, referrerPolicy: DEFAULT_REFERRER,
    },
    {
      id: 'server-2', name: 'Server 2',
      url: `https://www.2embed.cc/embedtv/${tmdbId}&s=${s}&e=${e}`,
      trusted: true, sandbox: '', allow: DEFAULT_ALLOW, referrerPolicy: DEFAULT_REFERRER,
    },
  ];
}
