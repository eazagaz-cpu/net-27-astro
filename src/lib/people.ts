/**
 * people.ts — actor and director entities derived from the title catalogue.
 *
 * Detail pages listed cast as plain text, so a visitor who wanted more from an
 * actor had nowhere to go and search engines saw no connection between titles
 * sharing one. The catalogue already names up to ten cast members and a
 * director per title; this turns those names into linkable entities.
 *
 * Earlier actor and director URLs on this site were fictional placeholders and
 * were retired to return 404 (see public/_redirects). These are built from real
 * TMDB credits instead.
 */
import { getAllRealTitles, type RealTitle } from './realTitles';

/**
 * A person needs a few credits before a page about them says anything. Two
 * posters is a thin page; three is a small but real filmography.
 */
const MIN_CREDITS = 3;

export interface PersonCredit {
  title: RealTitle;
  /** Character played, or '' when the credit is a directing one. */
  role: string;
  directed: boolean;
}

export interface Person {
  slug: string;
  name: string;
  credits: PersonCredit[];
  /** How this person is best described, based on which credits dominate. */
  primaryRole: 'Actor' | 'Director' | 'Actor and director';
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

let cache: Map<string, Person> | null = null;

/** Builds the person index once per build. Keyed by slug. */
function buildIndex(): Map<string, Person> {
  if (cache) return cache;

  const byName = new Map<string, { name: string; credits: PersonCredit[] }>();
  const add = (name: string, credit: PersonCredit) => {
    const key = name.trim();
    if (!key) return;
    const entry = byName.get(key) ?? { name: key, credits: [] };
    entry.credits.push(credit);
    byName.set(key, entry);
  };

  for (const title of getAllRealTitles()) {
    for (const member of title.cast) {
      add(member.name, { title, role: member.role, directed: false });
    }
    if (title.director) {
      add(title.director, { title, role: '', directed: true });
    }
  }

  cache = new Map();
  for (const entry of byName.values()) {
    if (entry.credits.length < MIN_CREDITS) continue;

    const slug = slugifyName(entry.name);
    // Two different people can slugify alike; the first claims the slug rather
    // than the two silently merging into one page.
    if (!slug || cache.has(slug)) continue;

    const directed = entry.credits.filter(c => c.directed).length;
    const acted = entry.credits.length - directed;
    cache.set(slug, {
      slug,
      name: entry.name,
      // Newest work first — it is what a visitor is most likely looking for.
      credits: entry.credits.sort((a, b) => b.title.year - a.title.year),
      primaryRole: directed > 0 && acted > 0
        ? 'Actor and director'
        : directed > 0 ? 'Director' : 'Actor',
    });
  }
  return cache;
}

export function getAllPeople(): Person[] {
  return [...buildIndex().values()].sort((a, b) => b.credits.length - a.credits.length);
}

export function getPersonBySlug(slug: string): Person | undefined {
  return buildIndex().get(slug);
}

/** The person's page path, or undefined when they have too few credits for one. */
export function personUrl(name: string): string | undefined {
  const slug = slugifyName(name);
  const person = buildIndex().get(slug);
  // Guard against a slug collision pointing at a different person entirely.
  return person && person.name === name ? `/person/${slug}/` : undefined;
}
