export interface Title {
  id: string;
  slug: string;
  title: string;
  type: 'movie' | 'show' | 'anime';
  year: number;
  rating: number;
  runtime: string;
  poster: string;
  backdrop: string;
  overview: string;
  genres: string[];
  languages: string[];
  platforms: string[];
  cast: CastMember[];
  director: string;
  trailerUrl: string;
  releaseDate: string;
  status: string;
  isTrending: boolean;
  isLatest: boolean;
  quality: string;
  seasons?: number;
  episodes?: number;
  relatedIds: string[];
}

export interface CastMember {
  name: string;
  role: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  modifiedDate?: string;
  image: string;
  tags: string[];
  category: string;
  readTime: string;
  quickAnswer?: string;
  toc?: { id: string; title: string; level: number }[];
  faqs?: { question: string; answer: string }[];
  tables?: { caption?: string; headers: string[]; rows: string[][] }[];
  pros?: string[];
  cons?: string[];
  safetyNote?: string;
  relatedSlugs?: string[];
  ctaTitle?: string;
  ctaDescription?: string;
}

export interface Genre {
  slug: string;
  name: string;
}

export interface Language {
  slug: string;
  name: string;
}

export interface Platform {
  slug: string;
  name: string;
}

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Country {
  slug: string;
  name: string;
  description: string;
}

export interface Year {
  year: number;
  slug: string;
}
