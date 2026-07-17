// Client for our internal /api/media/streaming endpoint (proxies RapidAPI's
// Streaming Availability API). This module never talks to RapidAPI directly —
// the API key lives only in the Cloudflare Function's environment.

export type StreamingType = 'subscription' | 'rent' | 'buy' | 'free' | 'addon' | string;

export interface StreamingProviderOption {
  name: string;
  id: string;
  type: StreamingType;
  url: string;
  quality?: string;
  price?: { amount: string; currency: string; formatted: string } | null;
}

export interface StreamingAvailabilityResult {
  title: string | null;
  country: string;
  providers: StreamingProviderOption[];
}

const TYPE_LABELS: Record<string, string> = {
  subscription: 'Subscription',
  rent: 'Rent',
  buy: 'Buy',
  free: 'Free',
  addon: 'Add-on',
};

export async function getStreamingAvailability(params: {
  title: string;
  year?: number | string;
  type: 'movie' | 'tv';
  country?: string;
}): Promise<StreamingAvailabilityResult> {
  const { title, year, type, country } = params;
  const fallbackCountry = country || 'us';
  if (!title) return { title: null, country: fallbackCountry, providers: [] };

  try {
    const qs = new URLSearchParams({ title, type });
    if (year) qs.set('year', String(year));
    if (country) qs.set('country', country);

    const res = await fetch(`/api/media/streaming?${qs.toString()}`);
    if (!res.ok) return { title: null, country: fallbackCountry, providers: [] };

    const data = await res.json();
    return {
      title: data.title ?? null,
      country: data.country || fallbackCountry,
      providers: Array.isArray(data.providers) ? data.providers : [],
    };
  } catch {
    return { title: null, country: fallbackCountry, providers: [] };
  }
}

// Mounts the loading -> list/empty/error widget for the "Available Now" section
// on movie/show detail pages. Expects a root element with:
//   data-title, data-year, data-type ("movie" | "tv")
// and four children marked data-state="loading" | "list" | "empty" | "error".
export function mountStreamingAvailability(rootId: string): void {
  const root = document.getElementById(rootId);
  if (!root) return;

  const title = root.dataset.title || '';
  const year = root.dataset.year || '';
  const type: 'movie' | 'tv' = root.dataset.type === 'tv' ? 'tv' : 'movie';

  const loadingEl = root.querySelector<HTMLElement>('[data-state="loading"]');
  const listEl = root.querySelector<HTMLElement>('[data-state="list"]');
  const emptyEl = root.querySelector<HTMLElement>('[data-state="empty"]');
  const errorEl = root.querySelector<HTMLElement>('[data-state="error"]');

  getStreamingAvailability({ title, year, type })
    .then(result => {
      loadingEl?.classList.add('hidden');

      // Defense in depth: the server already filters to https-only deep links,
      // but this data still originates from a third-party API response.
      const providers = result.providers.filter(p => p.url && /^https:\/\//i.test(p.url));

      if (!providers.length) {
        emptyEl?.classList.remove('hidden');
        return;
      }
      if (!listEl) return;
      listEl.classList.remove('hidden');

      for (const p of providers) {
        const a = document.createElement('a');
        a.href = p.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer nofollow';
        a.className = 'glass-card rounded-xl px-5 py-3 flex items-center gap-3 hover:border-[var(--color-primary)] transition-colors duration-200';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-white font-medium';
        nameSpan.textContent = p.name;

        const typeSpan = document.createElement('span');
        typeSpan.className = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[var(--color-text-secondary)]';
        typeSpan.textContent = TYPE_LABELS[p.type] || p.type;

        a.appendChild(nameSpan);
        a.appendChild(typeSpan);
        listEl.appendChild(a);
      }
    })
    .catch(() => {
      loadingEl?.classList.add('hidden');
      errorEl?.classList.remove('hidden');
    });
}
