/**
 * Films that are only in cinemas: released (or due) recently and not offered
 * by any streaming, rental or purchase service we know of.
 *
 * These get no player. Any stream of a film that is still theatre-only is
 * unlicensed by definition, and it drew the copyright notices of 2026-09-28,
 * after which Google dropped /movies/dorothy-1578079/ — then ~80% of the
 * site's search clicks — from its results within hours. Repeated valid
 * notices demote the whole site, not just the page named.
 *
 * The page itself stays and answers the "OTT release date" question; the
 * player comes back automatically once the sync finds a provider.
 * functions/player.js enforces the same list at the edge via
 * /data/theatre-only.json, so direct /player/ links are covered too.
 */
import type { RealTitle } from './realTitles';

/** Days after release within which a film with no provider counts as theatre-only. */
const WINDOW_DAYS = 180;

export function isTheatreOnly(title: Pick<RealTitle, 'type' | 'releaseDate' | 'watch'>): boolean {
  if (title.type !== 'movie' || !title.releaseDate) return false;
  const released = Date.parse(`${title.releaseDate}T00:00:00Z`);
  if (Number.isNaN(released)) return false;
  if ((Date.now() - released) / 864e5 > WINDOW_DAYS) return false;
  const w = title.watch;
  return !(w && (w.stream.length || w.free.length || w.rent.length || w.buy.length));
}
