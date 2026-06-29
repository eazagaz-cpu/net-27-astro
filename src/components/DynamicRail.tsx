import { useState, useEffect, useRef, useCallback } from 'react';

interface RailItem {
  id: number;
  type: string;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  backdropUrl?: string;
}

interface Props {
  title: string;
  category: string;
  viewAllHref?: string;
}

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e, #16213e)',
  'linear-gradient(135deg, #2d1b69, #11998e)',
  'linear-gradient(135deg, #8b0000, #1a0000)',
  'linear-gradient(135deg, #0f0c29, #302b63)',
  'linear-gradient(135deg, #1f1c2c, #928dab)',
];

function SkeletonRail() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ width: 155, flexShrink: 0 }}>
          <div style={{ aspectRatio: '2/3', borderRadius: 10, background: 'var(--color-surface-soft)', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ height: 14, borderRadius: 4, background: 'var(--color-surface-soft)', marginTop: 8, width: '75%' }} />
        </div>
      ))}
    </div>
  );
}

export default function DynamicRail({ title, category, viewAllHref }: Props) {
  const [items, setItems] = useState<RailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);

  const scrollLeft = useCallback(() => railRef.current?.scrollBy({ left: -600, behavior: 'smooth' }), []);
  const scrollRight = useCallback(() => railRef.current?.scrollBy({ left: 600, behavior: 'smooth' }), []);

  useEffect(() => {
    const lang = typeof window !== 'undefined' ? localStorage.getItem('netmirror_lang') || 'en' : 'en';
    const langParam = lang !== 'en' ? `&lang=${lang}` : '';
    fetch(`/api/tmdb/category?type=${encodeURIComponent(category)}${langParam}`)
      .then(r => r.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <section style={{ padding: '1rem 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="section-title">{title}</h2>
          </div>
          <SkeletonRail />
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="rail-section" style={{ padding: '1rem 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="section-title">{title}</h2>
          {viewAllHref && (
            <a href={viewAllHref} style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 500 }}>View All →</a>
          )}
        </div>
        <div style={{ position: 'relative' }} className="group/dynrail rail-wrap">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover/dynrail:opacity-100 transition-opacity hover:bg-black cursor-pointer"
            style={{ transform: 'translateY(-50%)' }}
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <div className="scroll-rail" ref={railRef}>
          {items.map(item => {
            const href = `/detail/?type=${item.type}&id=${item.id}`;
            const grad = FALLBACK_GRADIENTS[item.id % FALLBACK_GRADIENTS.length];
            return (
              <a
                key={item.id}
                href={href}
                className="title-card group"
                style={{ width: 180, flexShrink: 0, display: 'block', textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', borderRadius: 10 }}>
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={`${item.title} poster`}
                      loading="lazy"
                      decoding="async"
                      width={180}
                      height={270}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const el = e.currentTarget;
                        el.style.display = 'none';
                        const fb = el.nextElementSibling as HTMLElement;
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: grad,
                      display: item.posterUrl ? 'none' : 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      padding: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: '1.3' }}>
                      {item.title}
                    </span>
                  </div>

                  {/* SERIES badge — top left */}
                  {item.type === 'tv' && (
                    <span style={{
                      position: 'absolute', top: 6, left: 6, zIndex: 4,
                      fontSize: 9, padding: '2px 6px', borderRadius: 3,
                      fontWeight: 700, background: '#e50914', color: '#fff',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>SERIES</span>
                  )}

                  {/* Rating badge — top right */}
                  {item.rating > 0 && (
                    <span style={{
                      position: 'absolute', top: 6, right: 6, zIndex: 4,
                      display: 'flex', alignItems: 'center', gap: 2,
                      padding: '2px 6px', borderRadius: 4,
                      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                      fontSize: 11, fontWeight: 600, color: '#f5c518',
                    }}>
                      ★ {item.rating}
                    </span>
                  )}

                  {/* Hover overlay — Netflix style */}
                  <div className="card-overlay">
                    <div className="card-overlay-play">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <p className="card-overlay-title">{item.title}</p>
                    <p className="card-overlay-meta">{item.year}{item.rating > 0 ? ` · ★ ${item.rating}` : ''}</p>
                  </div>
                </div>
                <div style={{ padding: '6px 4px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </p>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{item.year || ''}</span>
                </div>
              </a>
            );
          })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover/dynrail:opacity-100 transition-opacity hover:bg-black cursor-pointer"
            style={{ transform: 'translateY(-50%)' }}
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
