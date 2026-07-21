import { useState, useEffect } from 'react';
import { fetchCached } from '../lib/clientCache';

interface GridItem {
  id: number;
  type: string;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
  backdropUrl?: string;
}

interface Props {
  category: string;
  title: string;
}

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e, #16213e)',
  'linear-gradient(135deg, #2d1b69, #11998e)',
  'linear-gradient(135deg, #8b0000, #1a0000)',
  'linear-gradient(135deg, #0f0c29, #302b63)',
  'linear-gradient(135deg, #1f1c2c, #928dab)',
];

export default function DynamicGrid({ category, title }: Props) {
  const [items, setItems] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCached<{ items?: GridItem[] }>(
      `nm:cat:${category}:p3`,
      `/api/tmdb/category?type=${encodeURIComponent(category)}&pages=3`
    )
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-xl" style={{ background: 'var(--color-surface-soft)' }} />
              <div className="mt-2 h-3 rounded w-3/4" style={{ background: 'var(--color-surface-soft)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p style={{ color: 'var(--color-muted)' }}>No titles found for this category. Try another platform or genre.</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--color-muted)', marginBottom: 16, fontSize: 14 }}>
        {items.length} titles available
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map(item => {
          const href = `/detail/?type=${item.type}&id=${item.id}`;
          const grad = FALLBACK_GRADIENTS[item.id % FALLBACK_GRADIENTS.length];
          return (
            <a key={item.id} href={href} className="title-card group block" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', borderRadius: 10 }}>
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={`${item.title} poster`}
                    loading="lazy"
                    decoding="async"
                    width={200} height={300}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = 'flex'; }}
                  />
                ) : null}
                <div style={{ position: 'absolute', inset: 0, background: grad, display: item.posterUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{item.title}</span>
                </div>
                {item.rating > 0 && (
                  <span style={{ position: 'absolute', top: 6, left: 6, display: 'flex', alignItems: 'center', gap: 2, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.7)', fontSize: 11, fontWeight: 600, color: '#fff' }}>
                    ⭐ {item.rating}
                  </span>
                )}
              </div>
              <div style={{ padding: '6px 2px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{item.year || ''}</span>
                  {item.type === 'tv' && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 600, background: 'rgba(47,128,255,0.2)', color: 'var(--color-accent)', textTransform: 'uppercase' }}>TV</span>}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
