import { useState, useEffect, useRef, useCallback } from 'react';

interface Result {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
}

let debounceTimer: ReturnType<typeof setTimeout>;

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open on header search bar click
  useEffect(() => {
    function onTrigger() { setOpen(true); }
    document.addEventListener('nm:search:open', onTrigger);
    return () => document.removeEventListener('nm:search:open', onTrigger);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    else { setQuery(''); setResults([]); }
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

  const search = useCallback((q: string) => {
    clearTimeout(debounceTimer);
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceTimer = setTimeout(async () => {
      try {
        const lang = localStorage.getItem('netmirror_lang') || 'en';
        const langParam = lang !== 'en' ? `&lang=${lang}` : '';
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}${langParam}`);
        const data = await res.json();
        setResults((data.items || []).slice(0, 12));
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    search(v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search/?q=${encodeURIComponent(query.trim())}`;
    }
  }

  if (!open) return null;

  return (
    <div
      className="search-overlay-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="search-overlay-box">
        {/* Search Input */}
        <form onSubmit={handleSubmit} className="search-overlay-form">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-overlay-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search movies, shows, anime..."
            className="search-overlay-input"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }} className="search-overlay-clear">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
          <button type="button" onClick={() => setOpen(false)} className="search-overlay-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </form>

        {/* Results */}
        <div className="search-overlay-results">
          {loading && (
            <div className="search-overlay-empty">
              {[1,2,3,4,5].map(i => (
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
                  href={`/detail/?type=${item.type}&id=${item.id}`}
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

          {!loading && query.trim() && results.length === 0 && (
            <div className="search-no-results">
              <p>No results for "<strong>{query}</strong>"</p>
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="search-hint">
              <p>Type to search movies, TV shows, anime...</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .search-overlay-backdrop {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: clamp(60px, 8vh, 120px);
          animation: so-fade 0.15s ease;
        }
        @keyframes so-fade { from { opacity:0 } to { opacity:1 } }
        .search-overlay-box {
          width: 100%; max-width: 640px;
          background: #111118;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.8);
          animation: so-slide 0.15s ease;
          margin: 0 16px;
        }
        @keyframes so-slide { from { transform:translateY(-12px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        .search-overlay-form {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .search-overlay-icon { color: rgba(255,255,255,0.4); flex-shrink:0; }
        .search-overlay-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #fff; font-size: 17px; font-weight: 400;
          font-family: inherit;
        }
        .search-overlay-input::placeholder { color: rgba(255,255,255,0.3); }
        .search-overlay-clear, .search-overlay-close {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); padding: 4px;
          display:flex; align-items:center;
          border-radius: 6px; transition: color 0.15s, background 0.15s;
        }
        .search-overlay-clear:hover, .search-overlay-close:hover {
          color: #fff; background: rgba(255,255,255,0.08);
        }
        .search-overlay-close { margin-left: 4px; }
        .search-overlay-results { max-height: 500px; overflow-y: auto; padding: 6px 0; }
        .search-result-row {
          display: flex; align-items: center; gap: 14px;
          padding: 10px 16px;
          text-decoration: none; color: inherit;
          transition: background 0.12s;
          border-radius: 0;
        }
        .search-result-row:hover { background: rgba(255,255,255,0.05); }
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
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin: 0 0 4px;
        }
        .search-result-meta {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: rgba(255,255,255,0.5); margin:0;
        }
        .search-result-badge {
          padding: 1px 6px; border-radius: 3px;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
        }
        .search-result-badge.movie { background: rgba(229,9,20,0.2); color: #e50914; }
        .search-result-badge.tv    { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .search-result-rating { color: #f5c518; font-weight: 600; }
        .search-result-arrow { color: rgba(255,255,255,0.2); flex-shrink:0; }
        .search-result-skeleton { display:flex;gap:14px;padding:10px 16px;align-items:center; }
        .srk-poster { width:44px;height:66px;border-radius:6px;background:rgba(255,255,255,0.06);animation:shimmer 1.4s infinite; }
        .srk-info { flex:1; }
        .srk-title { height:14px;border-radius:4px;background:rgba(255,255,255,0.06);animation:shimmer 1.4s infinite;width:65%;margin-bottom:8px; }
        .srk-meta  { height:11px;border-radius:4px;background:rgba(255,255,255,0.04);animation:shimmer 1.4s infinite;width:40%; }
        .search-all-btn {
          display:block; padding:12px 16px; text-align:center;
          font-size:13px; color:var(--color-primary,#e50914); font-weight:600;
          border-top:1px solid rgba(255,255,255,0.07);
          text-decoration:none;
          transition: background 0.12s;
        }
        .search-all-btn:hover { background:rgba(229,9,20,0.08); }
        .search-no-results, .search-hint {
          padding: 28px 16px; text-align:center;
          color:rgba(255,255,255,0.35); font-size:14px;
        }
        .search-no-results strong { color: rgba(255,255,255,0.7); }
      `}</style>
    </div>
  );
}
