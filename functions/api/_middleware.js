/**
 * Runs before every /api/* Function. Refuses scraper networks (see
 * functions/_shared/scrapers.js) before they spend the TMDB key or start
 * upstream fetches. Each refusal still counts as one Functions request; the
 * zone WAF rule is what keeps them off the quota. Everyone else passes
 * straight through.
 *
 * Lives in functions/api/, not functions/: a root _middleware.js would make
 * Pages invoke Functions for every static file as well. Even here it turns
 * the routes into "/api/*", so an unknown /api path now starts a Function
 * before falling through to the static 404.
 */
import { fromScraperNetwork, scraperRefusal } from '../_shared/scrapers.js';

export async function onRequest(context) {
  if (fromScraperNetwork(context.request)) return scraperRefusal();
  return context.next();
}
