import { useState, useEffect, useMemo } from 'react';
import { sampleTitles } from '../data/sampleTitles';

interface Title {
  id: string;
  slug: string;
  title: string;
  type: 'movie' | 'show' | 'anime';
  year: number;
  rating: number;
  runtime: string;
  poster: string;
  overview: string;
  genres: string[];
  director: string;
  quality: string;
  isTrending: boolean;
}

const allGenres = Array.from(
  new Set(sampleTitles.flatMap((t) => t.genres))
).sort();

const allYears = Array.from(
  new Set(sampleTitles.map((t) => t.year))
).sort((a, b) => b - a);

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'movie', label: 'Movies' },
  { value: 'show', label: 'TV Shows' },
  { value: 'anime', label: 'Anime' },
];

const sortOptions = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'year', label: 'Year' },
];

const placeholderGradients = [
  'linear-gradient(135deg, #7f1d1d, #581c87)',
  'linear-gradient(135deg, #1e3a5f, #312e81)',
  'linear-gradient(135deg, #064e3b, #134e4a)',
  'linear-gradient(135deg, #7c2d12, #7f1d1d)',
  'linear-gradient(135deg, #4c1d95, #701a75)',
  'linear-gradient(135deg, #164e63, #1e3a5f)',
  'linear-gradient(135deg, #881337, #831843)',
  'linear-gradient(135deg, #78350f, #713f12)',
];

function getHref(title: Title): string {
  if (title.type === 'movie') return `/movies/${title.slug}/`;
  return `/shows/${title.slug}/`;
}

function getTypeBadge(type: string): string {
  switch (type) {
    case 'movie':
      return 'Movie';
    case 'show':
      return 'TV Show';
    case 'anime':
      return 'Anime';
    default:
      return type;
  }
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div
            className="aspect-[2/3] rounded-xl"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          />
          <div className="mt-3 space-y-2">
            <div
              className="h-4 rounded w-3/4"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            />
            <div
              className="h-3 rounded w-1/2"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('popularity');
  const [loading, setLoading] = useState(true);

  // Read from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const g = params.get('genre') || '';
    const y = params.get('year') || '';
    const t = params.get('type') || '';
    const s = params.get('sort') || 'popularity';
    setQuery(q);
    setGenre(g);
    setYear(y);
    setType(t);
    setSort(s);

    // Brief loading skeleton
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Update URL params without page reload
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (genre) params.set('genre', genre);
    if (year) params.set('year', year);
    if (type) params.set('type', type);
    if (sort && sort !== 'popularity') params.set('sort', sort);
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [query, genre, year, type, sort, loading]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    let filtered = sampleTitles.filter((t) => {
      // Text search
      if (q) {
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesGenre = t.genres.some((g) => g.toLowerCase().includes(q));
        const matchesDirector = t.director.toLowerCase().includes(q);
        const matchesOverview = t.overview.toLowerCase().includes(q);
        if (!matchesTitle && !matchesGenre && !matchesDirector && !matchesOverview) {
          return false;
        }
      }

      // Genre filter
      if (genre && !t.genres.some((g) => g.toLowerCase() === genre.toLowerCase())) {
        return false;
      }

      // Year filter
      if (year && t.year !== parseInt(year)) {
        return false;
      }

      // Type filter
      if (type && t.type !== type) {
        return false;
      }

      return true;
    });

    // Sort
    switch (sort) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'year':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => {
          if (a.isTrending !== b.isTrending) return a.isTrending ? -1 : 1;
          return b.rating - a.rating;
        });
        break;
    }

    return filtered;
  }, [query, genre, year, type, sort]);

  const hasActiveFilters = query || genre || year || type;

  const selectStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-card)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-primary)',
  };

  return (
    <div>
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: 'var(--color-text-muted)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, shows, anime..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border text-lg focus:outline-none focus:ring-2 transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
            '--tw-ring-color': 'var(--color-primary)',
          } as React.CSSProperties}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
          style={selectStyle}
        >
          <option value="">All Genres</option>
          {allGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
          style={selectStyle}
        >
          <option value="">All Years</option>
          {allYears.map((y) => (
            <option key={y} value={y.toString()}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
          style={selectStyle}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
          style={selectStyle}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setQuery('');
              setGenre('');
              setYear('');
              setType('');
              setSort('popularity');
            }}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: 'rgba(255, 48, 69, 0.1)',
              color: 'var(--color-primary)',
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {results.length} {results.length === 1 ? 'result' : 'results'} found
            {query && (
              <span>
                {' '}
                for "<span style={{ color: 'var(--color-text-primary)' }}>{query}</span>"
              </span>
            )}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && <SkeletonGrid />}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((title) => {
            const gradientIndex = title.title.length % placeholderGradients.length;
            const gradient = placeholderGradients[gradientIndex];
            return (
              <a
                key={title.id}
                href={getHref(title)}
                className="group block rounded-xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: gradient }}
                  >
                    <span className="text-5xl font-bold text-white/30 select-none">
                      {title.title.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Quality Badge */}
                  {title.quality && (
                    <span
                      className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {title.quality}
                    </span>
                  )}

                  {/* Rating Badge */}
                  {title.rating > 0 && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-xs font-semibold text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {title.rating.toFixed(1)}
                    </span>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3
                    className="text-sm font-semibold line-clamp-1 mb-1 transition-colors duration-200"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {title.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {title.year}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase"
                      style={{
                        backgroundColor:
                          title.type === 'movie'
                            ? 'rgba(255, 48, 69, 0.15)'
                            : title.type === 'anime'
                              ? 'rgba(124, 58, 237, 0.2)'
                              : 'rgba(59, 130, 246, 0.2)',
                        color:
                          title.type === 'movie'
                            ? 'var(--color-primary)'
                            : title.type === 'anime'
                              ? 'var(--color-accent)'
                              : '#60a5fa',
                      }}
                    >
                      {getTypeBadge(title.type)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {title.genres.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div className="text-center py-20">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              style={{ color: 'var(--color-text-muted)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No results found
          </h3>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Try adjusting your search or filters to find what you are looking for.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setGenre('');
              setYear('');
              setType('');
              setSort('popularity');
            }}
            className="px-6 py-3 rounded-lg font-medium text-white transition-all duration-200"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
