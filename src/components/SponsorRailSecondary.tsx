import { useState, useEffect } from 'react';

interface SponsorCard {
  name: string;
  label: string;
  tagline: string;
  url: string;
  image: string;
  imageData?: string;
  badge: string;
}

// Fallback data for Trail 2 — API fail hone par bhi yeh HAMESHA dikhega
const FALLBACK: SponsorCard[] = [
  { name: 'pkr365',    label: 'PKR365',    tagline: 'Play & Win Big!', url: 'https://gamesapks.com.pk/786ace-game/', image: '/links/pkr365.webp',    badge: '🔥 Hot' },
  { name: 'm666',     label: 'M666 Game', tagline: 'Play & Win Big!', url: 'http://m666game.net/',                  image: '/links/M666.webp',      badge: '🆕 New' },
  { name: 'm19-game', label: 'M19 Game',  tagline: 'Bet & Win!',      url: 'https://betapk.com.pk/bet939-game-2/', image: '/links/M19-game.webp',  badge: '💎 Hot' },
  { name: '1ppp-game',label: '1PPP Game', tagline: 'Play & Earn!',    url: 'https://1pppp.com.pk/',                image: '/links/1ppp-game.webp', badge: '🔥 Hot' },
  { name: 'win786',   label: 'Win786',    tagline: 'Win Big Today!',  url: 'https://786win.pk/',                   image: '/links/win786.webp',    badge: '🔥 Hot' },
  { name: '10win',    label: '10win',     tagline: 'Play & Win Big!', url: 'https://110win.com.pk/',               image: '/links/10win.webp',     badge: '🆕 New' },
  { name: 'xx555',    label: 'Xx555',     tagline: 'Play & Win Big!', url: 'https://Xx555.com.pk/',                image: '/links/xx555.webp',     badge: '🔥 Hot' },
];

export default function SponsorRailSecondary() {
  const [sponsors, setSponsors] = useState<SponsorCard[]>(FALLBACK);
  const [isPaused, setIsPaused] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Pehle /api/sponsors2 check karo, fallback to /api/sponsors?rail=2
    fetch('/api/sponsors2', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : fetch('/api/sponsors?rail=2', { cache: 'no-store' }).then((res) => res.json())))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setSponsors(data);
      })
      .catch(() => {}); // fallback stays on error
  }, []);

  // 🔄 Har 15 seconds baad auto-rotate
  useEffect(() => {
    if (isPaused || sponsors.length <= 1) return;

    const interval = setInterval(() => {
      setIsRotating(true);
      setTimeout(() => {
        setSponsors((prev) => {
          if (prev.length <= 1) return prev;
          const [first, ...rest] = prev;
          return [...rest, first];
        });
        setIsRotating(false);
      }, 350);
    }, 15000);

    return () => clearInterval(interval);
  }, [isPaused, sponsors.length]);

  if (sponsors.length === 0) return null;

  return (
    <section
      className="sponsor-rail-2-section"
      aria-label="Popular Gaming Links"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="sponsor-rail-2-inner">
        <div className="sponsor-rail-2-header">
          <span className="sponsor-rail-2-title">
            <span className="sponsor-icon">💎</span>
            Popular Gaming Links
            <span className="rotation-indicator-2" title={isPaused ? 'Paused on hover' : 'Auto-rotating every 15s'}>
              {isPaused ? '⏸️ Paused' : '🔄 Live'}
            </span>
          </span>
          <span className="sponsor-badge-label-2">Games</span>
        </div>
        <div className={`sponsor-rail-2-scroll ${isRotating ? 'is-shifting' : ''}`}>
          {sponsors.map((card) => {
            const cardKey = `${card.name}-${card.url}`;
            return (
              <a
                key={cardKey}
                href={card.url}
                target="_blank"
                rel="noopener"
                className="sponsor-link-2-card"
                aria-label={`Sponsored: ${card.label} — ${card.tagline}`}
                title={card.label}
              >
                <div className="slc2-ring" aria-hidden="true" />
                <div className="slc2-badge">{card.badge}</div>
                <div className="slc2-img-wrap">
                  {failedImages[cardKey] ? (
                    <div className="slc2-fallback-avatar" aria-hidden="true">
                      <span className="slc2-fallback-icon">🎮</span>
                      <span className="slc2-fallback-text">{card.label.slice(0, 7)}</span>
                    </div>
                  ) : (
                    <img
                      src={card.imageData || card.image}
                      alt={card.label}
                      width={96}
                      height={96}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      className="slc2-img"
                      onError={() => setFailedImages((prev) => ({ ...prev, [cardKey]: true }))}
                    />
                  )}
                </div>
                <div className="slc2-info">
                  <span className="slc2-name">{card.label}</span>
                  <span className="slc2-tagline">{card.tagline}</span>
                </div>
                <div className="slc2-btn">Play Now ▶</div>
              </a>
            );
          })}
        </div>
      </div>

      <style>{`
        .sponsor-rail-2-section { padding: .25rem 0 .75rem; }
        .sponsor-rail-2-inner { max-width:100%; margin:0 auto; padding:0 clamp(16px,2vw,64px); }
        .sponsor-rail-2-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .sponsor-rail-2-title { display:flex; align-items:center; gap:6px; font-size:.95rem; font-weight:700; color:rgba(255,255,255,.9); }
        .rotation-indicator-2 { font-size:10px; font-weight:600; color:rgba(52,211,153,.95); background:rgba(16,185,129,.12); border:1px solid rgba(16,185,129,.35); padding:1px 7px; border-radius:999px; margin-left:6px; transition:all .2s ease; }
        .sponsor-icon { font-size:1rem; }
        .sponsor-badge-label-2 { font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:rgba(52,211,153,.8); border:1px solid rgba(16,185,129,.3); background:rgba(16,185,129,.08); padding:1px 6px; border-radius:4px; }
        .sponsor-rail-2-scroll { display:flex; gap:12px; overflow-x:auto; padding-bottom:8px; scrollbar-width:none; -ms-overflow-style:none; transition:opacity .35s ease,transform .35s ease; }
        .sponsor-rail-2-scroll.is-shifting { opacity:.65; transform:translateX(-12px); }
        .sponsor-rail-2-scroll::-webkit-scrollbar { display:none; }
        .sponsor-link-2-card { position:relative; flex-shrink:0; width:160px; height:220px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:22px 10px 12px; border-radius:14px; border:1.5px solid rgba(16,185,129,.55); background:radial-gradient(ellipse at 50% 0%,#002e1c 0%,#00150d 55%,#000805 100%); text-decoration:none; overflow:hidden; cursor:pointer; box-shadow:0 0 16px rgba(16,185,129,.2),inset 0 0 30px rgba(0,0,0,.6); transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease; }
        .sponsor-link-2-card:hover { transform:translateY(-6px) scale(1.04); box-shadow:0 0 36px rgba(16,185,129,.6),0 14px 40px rgba(0,0,0,.7); border-color:#34d399; }
        .slc2-ring { position:absolute; inset:-2px; border-radius:15px; background:conic-gradient(from 0deg,transparent 0%,transparent 35%,#10b981 50%,transparent 65%,transparent 100%); animation:slc2-spin 3s linear infinite; opacity:.45; z-index:0; }
        .sponsor-link-2-card:hover .slc2-ring { opacity:.8; }
        @keyframes slc2-spin { to { transform:rotate(360deg); } }
        .slc2-badge { position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-size:9px; font-weight:900; padding:2px 7px; border-radius:999px; z-index:3; letter-spacing:.04em; text-transform:uppercase; box-shadow:0 2px 8px rgba(16,185,129,.5); }
        .slc2-img-wrap { position:relative; z-index:2; width:96px; height:96px; margin-bottom:10px; display:flex; align-items:center; justify-content:center; }
        .slc2-img { width:96px; height:96px; object-fit:contain; border-radius:10px; filter:drop-shadow(0 0 10px rgba(16,185,129,.5)); transition:filter .25s ease,transform .25s ease; }
        .sponsor-link-2-card:hover .slc2-img { filter:drop-shadow(0 0 20px rgba(52,211,153,1)); transform:scale(1.06); }
        .slc2-fallback-avatar { width:96px; height:96px; border-radius:12px; background:radial-gradient(circle at 50% 30%,#003d24 0%,#001a0f 100%); border:1.5px solid rgba(16,185,129,.6); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; box-shadow:0 0 16px rgba(16,185,129,.3); }
        .slc2-fallback-icon { font-size:2rem; filter:drop-shadow(0 0 8px rgba(16,185,129,.8)); }
        .slc2-fallback-text { font-size:10px; font-weight:800; color:#34d399; letter-spacing:.05em; text-transform:uppercase; text-shadow:0 0 6px rgba(16,185,129,.5); }
        .slc2-info { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:3px; text-align:center; }
        .slc2-name { font-size:12px; font-weight:800; color:#34d399; letter-spacing:.03em; text-shadow:0 0 8px rgba(16,185,129,.4); }
        .slc2-tagline { font-size:10px; color:rgba(255,255,255,.65); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px; }
        .slc2-btn { position:relative; z-index:2; margin-top:auto; padding:5px 14px; border-radius:999px; background:linear-gradient(90deg,#10b981,#047857); color:#fff; font-size:10.5px; font-weight:900; letter-spacing:.04em; text-transform:uppercase; box-shadow:0 0 12px rgba(16,185,129,.45); transition:box-shadow .2s ease,transform .2s ease; }
        .sponsor-link-2-card:hover .slc2-btn { box-shadow:0 0 24px rgba(52,211,153,.85); transform:scale(1.05); }
        @media (prefers-reduced-motion:reduce) { .sponsor-link-2-card,.slc2-img,.slc2-btn { transition:none; } .slc2-ring { animation:none; } }
      `}</style>
    </section>
  );
}
