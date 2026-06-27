# Performance Audit — NetMirror (June 2026)

## Bundle Analysis

| Asset | Size | Status |
|---|---|---|
| React runtime (client.js) | 182KB | Expected — required for interactive components |
| Firebase SDK (index.esm.js) | 229KB | Only loaded on login page |
| SearchBox.js | 32KB | Loaded on search page only |
| DynamicRail.js | 5KB | Loaded per rail via client:visible |
| DynamicHero.js | 2KB | Loaded via client:idle |
| DynamicGrid.js | 3KB | Loaded via client:idle on grid pages |
| Total JS | 466KB | Split across pages, not loaded all at once |
| Total CSS | 81KB | Single file, treeshaken by Tailwind |

## Issues Found & Fixed

1. **DynamicHero used `client:load`** → Changed to `client:idle` (defers React hydration)
2. **DynamicGrid used `client:load` on 5 pages** → Changed to `client:idle`
3. **Google Fonts blocked rendering** → Added `media="print"` + `onload` pattern
4. **Poster images used w500 (500px)** → Changed to w342 for 155px cards (40% smaller)
5. **No `content-visibility: auto`** → Added for below-fold rail sections
6. **Hero images lacked dimensions** → Added width/height/fetchPriority
7. **No reduced-motion support** → Added `prefers-reduced-motion` media query
8. **No focus-visible styles** → Added global focus-visible outline
9. **Hero auto-slide continued in background tabs** → Added visibilitychange listener
10. **Cache headers incomplete** → Added immutable cache for _astro, assets, fallbacks

## Remaining Notes

- Firebase (229KB) is only imported on the login page via dynamic import
- React (182KB) is required for interactive islands (hero, rails, search, grid, auth)
- Total dist size: 9.6MB across 190 pages (~50KB average per page)
