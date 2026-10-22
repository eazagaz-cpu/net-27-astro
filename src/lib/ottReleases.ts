/**
 * ottReleases.ts — data for /ott-releases/ ("New OTT releases this week").
 *
 * Two real sources, never guesses:
 *   1. TMDB's Indian digital release (release type 4), collected by the sync as
 *      `digitalRelease`; editors usually put the platform in its note.
 *   2. The first sync that saw a title on a streaming platform in India
 *      (src/data/cache/ott-arrivals.json, written by movie-sync). Platforms
 *      already listed when tracking began are recorded as "baseline" and never
 *      count as new.
 * Films still in cinemas get the usual 4-8 week window from ottPending, which
 * the page labels as an estimate.
 */
import { getAllRealTitles, type RealTitle } from './realTitles';
import { ottPending, type OttPending } from './seo';
import { knownPlatform, platformsFromNote } from './platforms';

export { knownPlatform };

type ArrivalsFile = { startedAt?: string; titles?: Record<string, Record<string, string>> };
const arrivalModules = import.meta.glob<{ default: ArrivalsFile }>('../data/cache/ott-arrivals.json', { eager: true });
const arrivals: Record<string, Record<string, string>> = Object.values(arrivalModules)[0]?.default?.titles ?? {};

const DAY = 864e5;
/** "This week" is generous on purpose: a premiere from 10 days ago is still news. */
export const RECENT_DAYS = 14;
export const UPCOMING_DAYS = 45;
const AWAITING_MAX_AGE_DAYS = 90;

/** Platform slugs that have a /platform/<slug>/ page on this site. */
export const PLATFORM_PAGES: Record<string, string> = {
  Netflix: '/platform/netflix/',
  'Prime Video': '/platform/prime-video/',
  JioHotstar: '/platform/jiohotstar/',
  ZEE5: '/platform/zee5/',
  SonyLIV: '/platform/sonyliv/',
  'MX Player': '/platform/mx-player/',
  Crunchyroll: '/platform/crunchyroll/',
};

export interface OttEntry {
  title: RealTitle;
  /** YYYY-MM-DD: the digital release, or the day a platform first listed it. */
  date: string;
  platforms: string[];
  source: 'digital-release' | 'first-listed';
}

export interface AwaitingEntry {
  title: RealTitle;
  pending: OttPending;
}

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const uniq = (list: string[]) => [...new Set(list.filter(Boolean))];

/** Platforms this title streams on in India right now, by display name. */
function streamingInIndia(t: RealTitle): string[] {
  if (t.watch?.region !== 'IN') return [];
  return uniq([...t.watch.stream, ...t.watch.free].map(p => knownPlatform(p.name) ?? p.name));
}

export function ottReleases(now = Date.now()) {
  const recent: OttEntry[] = [];
  const upcoming: OttEntry[] = [];
  const awaiting: AwaitingEntry[] = [];

  for (const t of getAllRealTitles()) {
    const streaming = streamingInIndia(t);

    const dr = t.digitalRelease;
    if (dr) {
      const at = Date.parse(`${dr.date}T00:00:00Z`);
      const notePlatforms = platformsFromNote(dr.note);
      const platforms = uniq([...notePlatforms, ...streaming]);
      if (at <= now && now - at <= RECENT_DAYS * DAY) {
        recent.push({ title: t, date: dr.date, platforms, source: 'digital-release' });
        continue;
      }
      if (at > now && at - now <= UPCOMING_DAYS * DAY) {
        upcoming.push({ title: t, date: dr.date, platforms: notePlatforms, source: 'digital-release' });
        continue;
      }
    }

    const listed = Object.entries(arrivals[t.id] ?? {})
      .filter(([, d]) => d !== 'baseline' && now - Date.parse(`${d}T00:00:00Z`) <= RECENT_DAYS * DAY);
    if (listed.length) {
      const date = listed.map(([, d]) => d).sort().at(-1)!;
      recent.push({ title: t, date, platforms: uniq(listed.map(([name]) => knownPlatform(name) ?? name)), source: 'first-listed' });
      continue;
    }

    const pending = ottPending(t);
    if (pending?.released) {
      const age = (now - Date.parse(`${t.releaseDate}T00:00:00Z`)) / DAY;
      if (age <= AWAITING_MAX_AGE_DAYS) awaiting.push({ title: t, pending });
    }
  }

  recent.sort((a, b) => b.date.localeCompare(a.date) || b.title.voteCount - a.title.voteCount);
  upcoming.sort((a, b) => a.date.localeCompare(b.date) || b.title.voteCount - a.title.voteCount);
  awaiting.sort((a, b) => (b.title.releaseDate ?? '').localeCompare(a.title.releaseDate ?? ''));

  return {
    recent,
    upcoming,
    awaiting,
    weekFrom: iso(now - 6 * DAY),
    weekTo: iso(now),
    updated: iso(now),
  };
}
