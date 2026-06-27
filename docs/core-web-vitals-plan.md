# Core Web Vitals Optimization Plan — NetMirror

## LCP (Largest Contentful Paint)

**Target: < 2.5s**

Optimizations applied:
- Hero image uses `fetchPriority="high"` and `loading="eager"`
- Hero image has explicit `width` and `height` to prevent reflow
- Google Fonts load non-blocking via `media="print"` + `onload` swap
- Hero component uses `client:idle` instead of `client:load`
- Preconnect to `image.tmdb.org` for fast image loading
- TMDB backdrop uses w1280 (optimal for hero, not original)

## CLS (Cumulative Layout Shift)

**Target: < 0.1**

Optimizations applied:
- All poster images use `aspect-ratio: 2/3` via CSS
- All backdrop images use `aspect-ratio: 16/9` via CSS
- Hero section has fixed `min-height` via CSS
- Skeleton loading states for rails preserve space
- Font loading uses swap to prevent invisible text
- Content-visibility sections have `contain-intrinsic-size`
- Poster cards have explicit `width` and `height` attributes

## INP (Interaction to Next Paint)

**Target: < 200ms**

Optimizations applied:
- DynamicRail scroll handlers use `useCallback` (stable references)
- Mobile menu ESC handler added for keyboard interaction
- Hero auto-slide pauses when tab is hidden (saves CPU)
- Rails use `content-visibility: auto` to skip rendering offscreen
- `prefers-reduced-motion` disables animations for users who prefer it

## FID (First Input Delay)

**Target: < 100ms**

Optimizations applied:
- Interactive components use `client:idle` or `client:visible`
- Only search page uses `client:load` (required for input focus)
- Firebase only loads on login page
- No blocking scripts in `<head>`

## Cache Strategy

| Content Type | Cache Duration |
|---|---|
| _astro/* (hashed assets) | 1 year, immutable |
| Trending API | 30 min, stale-while-revalidate 12h |
| Latest API | 2 hours, stale-while-revalidate 24h |
| Platform/genre API | 1 hour, stale-while-revalidate 24h |
| Details API | 6 hours, stale-while-revalidate 7 days |
| Search API | 5 min, stale-while-revalidate 1h |
