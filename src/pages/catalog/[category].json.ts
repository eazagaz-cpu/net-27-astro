import { getCachedItems } from '../../lib/movie-cache';

const CATEGORIES = [
  'south-hindi-dubbed',
  'jiohotstar',
  'telugu',
  'tamil',
  'malayalam',
  'kannada',
  'indian-tv',
  'zee5',
  'sonyliv',
  'pakistani-drama',
  'turkish-drama',
  'upcoming',
];

export function getStaticPaths() {
  return CATEGORIES.map((category) => ({
    params: { category },
    props: { category },
  }));
}

export function GET({ props }: { props: { category: string } }) {
  const items = getCachedItems(props.category, 20);
  return new Response(JSON.stringify({ category: props.category, count: items.length, items }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
