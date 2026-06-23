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
| `SITE_URL` | Production URL (https://net27.cc) | Optional |
| `PUBLIC_FIREBASE_API_KEY` | Firebase API key for Google login | For auth |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | For auth |
| `PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | For auth |
| `PUBLIC_FIREBASE_APP_ID` | Firebase app ID | For auth |

### Steps

1. Push this repository to GitHub
2. Connect the repository to Cloudflare Pages
3. Set the build settings as shown above
4. Add Firebase environment variables (see below)
5. Deploy

## Firebase Google Login Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Go to **Authentication** > **Sign-in method**
4. Enable **Google** provider
5. Add authorized domains:
   - `localhost`
   - `net27.cc`
   - `www.net27.cc`
   - `net-27-astro.pages.dev`

### 2. Get Firebase Config
1. Go to **Project Settings** > **General** > **Your apps**
2. Register a Web app if not already done
3. Copy the config values: `apiKey`, `authDomain`, `projectId`, `appId`

### 3. Local Development
Create `.env.local` (git-ignored):
```
PUBLIC_FIREBASE_API_KEY=your_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Cloudflare Pages
Add the same variables in Cloudflare Pages > Settings > Environment Variables.

### 5. Troubleshooting
- **auth/unauthorized-domain**: Add your deploy domain to Firebase authorized domains
- **Popup blocked**: Allow popups for the site in browser settings
- **Missing env vars**: Site works without Firebase — Google button shows "not configured" message
- **Invalid API key**: Double-check the key matches your Firebase project

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
