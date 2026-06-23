import { SITE_NAME, SITE_URL } from './seo';

export function websiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logo.png`,
    },
  };
}

export function breadcrumbSchema(
  items: { label: string; href: string }[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

export function movieSchema(movie: any): object {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.name ?? movie.title,
    description: movie.description ?? movie.overview,
  };

  if (movie.image ?? movie.poster_path) {
    schema.image = movie.image ?? movie.poster_path;
  }

  if (movie.datePublished ?? movie.release_date) {
    schema.datePublished = movie.datePublished ?? movie.release_date;
  }

  if (movie.director) {
    schema.director = {
      '@type': 'Person',
      name: movie.director,
    };
  }

  if (movie.genre) {
    schema.genre = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
  }

  if (movie.aggregateRating ?? movie.vote_average) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: movie.aggregateRating?.ratingValue ?? movie.vote_average,
      bestRating: movie.aggregateRating?.bestRating ?? 10,
      ratingCount: movie.aggregateRating?.ratingCount ?? movie.vote_count ?? 0,
    };
  }

  return schema;
}

export function tvSeriesSchema(show: any): object {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: show.name ?? show.title,
    description: show.description ?? show.overview,
  };

  if (show.image ?? show.poster_path) {
    schema.image = show.image ?? show.poster_path;
  }

  if (show.datePublished ?? show.first_air_date) {
    schema.datePublished = show.datePublished ?? show.first_air_date;
  }

  if (show.genre) {
    schema.genre = Array.isArray(show.genre) ? show.genre : [show.genre];
  }

  if (show.numberOfSeasons ?? show.number_of_seasons) {
    schema.numberOfSeasons = show.numberOfSeasons ?? show.number_of_seasons;
  }

  return schema;
}

export function articleSchema(post: any): object {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.headline ?? post.title,
    description: post.description ?? post.excerpt,
  };

  if (post.image) {
    schema.image = post.image;
  }

  if (post.datePublished) {
    schema.datePublished = post.datePublished;
  }

  if (post.author) {
    schema.author = {
      '@type': 'Person',
      name: typeof post.author === 'string' ? post.author : post.author.name,
    };
  }

  return schema;
}

export function personSchema(person: {
  name: string;
  bio?: string;
  birthYear?: number;
  nationality?: string;
  jobTitle?: string;
  url?: string;
}): object {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
  };
  if (person.bio) schema.description = person.bio;
  if (person.birthYear) schema.birthDate = `${person.birthYear}-01-01`;
  if (person.nationality) schema.nationality = person.nationality;
  if (person.jobTitle) schema.jobTitle = person.jobTitle;
  if (person.url) schema.url = person.url;
  return schema;
}

export function faqSchema(
  faqs: { question: string; answer: string }[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
