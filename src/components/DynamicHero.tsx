import { useState, useEffect, useCallback, useRef } from 'react';

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

export default function DynamicHero({ initialItems = [] }: { initialItems?: HeroItem[] }) {
  const validInitial = (initialItems as HeroItem[]).filter(i => i.backdropUrl).slice(0, 5);

  const [slides, setSlides] = useState<HeroItem[]>(validInitial);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch fresh slides from API — updates after initial paint
  useEffect(() => {
    const lang = typeof window !== 'undefined' ? localStorage.getItem('netmirror_lang') || 'en' : 'en';
    const langParam = lang !== 'en' ? `&lang=${lang}` : '';
    fetch(`/api/tmdb/category?type=trending${langParam}`)
      .then(r => r.json())
      .then(data => {
        const items = (data.items || []).filter((i: HeroItem) => i.backdropUrl).slice(0, 5);
        if (items.length > 0) setSlides(items);
      })
      .catch(() => {});
  }, []);

  // Auto-advance every 6 s, pause when tab is hidden
  useEffect(() => {
    if (slides.length < 2) return;
    function start() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setCurrent(p => (p + 1) % slides.length), 6000);
    }
    function onVisibility() { document.hidden ? clearInterval(intervalRef.current!) : start(); }
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [slides.length]);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setCurrent(p => (p + 1) % slides.length), 6000);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="hero-section" aria-label="Featured titles">
      {slides.map((slide, i) => (
        <div key={slide.id} className="hero-slide" style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}>
          <img
            src={slide.backdropUrl}
            alt={`${slide.title} backdrop`}
            className="hero-bg"
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding={i === 0 ? 'sync' : 'async'}
            fetchPriority={i === 0 ? 'high' : undefined}
            width={1280}
            height={720}
          />
          <div className="hero-overlay-lr" />
          <div className="hero-overlay-tb" />

          <div className="hero-content-wrap">
            <div className="hero-outer">
              <div className="hero-layout">
                <div className="hero-content">
                  <span className="hero-label">Trending Now</span>
                  <h2 className="hero-title">{slide.title}</h2>
                  <div className="hero-meta">
                    <span className="hero-rating">★ {slide.rating}</span>
                    <span className="hero-meta-text">{slide.year}</span>
                    <span className="hero-meta-text">·</span>
                    <span className="hero-meta-text" style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.05em' }}>
                      {slide.type === 'tv' ? 'Series' : 'Movie'}
                    </span>
                  </div>
                  <p className="hero-description">{slide.overview}</p>
                  <div className="hero-actions">
                    <a href={`/detail/?type=${slide.type}&id=${slide.id}`} className="btn-primary hero-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      Watch Now
                    </a>
                    <a href={`/detail/?type=${slide.type}&id=${slide.id}`} className="btn-glass hero-btn">More Info</a>
                  </div>
                </div>
                {slide.posterUrl && (
                  <div className="hero-poster-wrap">
                    <div className="hero-poster-frame">
                      <img
                        src={slide.posterUrl}
                        alt={`${slide.title} poster`}
                        className="hero-poster-img"
                        width={240}
                        height={360}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding={i === 0 ? 'sync' : 'async'}
                      />
                      <div className="hero-poster-shine" />
                    </div>
                  </div>
                )}
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
