import { useState, useEffect, useCallback } from 'react';

interface HeroItem {
  id: number;
  type: string;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  backdropUrl: string;
  overview: string;
}

export default function DynamicHero() {
  const [slides, setSlides] = useState<HeroItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/tmdb/category?type=trending')
      .then(r => r.json())
      .then(data => {
        const items = (data.items || []).filter((i: HeroItem) => i.backdropUrl).slice(0, 5);
        if (items.length > 0) {
          setSlides(items);
          setLoaded(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goTo = useCallback((idx: number) => setCurrent(idx), []);

  if (!loaded || slides.length === 0) return null;

  return (
    <section className="relative w-full" style={{ height: '72vh', minHeight: 450 }} aria-label="Featured titles">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={slide.backdropUrl}
            alt={`${slide.title} backdrop`}
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />

          <div className="relative z-10 h-full flex items-end" style={{ paddingBottom: '5rem' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem', width: '100%' }}>
              <div style={{ maxWidth: 540 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                  <span style={{ color: 'var(--color-primary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🔥 Trending Now</span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.1, marginBottom: 12, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                  {slide.title}
                </h2>
                <div className="flex items-center gap-3" style={{ marginBottom: 16, fontSize: 14 }}>
                  <span style={{ background: 'rgba(22,163,74,0.8)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{slide.rating}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{slide.year}</span>
                  <span style={{ color: 'var(--color-muted)' }}>·</span>
                  <span style={{ color: 'var(--color-muted)', textTransform: 'uppercase', fontSize: 12 }}>{slide.type === 'tv' ? 'Series' : 'Movie'}</span>
                </div>
                <p style={{ color: 'var(--color-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 480, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {slide.overview}
                </p>
                <div className="flex items-center gap-3">
                  <a href={`/detail/?type=${slide.type}&id=${slide.id}`} className="btn-primary" style={{ padding: '10px 24px', borderRadius: 8, fontSize: 14, textDecoration: 'none' }}>
                    ▶ Watch Now
                  </a>
                  <a href={`/detail/?type=${slide.type}&id=${slide.id}`} className="btn-glass" style={{ padding: '10px 24px', borderRadius: 8, fontSize: 14, textDecoration: 'none' }}>
                    ⓘ More Info
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute z-20 flex items-center gap-2" style={{ bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 24 : 8, height: 8, borderRadius: 4,
              background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
