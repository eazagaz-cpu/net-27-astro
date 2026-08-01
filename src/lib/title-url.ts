import { getAllRealTitles } from './realTitles';

const STATIC_TITLE_PATHS = new Map(
  getAllRealTitles().map(title => [
    `${title.type === 'show' ? 'tv' : 'movie'}-${title.tmdbId}`,
    `/${title.type === 'show' ? 'shows' : 'movies'}/${title.slug}/`,
  ]),
);

export function titleDetailUrl(item: { id: number | string; type: string; title: string }): string {
  const mediaType = item.type === 'tv' || item.type === 'show' ? 'tv' : 'movie';
  return STATIC_TITLE_PATHS.get(`${mediaType}-${item.id}`)
    ?? `/detail/?type=${mediaType}&id=${encodeURIComponent(String(item.id))}`;
}
