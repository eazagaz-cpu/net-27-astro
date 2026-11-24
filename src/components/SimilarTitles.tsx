/**
 * SimilarTitles.tsx — client:visible component that fetches TMDB /similar
 * for movies and TV shows and renders a horizontal card grid.
 *
 * Uses /api/tmdb/details proxy (already in functions/) to avoid exposing the
 * TMDB API key in browser requests. The endpoint supports ?id=&type= and
 * returns TMDB data; we call /similar endpoint via the existing tmdb proxy.
 */
import { useState, useEffect } from 'react';

interface SimilarItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  media_type?: string;
}

interface Props {
  tmdbId: number;
  type: 'movie' | 'tv';
  currentTitle: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SimilarTitles({ tmdbId, type, currentTitle }: Props) {
  const [items, setItems] = useState<SimilarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const endpoint = type === 'movie'
      ? `/api/tmdb/similar-movies?id=${tmdbId}`
      : `/api/tmdb/similar-tv?id=${tmdbId}`;

    fetch(endpoint, { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.results) {
          setItems(data.results.filter((i: SimilarItem) => i.poster_path).slice(0, 12));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => controller.abort();
  }, [tmdbId, type]);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-32 sm:w-36">
            <div className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
            <div className="h-3 mt-2 rounded bg-white/5 animate-pulse w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin"
      style={{ scrollbarColor: 'rgba(255,255,255,.15) transparent' }}
    >
      {items.map(item => {
        const title = item.title || item.name || '';
        const year = (item.release_date || item.first_air_date || '').slice(0, 4);
        const slug = slugify(title + (year ? `-${year}` : ''));
        const href = type === 'movie' ? `/movies/${slug}/` : `/shows/${slug}/`;
        const poster = `https://image.tmdb.org/t/p/w300${item.poster_path}`;
        const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

        return (
          <a
            key={item.id}
            href={href}
            className="flex-shrink-0 w-32 sm:w-36 group"
            title={title}
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden relative bg-white/5">
              <img
                src={poster}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                width="144"
                height="216"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {rating && (
                <span className="absolute top-2 left-2 bg-black/70 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded">
                  ⭐ {rating}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                <span className="text-white text-xs font-semibold line-clamp-2">{title}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)] font-medium truncate group-hover:text-white transition-colors">
              {title}
            </p>
            {year && (
              <p className="text-[10px] text-[var(--color-text-muted)]">{year}</p>
            )}
          </a>
        );
      })}
    </div>
  );
}
