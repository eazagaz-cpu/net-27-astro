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
  image: string;
  tags: string[];
  readTime: string;
}

export interface Genre {
  slug: string;
  name: string;
  count: number;
}

export interface Language {
  slug: string;
  name: string;
  count: number;
}

export interface Platform {
  slug: string;
  name: string;
  count: number;
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
