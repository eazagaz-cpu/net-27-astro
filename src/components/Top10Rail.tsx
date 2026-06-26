import { useState, useEffect, useRef } from 'react';

interface Top10Item {
  id: number;
  type: string;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  PK: 'Pakistan', IN: 'India', US: 'United States', GB: 'United Kingdom',
  CA: 'Canada', AU: 'Australia', DE: 'Germany', FR: 'France', JP: 'Japan',
  KR: 'South Korea', BR: 'Brazil', AE: 'UAE', SA: 'Saudi Arabia',
  BD: 'Bangladesh', NP: 'Nepal', LK: 'Sri Lanka', TR: 'Turkey',
  ID: 'Indonesia', MY: 'Malaysia', PH: 'Philippines', TH: 'Thailand',
  NG: 'Nigeria', EG: 'Egypt', ZA: 'South Africa', MX: 'Mexico',
};

async function detectCountry(): Promise<string> {
  try {
    const res = await fetch('/api/geo');
    if (res.ok) {
      const data = await res.json();
      if (data.country && data.country !== 'XX') return data.country;
    }
  } catch {}
  return 'US';
}

function RankNumber({ n }: { n: number }) {
  const text = String(n);
  const isTwoDigit = n >= 10;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: isTwoDigit ? 120 : 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 0,
        overflow: 'visible',
      }}
      aria-hidden="true"
    >
      <span
        style={{
          fontSize: isTwoDigit ? '180px' : '220px',
          fontWeight: 900,
          lineHeight: 0.8,
          color: '#050509',
          WebkitTextStroke: '4px rgba(255,255,255,0.25)',
          fontFamily: "'Inter', system-ui, sans-serif",
          letterSpacing: isTwoDigit ? '-12px' : '-6px',
          userSelect: 'none',
          marginLeft: isTwoDigit ? -8 : 0,
        }}
      >
        {text}
      </span>
    </div>
  );
}

export default function Top10Rail({ mediaType = 'movie' }: { mediaType?: 'movie' | 'tv' }) {
  const [items, setItems] = useState<Top10Item[]>([]);
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lang = typeof window !== 'undefined' ? localStorage.getItem('netmirror_lang') || 'en' : 'en';
    const langParam = lang !== 'en' ? `&lang=${lang}` : '';
    Promise.all([
      detectCountry(),
      fetch(`/api/tmdb/category?type=${mediaType === 'tv' ? 'tv-popular' : 'popular'}${langParam}`).then(r => r.json()),
    ])
      .then(([cc, data]) => {
        setCountry(cc);
        const list = (data.items || []).filter((i: Top10Item) => i.posterUrl).slice(0, 10);
        setItems(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [mediaType]);

  if (loading) {
    return (
      <section style={{ padding: '1.5rem 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ height: 24, width: 300, borderRadius: 6, background: 'var(--color-surface-soft)', marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: 200, height: 280, flexShrink: 0, borderRadius: 10, background: 'var(--color-surface-soft)' }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  const countryName = COUNTRY_NAMES[country] || country;
  const label = mediaType === 'tv' ? 'TV Shows' : 'Movies';

  return (
    <section className="rail-section" style={{ padding: '1rem 0 0.5rem' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem' }}>
        <h2 className="section-title" style={{ marginBottom: 14, fontSize: '1.15rem' }}>
          Top 10 {label} in {countryName} Today
        </h2>

        <div style={{ position: 'relative' }} className="group/top10">
          <button
            onClick={() => railRef.current?.scrollBy({ left: -500, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover/top10:opacity-100 transition-opacity hover:bg-black cursor-pointer"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <div ref={railRef} className="scroll-rail" style={{ gap: 0, paddingBottom: 8 }}>
            {items.map((item, i) => {
              const isTwoDigit = (i + 1) >= 10;
              const cardW = isTwoDigit ? 210 : 190;
              const posterW = 120;
              const posterH = 175;

              return (
                <a
                  key={item.id}
                  href={`/detail/?type=${item.type}&id=${item.id}`}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    flexShrink: 0,
                    width: cardW,
                    height: 200,
                    textDecoration: 'none',
                    color: 'inherit',
                    overflow: 'visible',
                  }}
                >
                  <RankNumber n={i + 1} />

                  <div
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      width: posterW,
                      height: posterH,
                      marginLeft: 'auto',
                      borderRadius: 8,
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: '-4px 2px 16px rgba(0,0,0,0.7)',
                      transition: 'transform 0.25s ease',
                    }}
                    className="top10-poster"
                  >
                    <img
                      src={item.posterUrl}
                      alt={`#${i + 1} ${item.title}`}
                      loading={i < 5 ? 'eager' : 'lazy'}
                      decoding="async"
                      width={posterW}
                      height={posterH}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                </a>
              );
            })}
          </div>

          <button
            onClick={() => railRef.current?.scrollBy({ left: 500, behavior: 'smooth' })}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover/top10:opacity-100 transition-opacity hover:bg-black cursor-pointer"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
