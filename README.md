# Net27 - Movie & Show Discovery Platform

A premium movie, TV show, and anime discovery platform built with Astro, TypeScript, and Tailwind CSS. Find where to watch your favorite titles legally across streaming platforms.

## Tech Stack

- **Framework**: Astro (Static Site Generation)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Interactive Components**: React (Astro Islands)
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:4321`.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.astro     # Sticky navigation header
│   ├── Footer.astro     # Site footer
│   ├── HeroSlider.astro # Homepage hero carousel
│   ├── TitleCard.astro  # Movie/show card component
│   ├── Breadcrumbs.astro# Breadcrumb navigation
│   ├── SearchBox.tsx    # React search with filters
│   ├── SEOHead.astro    # Meta tags component
│   └── Schema.astro     # JSON-LD schema component
├── data/                # Content data layer
│   ├── sampleTitles.ts  # Movies, shows, anime dataset
│   └── blogPosts.ts     # Blog content
├── layouts/
│   └── BaseLayout.astro # HTML document wrapper
├── lib/                 # Utilities
│   ├── types.ts         # TypeScript interfaces
│   ├── seo.ts           # SEO utilities
│   └── schema.ts        # JSON-LD schema generators
├── pages/               # File-based routing
│   ├── index.astro      # Homepage
│   ├── movies/          # Movie listing & detail pages
│   ├── shows/           # Show & anime detail pages
│   ├── anime/           # Anime listing
│   ├── genre/           # Genre archive pages
│   ├── language/        # Language archive pages
│   ├── platform/        # Platform archive pages
│   ├── trending/        # Trending titles
│   ├── latest/          # Latest releases
│   ├── search.astro     # Search with filters
│   ├── blog/            # Blog listing & articles
│   ├── about.astro      # About page
│   ├── contact.astro    # Contact page
│   ├── dmca.astro       # DMCA policy
│   ├── privacy.astro    # Privacy policy
│   ├── terms.astro      # Terms of service
│   └── 404.astro        # Custom 404 page
└── styles/
    └── global.css       # Tailwind + custom styles
```

## Features

- Dark cinematic UI with glassmorphism effects
- Responsive design (mobile, tablet, desktop)
- Server-side rendered with static output
- Client-side search with genre/type/year filters
- JSON-LD schema markup (WebSite, Organization, Movie, TVSeries, Article, FAQ, BreadcrumbList)
- SEO-optimized with unique meta tags per page
- Sitemap and robots.txt generation
- Clean URL structure
- Accessible keyboard navigation with ARIA labels
- Skeleton loading states

## Deployment (Cloudflare Pages)

### Settings

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js version | `20` |

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SITE_URL` | Production URL (https://net-27.cc) | Optional |

### Steps

1. Push this repository to GitHub
2. Connect the repository to Cloudflare Pages
3. Set the build settings as shown above
4. Deploy

## Content Management

The site uses a static data layer (`src/data/`) that can be replaced with:
- A headless CMS (Strapi, Sanity, Contentful)
- TMDb API for real movie data
- A custom backend API

To add real content, update the data files in `src/data/` or modify the data layer to fetch from an external API.

## Legal Notice

This platform provides movie and show discovery and availability information only. We do not host, stream, or distribute copyrighted content. All streaming availability data is for informational purposes.

## License

All rights reserved. This project and its source code are proprietary to net-27.cc.
