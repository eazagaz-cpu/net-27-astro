export interface SitemapLink {
  title: string;
  href: string;
  description?: string;
}

export interface SitemapSection {
  heading: string;
  links: SitemapLink[];
}

export function getSitemapSections(): SitemapSection[] {
  return [
    {
      heading: 'Main Pages',
      links: [
        { title: 'Home', href: '/' },
        { title: 'Movies', href: '/movies/' },
        { title: 'TV Shows', href: '/shows/' },
        { title: 'Anime', href: '/anime/' },
        { title: 'Trending', href: '/trending/' },
        { title: 'Latest Releases', href: '/latest/' },
        { title: 'Search', href: '/search/' },
        { title: 'Blog', href: '/blog/' },
        { title: 'Sign In', href: '/login/' },
      ],
    },
    {
      heading: 'App & Download',
      links: [
        { title: 'Download NetMirror APK', href: '/app/download/', description: 'Universal, ARM64, ARM32 builds' },
      ],
    },
    {
      heading: 'Help & Troubleshooting',
      links: [
        { title: 'App Not Installed Fix', href: '/help/app-not-installed/' },
        { title: 'Parsing Package Error Fix', href: '/help/parsing-package-error/' },
        { title: 'Video Not Playing Fix', href: '/help/video-not-playing/' },
      ],
    },
    {
      heading: 'Streaming Platforms',
      links: [
        { title: 'Netflix', href: '/platform/netflix/' },
        { title: 'Prime Video', href: '/platform/prime-video/' },
        { title: 'JioHotstar', href: '/platform/jiohotstar/' },
        { title: 'SonyLIV', href: '/platform/sonyliv/' },
        { title: 'Crunchyroll', href: '/platform/crunchyroll/' },
        { title: 'Disney+', href: '/platform/disney/' },
        { title: 'MX Player', href: '/platform/mx-player/' },
        { title: 'Apple TV+', href: '/platform/apple-tv/' },
        { title: 'HBO Max', href: '/platform/hbo-max/' },
        { title: 'Hulu', href: '/platform/hulu/' },
        { title: 'Paramount+', href: '/platform/paramount/' },
      ],
    },
    {
      heading: 'Genres',
      links: [
        { title: 'Action', href: '/genre/action/' },
        { title: 'Comedy', href: '/genre/comedy/' },
        { title: 'Drama', href: '/genre/drama/' },
        { title: 'Thriller', href: '/genre/thriller/' },
        { title: 'Horror', href: '/genre/horror/' },
        { title: 'Sci-Fi', href: '/genre/sci-fi/' },
        { title: 'Romance', href: '/genre/romance/' },
        { title: 'Crime', href: '/genre/crime/' },
        { title: 'Adventure', href: '/genre/adventure/' },
        { title: 'Fantasy', href: '/genre/fantasy/' },
        { title: 'Animation', href: '/genre/animation/' },
        { title: 'Documentary', href: '/genre/documentary/' },
        { title: 'Family', href: '/genre/family/' },
        { title: 'Kids', href: '/genre/kids/' },
        { title: 'Mystery', href: '/genre/mystery/' },
        { title: 'Hindi Dubbed', href: '/genre/hindi-dubbed/' },
      ],
    },
    {
      heading: 'Languages',
      links: [
        { title: 'Hindi', href: '/language/hindi/' },
        { title: 'English', href: '/language/english/' },
        { title: 'Korean', href: '/language/korean/' },
        { title: 'Japanese', href: '/language/japanese/' },
        { title: 'Spanish', href: '/language/spanish/' },
        { title: 'French', href: '/language/french/' },
        { title: 'German', href: '/language/german/' },
        { title: 'Turkish', href: '/language/turkish/' },
      ],
    },
    {
      heading: 'Legal & Trust',
      links: [
        { title: 'About NetMirror', href: '/about/' },
        { title: 'Contact', href: '/contact/' },
        { title: 'Privacy Policy', href: '/privacy/' },
        { title: 'Terms of Service', href: '/terms/' },
        { title: 'DMCA Policy', href: '/dmca/' },
        { title: 'Disclaimer', href: '/disclaimer/' },
        { title: 'Editorial Policy', href: '/editorial/' },
      ],
    },
    {
      heading: 'Technical',
      links: [
        { title: 'XML Sitemap', href: '/sitemap-index.xml' },
        { title: 'Robots.txt', href: '/robots.txt' },
      ],
    },
  ];
}
