/**
 * GeoRail.tsx — Client-side geo-personalized content rail.
 *
 * Fetches /api/geo to detect the user's country, then renders
 * a country-specific DynamicGrid rail with locally relevant content.
 *
 * Countries and their rails:
 *   PK → Pakistani Dramas
 *   IN → South Hindi Dubbed
 *   KR → Korean Drama
 *   TR → Turkish Drama
 *   JP → Anime
 *   Others → Trakt Trending (global)
 */
import { useState, useEffect } from 'react';

interface GeoData {
  country?: string;
  countryName?: string;
}

interface RailConfig {
  category: string;
  label: string;
  emoji: string;
  href: string;
}

const COUNTRY_RAILS: Record<string, RailConfig> = {
  PK: { category: 'pakistani-drama', label: 'Pakistani Dramas',      emoji: '🇵🇰', href: '/language/urdu/' },
  IN: { category: 'south-hindi-dubbed', label: 'South Hindi Dubbed', emoji: '🇮🇳', href: '/genre/hindi-dubbed/' },
  KR: { category: 'korean-drama',   label: 'Korean Dramas',         emoji: '🇰🇷', href: '/language/korean/' },
  TR: { category: 'turkish-drama',  label: 'Turkish Dramas',         emoji: '🇹🇷', href: '/language/turkish/' },
  JP: { category: 'anime',          label: 'Anime',                   emoji: '🇯🇵', href: '/anime/' },
};

const DEFAULT_RAIL: RailConfig = {
  category: 'trakt-trending',
  label: 'Trending on Trakt',
  emoji: '🌍',
  href: '/trending/',
};

export default function GeoRail() {
  const [rail, setRail] = useState<RailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [DynamicGrid, setDynamicGrid] = useState<React.ComponentType<{ category: string; title: string }> | null>(null);

  useEffect(() => {
    // Dynamically import DynamicGrid
    import('./DynamicGrid.tsx').then(m => setDynamicGrid(() => m.default)).catch(() => {});

    const cached = sessionStorage.getItem('geo-country');
    if (cached) {
      setRail(COUNTRY_RAILS[cached] ?? DEFAULT_RAIL);
      setLoading(false);
      return;
    }

    fetch('/api/geo')
      .then(r => r.json() as Promise<GeoData>)
      .then(data => {
        const country = data.country ?? 'XX';
        sessionStorage.setItem('geo-country', country);
        setRail(COUNTRY_RAILS[country] ?? DEFAULT_RAIL);
      })
      .catch(() => setRail(DEFAULT_RAIL))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !rail || !DynamicGrid) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="section-title">
          {rail.emoji} {rail.label} — Just for You
        </h2>
        <a href={rail.href} className="chip text-xs">View all →</a>
      </div>
      <DynamicGrid category={rail.category} title={rail.label} />
    </section>
  );
}
