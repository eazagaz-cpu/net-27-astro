/**
 * localSearch.ts — searches this site's own catalogue in the browser.
 *
 * Search previously asked the TMDB proxy on every keystroke, so every query
 * cost a round trip and could only match on a title's name. The catalogue is
 * small enough (around 900 records) to ship as an index and scan locally,
 * which answers instantly and can also match on cast, director, genre,
 * language and provider — none of which the proxy knows about.
 *
 * The proxy is still used alongside this, because it reaches titles this site
 * does not hold.
 */

/**
 * The index stores poster paths without this prefix, which every one of them
 * shared. w185 is the size the search rows render at.
 */
const POSTER_BASE = 'https://image.tmdb.org/t/p/w185';

/** One record from public/search-index.json. Keys are terse to keep it small. */
interface IndexRecord {
  s: string;  // slug
  y: 0 | 1;   // 1 when this is a show
  t: string;  // title
  r: number;  // year
  v: number;  // rating
  p: string;  // poster URL
  c: string;  // cast and director, pipe separated
  g: string;  // genres, pipe separated
  l: string;  // languages, pipe separated
  w: string;  // streaming providers, pipe separated
}

export interface LocalHit {
  slug: string;
  isShow: boolean;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  /** Why this matched, for a subtitle like "Shah Rukh Khan". */
  matchedOn?: string;
  score: number;
}

/**
 * Folds away the differences that stop a query matching a title people mean:
 * accents, punctuation, and the spelling drift typical of Roman-script Hindi
 * ("baahubali"/"bahubali", "shahrukh"/"sharukh", "phir"/"fir").
 */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/ph/g, 'f')
    .replace(/\bw/g, 'v')
    .replace(/ck/g, 'k')
    .replace(/([aeiou])\1+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Drops spacing so "spider man" and "spiderman" compare equal. */
function compact(value: string): string {
  return value.replace(/\s+/g, '');
}

/** True when a and b differ by at most one insertion, deletion or substitution. */
function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;

  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

let cache: Promise<IndexRecord[]> | null = null;

/** Fetches the index once per page load; repeat calls reuse the same promise. */
export function loadIndex(): Promise<IndexRecord[]> {
  if (!cache) {
    cache = fetch('/search-index.json')
      .then(res => (res.ok ? res.json() : { items: [] }))
      .then(data => (data.items || []) as IndexRecord[])
      // A failed index must not break search — the proxy still answers.
      .catch(() => [] as IndexRecord[]);
  }
  return cache;
}

/** Finds which pipe-separated entry matched, so the UI can say why. */
function matchedEntry(field: string, needle: string): string | undefined {
  if (!field) return undefined;
  for (const entry of field.split('|')) {
    if (normalize(entry).includes(needle)) return entry;
  }
  return undefined;
}

/**
 * Scores every record against the query and returns the best matches.
 *
 * Ordering favours what a searcher most likely meant: the title they typed the
 * start of, then a word inside it, then a person or category, then a near
 * miss. Rating only breaks ties.
 */
export function searchIndex(records: IndexRecord[], query: string, limit = 12): LocalHit[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const words = q.split(' ').filter(Boolean);
  const qCompact = compact(q);
  const hits: LocalHit[] = [];

  for (const rec of records) {
    const title = normalize(rec.t);
    let score = 0;
    let matchedOn: string | undefined;

    if (title === q) score = 1000;
    else if (title.startsWith(q)) score = 900;
    else if (title.split(' ').some(w => w.startsWith(q))) score = 800;
    else if (title.includes(q)) score = 700;
    // Spacing and hyphens are guessed as often as they are known: "spiderman"
    // for "Spider-Man", "houseofdragon" for "House of the Dragon".
    else if (compact(title).includes(qCompact)) score = 680;
    else if (words.length > 1 && words.every(w => title.includes(w))) score = 650;

    if (!score) {
      const person = matchedEntry(rec.c, q);
      if (person) { score = 600; matchedOn = person; }
    }
    if (!score) {
      const category = matchedEntry(rec.g, q) || matchedEntry(rec.l, q) || matchedEntry(rec.w, q);
      if (category) { score = 400; matchedOn = category; }
    }
    // Typo tolerance last, and only for words long enough that a single edit
    // is not just a different short word.
    if (!score && q.length >= 4) {
      const titleWords = title.split(' ');
      if (titleWords.some(w => w.length >= 4 && withinOneEdit(w, q))) score = 300;
      // A misspelling of a run-together name — "spidermen" for Spider-Man —
      // only shows up against the title with its spacing removed.
      else if (withinOneEdit(compact(title).slice(0, qCompact.length), qCompact)) score = 300;
    }

    if (score) {
      hits.push({
        slug: rec.s,
        isShow: rec.y === 1,
        title: rec.t,
        year: rec.r,
        rating: rec.v,
        posterUrl: rec.p ? `${POSTER_BASE}${rec.p}` : '',
        matchedOn,
        score: score + Math.min(rec.v, 10),
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Canonical page for a hit — the real title page, not the legacy detail route. */
export function hitUrl(hit: LocalHit): string {
  return `/${hit.isShow ? 'shows' : 'movies'}/${hit.slug}/`;
}
