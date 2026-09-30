import { getRealTitlesByType } from '../../lib/realTitles';
import { isTheatreOnly } from '../../lib/theatrical';

/** TMDB ids of theatre-only films; read by functions/player.js (see src/lib/theatrical.ts). */
export function GET() {
  const ids = getRealTitlesByType('movie').filter(isTheatreOnly).map((t) => String(t.tmdbId));
  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), ids }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
