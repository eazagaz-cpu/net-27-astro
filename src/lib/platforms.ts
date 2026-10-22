/**
 * Indian streaming platform names, normalised from TMDB provider names and
 * from the free-text notes on TMDB digital releases ("Prime Video / Lionsgate
 * Play / ManoramaMAX", "SunNXT", "Zee5").
 */
const PLATFORMS: [RegExp, string][] = [
  [/netflix/i, 'Netflix'],
  [/prime video|amazon video/i, 'Prime Video'],
  [/jio ?hotstar|disney\+? ?hotstar|jio ?cinema/i, 'JioHotstar'],
  [/zee ?5/i, 'ZEE5'],
  [/sony ?liv/i, 'SonyLIV'],
  [/sun ?nxt/i, 'Sun NXT'],
  [/^aha\b/i, 'Aha'],
  [/mx player/i, 'MX Player'],
  [/manorama ?max/i, 'ManoramaMAX'],
  [/hoichoi/i, 'Hoichoi'],
  [/apple tv/i, 'Apple TV'],
  [/crunchyroll/i, 'Crunchyroll'],
  [/lionsgate/i, 'Lionsgate Play'],
  [/chaupal/i, 'Chaupal'],
  [/youtube/i, 'YouTube'],
  [/vi movies/i, 'Vi Movies & TV'],
  [/simply ?south/i, 'Simply South'],
];

/** A known platform's display name, or undefined for anything else. */
export function knownPlatform(raw: string): string | undefined {
  const text = raw.trim();
  for (const [re, name] of PLATFORMS) if (re.test(text)) return name;
  return undefined;
}

/** Every known platform named in a TMDB release note, in order, without repeats. */
export function platformsFromNote(note: string | undefined): string[] {
  if (!note) return [];
  const names = note.split(/[\/,|&+]| and /i).map(knownPlatform).filter((n): n is string => Boolean(n));
  return [...new Set(names)];
}
