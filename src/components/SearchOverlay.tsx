import { useState, useEffect, useRef, useCallback } from 'react';
import {
  loadIndex,
  searchIndex,
  facets,
  hasActiveFilters,
  hitUrl,
  type LocalHit,
  type SearchFilters,
} from '../lib/localSearch';

interface Result {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  /** Set for catalogue hits, so the row links to the real page. */
  href?: string;
  /** Why a catalogue hit matched, e.g. an actor's name. */
  matchedOn?: string;
}

function hitToResult(hit: LocalHit, i: number): Result {
  return {
    id: -(i + 1), // negative so keys cannot collide with TMDB ids
    type: hit.isShow ? 'tv' : 'movie',
    title: hit.title,
    year: hit.year,
    rating: hit.rating,
    posterUrl: hit.posterUrl,
    href: hitUrl(hit),
    matchedOn: hit.matchedOn,
  };
}

type FacetData = ReturnType<typeof facets>;
type IndexRecords = Awaited<ReturnType<typeof loadIndex>>;

const YEAR_NOW = new Date().getFullYear();

/**
 * "From year" options: the last five years one by one, then widening steps
 * back. Derived from the clock rather than written out, so the newest year
 * does not quietly go missing from the list next January.
 */
const YEAR_OPTIONS = [
  ...Array.from({ length: 5 }, (_, i) => YEAR_NOW - i),
  2020, 2015, 2010, 2005, 2000, 1990,
].filter((y, i, all) => all.indexOf(y) === i && y <= YEAR_NOW);

let debounceTimer: ReturnType<typeof setTimeout>;

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [facetData, setFacetData] = useState<FacetData>({ genres: [], languages: [], providers: [] });
  const [filters, setFilters] = useState<SearchFilters>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const indexRef = useRef<IndexRecords>([]);
  const [indexVersion, setIndexVersion] = useState(0);

  // Open on header search bar click
  useEffect(() => {
    function onTrigger() { setOpen(true); }
    document.addEventListener('nm:search:open', onTrigger);
    return () => document.removeEventListener('nm:search:open', onTrigger);
  }, []);

  // The index and its facets, fetched when the overlay first opens rather than
  // on mount: this component sits on every page, and most visits never search,
  // so loading it up front would cost every reader a download they never use.
  // loadIndex caches, so reopening does not refetch.
  useEffect(() => {
    if (!open) return;
    loadIndex().then(records => {
      indexRef.current = records;
      setFacetData(facets(records));
      setIndexVersion(v => v + 1);
    });
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else { setQuery(''); setResults([]); setFilters({}); setShowFilters(false); }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Prevent scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const runSearch = useCallback((q: string, f: SearchFilters) => {
    clearTimeout(debounceTimer);
    const hasQuery = q.trim().length >= 2;
    const filtering = hasActiveFilters(f);

    if (!hasQuery && !filtering) { setResults([]); setLoading(false); return; }

    // Catalogue first, with no debounce: it is a local scan, so results appear
    // as the user types instead of a third of a second after they stop.
    const local = searchIndex(indexRef.current, q, 16, f).map(hitToResult);
    if (local.length > 0 || filtering) {
      setResults(local);
      setLoading(false);
    }

    // The proxy only knows titles, so it cannot honour a genre or platform
    // narrowing — asking it while filters are set would fill the list with
    // rows that ignore them. Filtered searches stay local.
    if (hasQuery && !filtering) {
      setLoading(true);
      debounceTimer = setTimeout(async () => {
        try {
          const lang = localStorage.getItem('netmirror_lang') || 'en';
          const langParam = lang !== 'en' ? `&lang=${lang}` : '';
          const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}${langParam}`);
          const data = await res.json();
          // Catalogue hits stay on top and keep their real page links; the
          // proxy fills the rest with titles this site does not hold.
          const seen = new Set(local.map(r => `${r.type}:${r.title}:${r.year}`));
          const remote = (data.items || []).filter(
            (r: Result) => !seen.has(`${r.type}:${r.title}:${r.year}`)
          );
          setResults([...local, ...remote].slice(0, 14));
        } catch {
          // Keep whatever the catalogue found rather than emptying the list.
          setResults(local);
        }
        setLoading(false);
      }, 300);
    }
  }, []);

  // A query typed before the index arrives scans an empty catalogue and finds
  // nothing, so repeat it once the records are in. Reopening bumps the version
  // too, but the overlay clears its query on close, so that run is a no-op.
  useEffect(() => {
    if (indexVersion > 0) runSearch(query, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexVersion]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    runSearch(v, filters);
  }

  function handleFilterChange(key: keyof SearchFilters, value: any) {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    runSearch(query, newFilters);
  }

  function clearFilter(key: keyof SearchFilters) {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    runSearch(query, newFilters);
  }

  function clearAllFilters() {
    setFilters({});
    runSearch(query, {});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search/?q=${encodeURIComponent(query.trim())}`;
    }
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  if (!open) return null;

  return (
    <div
      className="search-overlay-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="search-overlay-box">
        {/* Search Input Row */}
        <form onSubmit={handleSubmit} className="search-overlay-form">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-overlay-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search movies, shows, anime, actors..."
            className="search-overlay-input"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); runSearch('', filters); inputRef.current?.focus(); }} className="search-overlay-clear">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters(f => !f)}
            className={`search-filter-toggle ${showFilters ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            title="Toggle filters"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2M9 16h6"/>
            </svg>
            {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="search-overlay-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </form>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="active-filters-row">
            {filters.type && (
              <span className="filter-chip">
                {filters.type === 'movie' ? '🎬 Movies' : '📺 Series'}
                <button onClick={() => clearFilter('type')}>×</button>
              </span>
            )}
            {filters.genre && (
              <span className="filter-chip">
                🎭 {filters.genre}
                <button onClick={() => clearFilter('genre')}>×</button>
              </span>
            )}
            {filters.language && (
              <span className="filter-chip">
                🌐 {filters.language}
                <button onClick={() => clearFilter('language')}>×</button>
              </span>
            )}
            {filters.provider && (
              <span className="filter-chip">
                📡 {filters.provider}
                <button onClick={() => clearFilter('provider')}>×</button>
              </span>
            )}
            {filters.minYear && (
              <span className="filter-chip">
                📅 {filters.minYear}+
                <button onClick={() => clearFilter('minYear')}>×</button>
              </span>
            )}
            {filters.minRating && (
              <span className="filter-chip">
                ⭐ {filters.minRating}+
                <button onClick={() => clearFilter('minRating')}>×</button>
              </span>
            )}
            <button className="clear-all-chip" onClick={clearAllFilters}>Clear all</button>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            {/* Type */}
            <div className="filter-group">
              <label className="filter-label">Type</label>
              <div className="filter-pills">
                {(['movie', 'show'] as const).map(t => (
                  <button
                    key={t}
                    className={`filter-pill ${filters.type === t ? 'selected' : ''}`}
                    onClick={() => handleFilterChange('type', filters.type === t ? undefined : t)}
                  >
                    {t === 'movie' ? '🎬 Movies' : '📺 Series'}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre */}
            {facetData.genres.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Genre</label>
                <div className="filter-scroll-row">
                  {facetData.genres.slice(0, 20).map(g => (
                    <button
                      key={g}
                      className={`filter-pill ${filters.genre === g ? 'selected' : ''}`}
                      onClick={() => handleFilterChange('genre', filters.genre === g ? undefined : g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language */}
            {facetData.languages.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Language</label>
                <div className="filter-scroll-row">
                  {facetData.languages.slice(0, 16).map(l => (
                    <button
                      key={l}
                      className={`filter-pill ${filters.language === l ? 'selected' : ''}`}
                      onClick={() => handleFilterChange('language', filters.language === l ? undefined : l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Provider */}
            {facetData.providers.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Platform</label>
                <div className="filter-scroll-row">
                  {facetData.providers.slice(0, 14).map(p => (
                    <button
                      key={p}
                      className={`filter-pill ${filters.provider === p ? 'selected' : ''}`}
                      onClick={() => handleFilterChange('provider', filters.provider === p ? undefined : p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Year + Rating row */}
            <div className="filter-row-inline">
              <div className="filter-group flex-1">
                <label className="filter-label">From Year</label>
                <select
                  className="filter-select"
                  value={filters.minYear ?? ''}
                  onChange={e => handleFilterChange('minYear', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Any year</option>
                  {YEAR_OPTIONS.map(y => (
                    <option key={y} value={y}>{y}+</option>
                  ))}
                </select>
              </div>
              <div className="filter-group flex-1">
                <label className="filter-label">Min Rating</label>
                <select
                  className="filter-select"
                  value={filters.minRating ?? ''}
                  onChange={e => handleFilterChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Any rating</option>
                  {[9,8,7,6,5].map(r => (
                    <option key={r} value={r}>★ {r}+</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="search-overlay-results">
          {/* Filter-only mode header */}
          {!query.trim() && activeFilterCount > 0 && results.length > 0 && (
            <div className="filter-results-header">
              {results.length} title{results.length !== 1 ? 's' : ''} match your filters
            </div>
          )}

          {loading && (
            <div className="search-overlay-empty">
              {[1,2,3,4].map(i => (
                <div key={i} className="search-result-skeleton">
                  <div className="srk-poster" />
                  <div className="srk-info">
                    <div className="srk-title" />
                    <div className="srk-meta" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              {results.map(item => (
                <a
                  key={item.id}
                  href={item.href ?? `/detail/?type=${item.type}&id=${item.id}`}
                  className="search-result-row"
                  onClick={() => setOpen(false)}
                >
                  <div className="search-result-poster">
                    {item.posterUrl ? (
                      <img src={item.posterUrl} alt={item.title} loading="lazy" width="48" height="72" />
                    ) : (
                      <div className="search-result-poster-fallback">
                        {item.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="search-result-info">
                    <p className="search-result-title">{item.title}</p>
                    <p className="search-result-meta">
                      <span>{item.year || '—'}</span>
                      <span className={`search-result-badge ${item.type}`}>
                        {item.type === 'tv' ? 'Series' : 'Movie'}
                      </span>
                      {item.rating > 0 && (
                        <span className="search-result-rating">★ {item.rating}</span>
                      )}
                      {item.matchedOn && (
                        <span className="search-result-matched">{item.matchedOn}</span>
                      )}
                    </p>
                  </div>
                  <svg className="search-result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/></svg>
                </a>
              ))}
              {query.trim() && (
                <a href={`/search/?q=${encodeURIComponent(query.trim())}`} className="search-all-btn">
                  See all results for "{query}" →
                </a>
              )}
            </>
          )}

          {!loading && (query.trim().length >= 2 || activeFilterCount > 0) && results.length === 0 && (
            <div className="search-no-results">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" style={{margin:'0 auto 12px',display:'block'}}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              {activeFilterCount > 0 && !query.trim()
                ? <p>No titles match these filters</p>
                : <p>No results for "<strong>{query}</strong>"</p>
              }
            </div>
          )}

          {!loading && !query.trim() && activeFilterCount === 0 && (
            <div className="search-hint">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" style={{margin:'0 auto 10px',display:'block'}}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <p>Search movies, shows, anime, actors...</p>
              <p className="search-hint-sub">Or use filters to browse by genre, language, platform</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .search-overlay-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(10px);
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: clamp(50px, 6vh, 100px);
          animation: so-fade 0.15s ease;
        }
        @keyframes so-fade { from { opacity:0 } to { opacity:1 } }
        .search-overlay-box {
          width: 100%; max-width: 680px;
          background: #0f0f14;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03);
          animation: so-slide 0.15s ease;
          margin: 0 16px;
        }
        @keyframes so-slide { from { transform:translateY(-14px);opacity:0 } to { transform:translateY(0);opacity:1 } }

        /* Form row */
        .search-overlay-form {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .search-overlay-icon { color: rgba(255,255,255,0.35); flex-shrink:0; }
        .search-overlay-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #fff; font-size: 16px; font-weight: 400; font-family: inherit;
        }
        .search-overlay-input::placeholder { color: rgba(255,255,255,0.28); }
        .search-overlay-clear, .search-overlay-close {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); padding: 5px;
          display:flex; align-items:center;
          border-radius: 6px; transition: color 0.15s, background 0.15s;
        }
        .search-overlay-clear:hover, .search-overlay-close:hover {
          color: #fff; background: rgba(255,255,255,0.08);
        }

        /* Filter toggle button */
        .search-filter-toggle {
          position: relative;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          color: rgba(255,255,255,0.5);
          display: flex; align-items: center; gap: 4px;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .search-filter-toggle:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .search-filter-toggle.active {
          background: rgba(229,9,20,0.15);
          border-color: rgba(229,9,20,0.4);
          color: #e50914;
        }
        .search-filter-toggle.has-filters {
          border-color: rgba(229,9,20,0.5);
          color: #e50914;
        }
        .filter-badge {
          position: absolute;
          top: -6px; right: -6px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #e50914;
          color: #fff;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* Active filter chips */
        .active-filters-row {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 8px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(229,9,20,0.04);
        }
        .filter-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px 3px 10px;
          background: rgba(229,9,20,0.15);
          border: 1px solid rgba(229,9,20,0.3);
          border-radius: 20px;
          font-size: 11px; font-weight: 600; color: #ff6b6b;
        }
        .filter-chip button {
          background: none; border: none; cursor: pointer;
          color: rgba(255,107,107,0.7); font-size: 14px; line-height: 1;
          padding: 0; display: flex; align-items: center;
          transition: color 0.1s;
        }
        .filter-chip button:hover { color: #fff; }
        .clear-all-chip {
          padding: 3px 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.15s;
        }
        .clear-all-chip:hover { color: #fff; background: rgba(255,255,255,0.1); }

        /* Filter panel */
        .filter-panel {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.015);
          display: flex; flex-direction: column; gap: 10px;
          animation: fp-in 0.15s ease;
        }
        @keyframes fp-in { from { opacity:0;transform:translateY(-6px) } to { opacity:1;transform:translateY(0) } }
        .filter-group { display: flex; flex-direction: column; gap: 6px; }
        .filter-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.35);
        }
        .filter-pills { display: flex; flex-wrap: wrap; gap: 5px; }
        .filter-scroll-row {
          display: flex; gap: 5px;
          overflow-x: auto; padding-bottom: 2px;
          scrollbar-width: none;
        }
        .filter-scroll-row::-webkit-scrollbar { display: none; }
        .filter-pill {
          flex-shrink: 0;
          padding: 4px 11px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
        }
        .filter-pill:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }
        .filter-pill.selected {
          background: rgba(229,9,20,0.18);
          border-color: rgba(229,9,20,0.5);
          color: #ff6b6b;
          font-weight: 700;
        }
        .filter-row-inline { display: flex; gap: 10px; }
        .filter-row-inline .flex-1 { flex: 1; }
        .filter-select {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 12px; color: rgba(255,255,255,0.7);
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
          appearance: none;
          -webkit-appearance: none;
        }
        .filter-select:focus { border-color: rgba(229,9,20,0.4); }
        .filter-select option { background: #1a1a1f; }

        /* Filter results header */
        .filter-results-header {
          padding: 8px 16px;
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.4);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        /* Results list */
        .search-overlay-results { max-height: 460px; overflow-y: auto; padding: 4px 0; }
        .search-result-row {
          display: flex; align-items: center; gap: 14px;
          padding: 10px 16px;
          text-decoration: none; color: inherit;
          transition: background 0.1s;
        }
        .search-result-row:hover { background: rgba(255,255,255,0.04); }
        .search-result-poster {
          width: 44px; height: 66px; border-radius: 6px;
          overflow: hidden; flex-shrink: 0; background: #1a1a2e;
        }
        .search-result-poster img { width:100%;height:100%;object-fit:cover;display:block; }
        .search-result-poster-fallback {
          width:100%;height:100%; display:flex;align-items:center;justify-content:center;
          font-size:20px;font-weight:800;color:rgba(255,255,255,0.3);
          background: linear-gradient(135deg,#1a1a2e,#2d1b69);
        }
        .search-result-info { flex:1; min-width:0; }
        .search-result-title {
          font-size: 14px; font-weight: 600; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 0 4px;
        }
        .search-result-meta {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: rgba(255,255,255,0.5); margin:0;
          flex-wrap: wrap;
        }
        .search-result-badge {
          padding: 1px 6px; border-radius: 3px;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
        }
        .search-result-badge.movie { background: rgba(229,9,20,0.2); color: #e50914; }
        .search-result-badge.tv    { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .search-result-rating { color: #f5c518; font-weight: 600; }
        /* Says why a row matched when it was not the title — an actor's name,
           a genre, a provider — so a cast search does not look like a bug. */
        .search-result-matched {
          padding: 1px 6px; border-radius: 4px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.45);
          font-size: 11px;
          max-width: 140px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .search-result-arrow { color: rgba(255,255,255,0.2); flex-shrink:0; }
        .search-result-skeleton { display:flex;gap:14px;padding:10px 16px;align-items:center; }
        .srk-poster { width:44px;height:66px;border-radius:6px;background:rgba(255,255,255,0.05);animation:shimmer 1.4s infinite; }
        .srk-info { flex:1; }
        .srk-title { height:13px;border-radius:4px;background:rgba(255,255,255,0.05);animation:shimmer 1.4s infinite;width:60%;margin-bottom:8px; }
        .srk-meta  { height:11px;border-radius:4px;background:rgba(255,255,255,0.04);animation:shimmer 1.4s infinite;width:35%; }
        .search-all-btn {
          display:block; padding:12px 16px; text-align:center;
          font-size:13px; color:var(--color-primary,#e50914); font-weight:600;
          border-top:1px solid rgba(255,255,255,0.06);
          text-decoration:none;
          transition: background 0.12s;
        }
        .search-all-btn:hover { background:rgba(229,9,20,0.07); }
        .search-no-results, .search-hint {
          padding: 28px 16px 24px; text-align:center;
          color:rgba(255,255,255,0.32); font-size:14px;
        }
        .search-no-results strong { color: rgba(255,255,255,0.65); }
        .search-hint-sub { font-size:12px; margin-top:6px; color:rgba(255,255,255,0.22); }

        @keyframes shimmer {
          0%,100% { opacity:0.4 }
          50% { opacity:0.8 }
        }

        @media (max-width: 480px) {
          .search-overlay-box { border-radius:14px; }
          .filter-row-inline { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
