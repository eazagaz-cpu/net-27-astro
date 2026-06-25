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
        if (items.length > 0) { setSlides(items); setLoaded(true); }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goTo = useCallback((idx: number) => setCurrent(idx), []);

  if (!loaded || slides.length === 0) return null;

  return (
    <section className="hero-section" aria-label="Featured titles">
      {slides.map((slide, i) => (
        <div key={slide.id} className="hero-slide" style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}>
          <img
            src={slide.backdropUrl}
            alt={`${slide.title} backdrop`}
            className="hero-bg"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          {/* Overlays */}
          <div className="hero-overlay-lr" />
          <div className="hero-overlay-tb" />

          <div className="hero-content-wrap">
            <div className="hero-content">
              <div style={{ marginBottom: 10 }}>
                <span className="hero-label">🔥 Trending Now</span>
              </div>
              <h2 className="hero-title">{slide.title}</h2>
              <div className="hero-meta">
                <span className="hero-rating">{slide.rating}</span>
                <span className="hero-meta-text">{slide.year}</span>
                <span className="hero-meta-text">·</span>
                <span className="hero-meta-text" style={{ textTransform: 'uppercase', fontSize: 12 }}>{slide.type === 'tv' ? 'Series' : 'Movie'}</span>
              </div>
              <p className="hero-description">{slide.overview}</p>
              <div className="hero-actions">
                <a href={`/detail/?type=${slide.type}&id=${slide.id}`} className="btn-primary hero-btn">▶ Watch Now</a>
                <a href={`/detail/?type=${slide.type}&id=${slide.id}`} className="btn-glass hero-btn">ⓘ More Info</a>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
