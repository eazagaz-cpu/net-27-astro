import type { EnrichedMediaItem } from './apiTypes';
import { getOmdbByTitle, getOmdbByImdbId, extractRatings } from './apis/omdb';
import { searchOfficialTrailer } from './apis/youtube';
import { searchTvmazeShow, getTvmazeEpisodes } from './apis/tvmaze';
import { searchWatchmodeTitle, getWatchmodeSources } from './apis/watchmode';

export async function enrichMediaDetails(
  baseItem: Partial<EnrichedMediaItem>,
  keys: { omdb?: string; youtube?: string; watchmode?: string }
): Promise<EnrichedMediaItem> {
  const item = { ...baseItem } as EnrichedMediaItem;
  const tasks: Promise<void>[] = [];

  // OMDb ratings enrichment
  if (keys.omdb && item.title) {
    tasks.push(
      (async () => {
        try {
          const omdb = item.imdbId
            ? await getOmdbByImdbId(item.imdbId, keys.omdb!)
            : await getOmdbByTitle(item.title, item.year, keys.omdb!);
          if (omdb) {
            item.ratings = extractRatings(omdb);
            if (omdb.imdbID) item.imdbId = omdb.imdbID;
            if (omdb.Awards && omdb.Awards !== 'N/A') item.awards = omdb.Awards;
            if (omdb.Runtime && omdb.Runtime !== 'N/A' && !item.runtime) item.runtime = omdb.Runtime;
            if (omdb.Poster && omdb.Poster !== 'N/A' && !item.posterUrl) item.posterUrl = omdb.Poster;
          }
        } catch {}
      })()
    );
  }

  // YouTube trailer enrichment
  if (keys.youtube && item.title && !item.trailer) {
    tasks.push(
      (async () => {
        try {
          const trailer = await searchOfficialTrailer(item.title, item.year, item.type, keys.youtube!);
          if (trailer) item.trailer = trailer;
        } catch {}
      })()
    );
  }

  // Watchmode availability enrichment
  if (keys.watchmode && item.title && !item.availability?.length) {
    tasks.push(
      (async () => {
        try {
          const wmTitle = await searchWatchmodeTitle(item.title, item.year, keys.watchmode!);
          if (wmTitle) {
            const sources = await getWatchmodeSources(wmTitle.id, keys.watchmode!);
            if (sources.length > 0) {
              item.availability = sources.slice(0, 10).map(s => ({
                name: s.name, type: s.type, webUrl: s.webUrl,
              }));
            }
          }
        } catch {}
      })()
    );
  }

  // TVmaze episode enrichment (for TV shows)
  if (item.type === 'tv' && item.title) {
    tasks.push(
      (async () => {
        try {
          const show = await searchTvmazeShow(item.title);
          if (show) {
            const episodes = await getTvmazeEpisodes(show.id);
            if (episodes.length > 0) {
              item.episodes = episodes.map(ep => ({
                season: ep.season, number: ep.number,
                name: ep.name, airdate: ep.airdate,
              }));
              const maxSeason = Math.max(...episodes.map(ep => ep.season));
              if (!item.seasons || maxSeason > item.seasons) item.seasons = maxSeason;
            }
          }
        } catch {}
      })()
    );
  }

  await Promise.allSettled(tasks);
  return item;
}
