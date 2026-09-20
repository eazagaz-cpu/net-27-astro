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

// Fallback data — API fail hone par bhi yeh HAMESHA dikhega
const FALLBACK: SponsorCard[] = [
  { name: 'y999-game',      label: 'Y9999 Game',     tagline: 'Play & Win Big!',    url: 'https://y9999.pk/',                        image: '/links/y999-game.webp',      badge: '🔥 Hot' },
  { name: 'xd777-sting',   label: 'XD777 Game',     tagline: 'Win Big Today!',     url: 'https://apksting.com.pk/zentro-win-game/', image: '/links/XD777-new.webp',      badge: '🔥 Hot' },
  { name: 'xd777-gamzu',   label: 'XD777 Game',     tagline: 'Win Big Today!',     url: 'https://apkgamzu.com.pk/x777-game/',       image: '/links/XD777.webp',          badge: '🔥 Hot' },
  { name: 'jb-game',       label: 'JB Game',        tagline: 'New Earning Games!', url: 'https://jbgame.pk',                        image: '/links/jb-game.webp',        badge: '🆕 New' },
  { name: 'bet-rupees',    label: 'Bet Rupees',     tagline: 'Bet & Earn!',        url: 'https://betrupe.com/',                     image: '/links/bet-rupees.webp',     badge: '🔥 Hot' },
  { name: 'p999-pk',       label: 'P999 PK',        tagline: 'Top Rewards!',       url: 'https://p999pk.org/',                      image: '/links/p999-pk.webp',        badge: '🆕 New' },
  { name: 'pak-super-game',label: 'Pak Super Game', tagline: 'Play & Win Big!',    url: 'https://paksupergame.cc/',                 image: '/links/pak-super-game.webp', badge: '🔥 Hot' },
  { name: 'hh98',          label: 'HH98',           tagline: 'Play & Win!',        url: 'https://hh98.pk/',                         image: '/links/HH98.webp',           badge: '🆕 New' },
  { name: 'jj77',          label: 'JJ77',           tagline: 'Big Rewards!',       url: 'https://jj77apk.pk/',                      image: '/links/JJ77.webp',           badge: '💎 Hot' },
];

export default function SponsorRailDynamic() {
  const [sponsors, setSponsors] = useState<SponsorCard[]>(FALLBACK);
  const [isPaused, setIsPaused] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/sponsors', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setSponsors(data); })
      .catch(() => {}); // fallback stays on error
  }, []);

  // 🔄 Option 2: Har 15 seconds baad 1st card aakhri ban jayega (Smooth rotation)
  useEffect(() => {
    if (isPaused || sponsors.length <= 1) return;

    const interval = setInterval(() => {
      setIsRotating(true);
      setTimeout(() => {
        setSponsors(prev => {
          if (prev.length <= 1) return prev;
          const [first, ...rest] = prev;
          return [...rest, first];
        });
        setIsRotating(false);
      }, 350); // 350ms smooth transition
    }, 15000); // Har 15 seconds

    return () => clearInterval(interval);
  }, [isPaused, sponsors.length]);

  if (sponsors.length === 0) return null;

  return (
    <section
      className="sponsor-rail-section"
      aria-label="Sponsored Links"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="sponsor-rail-inner">
        <div className="sponsor-rail-header">
          <span className="sponsor-rail-title">
            <span className="sponsor-icon">🎯</span>
            Featured Sponsors
            <span className="rotation-indicator" title={isPaused ? "Paused on hover" : "Auto-rotating every 15s"}>
              {isPaused ? "⏸️ Paused" : "🔄 Live"}
            </span>
          </span>
          <span className="sponsor-ad-label">Ads</span>
        </div>
        <div className={`sponsor-rail-scroll ${isRotating ? 'is-shifting' : ''}`}>
          {sponsors.map((card) => {
            const cardKey = `${card.name}-${card.url}`;
            return (
              <a
                key={cardKey}
                href={card.url}
                target="_blank"
                rel="noopener"
                className="sponsor-link-card"
                aria-label={`Sponsored: ${card.label} — ${card.tagline}`}
                title={card.label}
              >
                <div className="slc-ring" aria-hidden="true" />
                <div className="slc-badge">{card.badge}</div>
                <div className="slc-img-wrap">
                  {failedImages[cardKey] ? (
                    <div className="slc-fallback-avatar" aria-hidden="true">
                      <span className="slc-fallback-icon">🎰</span>
                      <span className="slc-fallback-text">{card.label.slice(0, 7)}</span>
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
                      className="slc-img"
                      onError={() => setFailedImages((prev) => ({ ...prev, [cardKey]: true }))}
                    />
                  )}
                </div>
              <div className="slc-info">
                <span className="slc-name">{card.label}</span>
                <span className="slc-tagline">{card.tagline}</span>
              </div>
              <div className="slc-btn">Play Now ▶</div>
            </a>
          );
        })}
        </div>
      </div>

      <style>{`
        .sponsor-rail-section { padding: .75rem 0 .25rem; }
        .sponsor-rail-inner { max-width:100%; margin:0 auto; padding:0 clamp(16px,2vw,64px); }
        .sponsor-rail-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .sponsor-rail-title { display:flex; align-items:center; gap:6px; font-size:.95rem; font-weight:700; color:rgba(255,255,255,.85); }
        .rotation-indicator { font-size:10px; font-weight:600; color:rgba(245,197,24,.9); background:rgba(245,197,24,.1); border:1px solid rgba(245,197,24,.3); padding:1px 7px; border-radius:999px; margin-left:6px; transition:all .2s ease; }
        .sponsor-icon { font-size:1rem; }
        .sponsor-ad-label { font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.3); border:1px solid rgba(255,255,255,.15); padding:1px 6px; border-radius:4px; }
        .sponsor-rail-scroll { display:flex; gap:12px; overflow-x:auto; padding-bottom:8px; scrollbar-width:none; -ms-overflow-style:none; transition:opacity .35s ease,transform .35s ease; }
        .sponsor-rail-scroll.is-shifting { opacity:.65; transform:translateX(-12px); }
        .sponsor-rail-scroll::-webkit-scrollbar { display:none; }
        .sponsor-link-card { position:relative; flex-shrink:0; width:160px; height:220px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:22px 10px 12px; border-radius:14px; border:1.5px solid rgba(245,197,24,.6); background:radial-gradient(ellipse at 50% 0%,#2d1f00 0%,#130d00 55%,#090600 100%); text-decoration:none; overflow:hidden; cursor:pointer; box-shadow:0 0 16px rgba(245,197,24,.25),inset 0 0 30px rgba(0,0,0,.5); transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease; }
        .sponsor-link-card:hover { transform:translateY(-6px) scale(1.04); box-shadow:0 0 36px rgba(245,197,24,.65),0 14px 40px rgba(0,0,0,.7); border-color:#ffe066; }
        .slc-ring { position:absolute; inset:-2px; border-radius:15px; background:conic-gradient(from 0deg,transparent 0%,transparent 35%,#f5c518 50%,transparent 65%,transparent 100%); animation:slc-spin 3s linear infinite; opacity:.45; z-index:0; }
        .sponsor-link-card:hover .slc-ring { opacity:.8; }
        @keyframes slc-spin { to { transform:rotate(360deg); } }
        .slc-badge { position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#ff4e00,#ec9f05); color:#fff; font-size:9px; font-weight:900; padding:2px 7px; border-radius:999px; z-index:3; letter-spacing:.04em; text-transform:uppercase; box-shadow:0 2px 8px rgba(255,78,0,.5); }
        .slc-img-wrap { position:relative; z-index:2; width:96px; height:96px; margin-bottom:10px; display:flex; align-items:center; justify-content:center; }
        .slc-img { width:96px; height:96px; object-fit:contain; border-radius:10px; filter:drop-shadow(0 0 10px rgba(245,197,24,.55)); transition:filter .25s ease,transform .25s ease; }
        .sponsor-link-card:hover .slc-img { filter:drop-shadow(0 0 20px rgba(245,197,24,1)); transform:scale(1.06); }
        .slc-fallback-avatar { width:96px; height:96px; border-radius:12px; background:radial-gradient(circle at 50% 30%,#3d2800 0%,#1a1100 100%); border:1.5px solid rgba(245,197,24,.6); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; box-shadow:0 0 16px rgba(245,197,24,.3); }
        .slc-fallback-icon { font-size:2rem; filter:drop-shadow(0 0 8px rgba(245,197,24,.8)); }
        .slc-fallback-text { font-size:10px; font-weight:800; color:#f5c518; letter-spacing:.05em; text-transform:uppercase; text-shadow:0 0 6px rgba(245,197,24,.5); }
        .slc-info { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:3px; text-align:center; }
        .slc-name { font-size:12px; font-weight:800; color:#f5c518; letter-spacing:.03em; text-shadow:0 0 8px rgba(245,197,24,.5); }
        .slc-tagline { font-size:10px; color:rgba(255,255,255,.65); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px; }
        .slc-btn { position:relative; z-index:2; margin-top:auto; padding:5px 14px; border-radius:999px; background:linear-gradient(90deg,#f5c518,#ff8c00); color:#000; font-size:10.5px; font-weight:900; letter-spacing:.04em; text-transform:uppercase; box-shadow:0 0 12px rgba(245,197,24,.5); transition:box-shadow .2s ease,transform .2s ease; }
        .sponsor-link-card:hover .slc-btn { box-shadow:0 0 24px rgba(245,197,24,.9); transform:scale(1.05); }
        @media (prefers-reduced-motion:reduce) { .sponsor-link-card,.slc-img,.slc-btn { transition:none; } .slc-ring { animation:none; } }
      `}</style>
    </section>
  );
}
