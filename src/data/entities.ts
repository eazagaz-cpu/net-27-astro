import type { Actor, Director, Country, Year, Studio } from '../lib/types';
import type { Title } from '../lib/types';
import { sampleTitles } from './sampleTitles';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// =====================
// ACTORS
// =====================

// Extract unique actor names and compute titleIds
const actorTitleMap = new Map<string, string[]>();
for (const title of sampleTitles) {
  for (const castMember of title.cast) {
    const existing = actorTitleMap.get(castMember.name) || [];
    if (!existing.includes(title.id)) {
      existing.push(title.id);
    }
    actorTitleMap.set(castMember.name, existing);
  }
}

export const actors: Actor[] = [
  {
    slug: 'elena-voss',
    name: 'Elena Voss',
    bio: 'Elena Voss is a classically trained stage actress who transitioned to action cinema after a breakout performance in an independent thriller. Known for performing her own stunts, she has become one of the most bankable action stars of her generation.',
    birthYear: 1988,
    nationality: 'American',
    knownFor: ['Action', 'Thriller'],
    titleIds: actorTitleMap.get('Elena Voss') || [],
  },
  {
    slug: 'marcus-hale',
    name: 'Marcus Hale',
    bio: 'Marcus Hale rose to fame through a series of critically acclaimed independent films before landing major studio roles. His versatility allows him to move seamlessly between intense dramas and high-octane action sequences.',
    birthYear: 1985,
    nationality: 'British',
    knownFor: ['Action', 'Drama'],
    titleIds: actorTitleMap.get('Marcus Hale') || [],
  },
  {
    slug: 'rina-takahashi',
    name: 'Rina Takahashi',
    bio: 'Rina Takahashi began her career in Japanese television before making the leap to international cinema. Fluent in three languages, she brings cultural depth and authenticity to every role she inhabits.',
    birthYear: 1992,
    nationality: 'Japanese',
    knownFor: ['Action', 'Drama', 'Thriller'],
    titleIds: actorTitleMap.get('Rina Takahashi') || [],
  },
  {
    slug: 'ji-yeon-park',
    name: 'Ji-Yeon Park',
    bio: 'Ji-Yeon Park is a South Korean actress who gained international recognition for her work in cyberpunk and science fiction films. Her intense screen presence and commitment to complex characters have earned her multiple awards.',
    birthYear: 1990,
    nationality: 'Korean',
    knownFor: ['Sci-Fi', 'Action', 'Thriller'],
    titleIds: actorTitleMap.get('Ji-Yeon Park') || [],
  },
  {
    slug: 'robert-calloway',
    name: 'Robert Calloway',
    bio: 'Robert Calloway is a veteran actor whose career spans four decades of film and television. Known for his powerful dramatic performances, he has earned a reputation as one of the finest character actors working today.',
    birthYear: 1970,
    nationality: 'American',
    knownFor: ['Drama', 'Romance'],
    titleIds: actorTitleMap.get('Robert Calloway') || [],
  },
  {
    slug: 'sophia-laurent',
    name: 'Sophia Laurent',
    bio: 'Sophia Laurent trained at the Conservatoire National in Paris before launching an international film career. Her elegant screen presence and emotional range have made her a sought-after leading lady in both French and English-language productions.',
    birthYear: 1991,
    nationality: 'French',
    knownFor: ['Drama', 'Romance'],
    titleIds: actorTitleMap.get('Sophia Laurent') || [],
  },
  {
    slug: 'kavya-sharma',
    name: 'Kavya Sharma',
    bio: 'Kavya Sharma is an Indian actress who made her mark in Bollywood before crossing over to international fantasy productions. Her commanding presence and regal bearing make her a natural fit for roles of power and authority.',
    birthYear: 1987,
    nationality: 'Indian',
    knownFor: ['Fantasy', 'Drama'],
    titleIds: actorTitleMap.get('Kavya Sharma') || [],
  },
  {
    slug: 'chris-dalton',
    name: 'Chris Dalton',
    bio: 'Chris Dalton started as a stand-up comedian before transitioning to acting, bringing his natural comic timing to both comedic and dramatic roles. His ability to balance humor with emotional depth has made him a fan favorite.',
    birthYear: 1983,
    nationality: 'American',
    knownFor: ['Comedy', 'Drama'],
    titleIds: actorTitleMap.get('Chris Dalton') || [],
  },
  {
    slug: 'isabella-reyes',
    name: 'Isabella Reyes',
    bio: 'Isabella Reyes is a Spanish-American actress whose warmth and charisma have made her one of the most beloved romantic leads in contemporary cinema. She is also an accomplished producer, championing stories from underrepresented communities.',
    birthYear: 1993,
    nationality: 'American',
    knownFor: ['Romance', 'Drama'],
    titleIds: actorTitleMap.get('Isabella Reyes') || [],
  },
  {
    slug: 'natalie-cross',
    name: 'Natalie Cross',
    bio: 'Natalie Cross is a British actress known for her roles in espionage thrillers and political dramas. A graduate of RADA, she brings theatrical precision to every performance, earning critical praise for her intense portrayals.',
    birthYear: 1986,
    nationality: 'British',
    knownFor: ['Thriller', 'Mystery'],
    titleIds: actorTitleMap.get('Natalie Cross') || [],
  },
  {
    slug: 'takeshi-yamamoto',
    name: 'Takeshi Yamamoto',
    bio: 'Takeshi Yamamoto is one of Japan\'s most prolific voice actors, lending his talent to numerous anime series and animated films. His dynamic vocal range allows him to portray everything from fierce warriors to gentle mentors.',
    birthYear: 1989,
    nationality: 'Japanese',
    knownFor: ['Action', 'Fantasy', 'Adventure'],
    titleIds: actorTitleMap.get('Takeshi Yamamoto') || [],
  },
  {
    slug: 'diana-koslov',
    name: 'Diana Koslov',
    bio: 'Diana Koslov is an actress of Russian-American descent whose specialty lies in psychological thrillers and complex character studies. Her portrayal of morally ambiguous characters has earned her a devoted following among fans of cerebral cinema.',
    birthYear: 1984,
    nationality: 'American',
    knownFor: ['Thriller', 'Drama', 'Mystery'],
    titleIds: actorTitleMap.get('Diana Koslov') || [],
  },
  {
    slug: 'sung-ho-lee',
    name: 'Sung-Ho Lee',
    bio: 'Sung-Ho Lee is a South Korean actor who became a household name through his work in science fiction television. His calm authority and nuanced emotional range make him ideal for leadership roles in ensemble casts.',
    birthYear: 1980,
    nationality: 'Korean',
    knownFor: ['Sci-Fi', 'Drama'],
    titleIds: actorTitleMap.get('Sung-Ho Lee') || [],
  },
  {
    slug: 'rebecca-moore',
    name: 'Rebecca Moore',
    bio: 'Rebecca Moore is a Canadian actress who gained attention for her work in horror and suspense genres. She brings genuine vulnerability to her characters, making her performances in frightening scenarios feel deeply authentic.',
    birthYear: 1988,
    nationality: 'Canadian',
    knownFor: ['Horror', 'Mystery', 'Drama'],
    titleIds: actorTitleMap.get('Rebecca Moore') || [],
  },
  {
    slug: 'carlos-mendez',
    name: 'Carlos Mendez',
    bio: 'Carlos Mendez is a Mexican-American actor whose career encompasses both Spanish-language and English-language productions. His magnetic screen presence and dramatic intensity have made him a leading figure in prestige television.',
    birthYear: 1982,
    nationality: 'American',
    knownFor: ['Drama', 'Mystery', 'Thriller'],
    titleIds: actorTitleMap.get('Carlos Mendez') || [],
  },
  {
    slug: 'gerald-hunt',
    name: 'Gerald Hunt',
    bio: 'Gerald Hunt is a seasoned character actor whose portrayal of world-weary detectives and authority figures has defined an era of crime television. His gravelly voice and commanding presence are instantly recognizable.',
    birthYear: 1972,
    nationality: 'American',
    knownFor: ['Crime', 'Drama', 'Mystery'],
    titleIds: actorTitleMap.get('Gerald Hunt') || [],
  },
  {
    slug: 'mia-tanaka',
    name: 'Mia Tanaka',
    bio: 'Mia Tanaka is a Japanese-American voice actress and performer known for her work in animated features and anime. Her ability to convey youthful wonder and determination through voice alone has made her a favorite among animation directors.',
    birthYear: 1995,
    nationality: 'Japanese',
    knownFor: ['Animation', 'Fantasy', 'Family'],
    titleIds: actorTitleMap.get('Mia Tanaka') || [],
  },
  {
    slug: 'shin-hayashi',
    name: 'Shin Hayashi',
    bio: 'Shin Hayashi is a Japanese voice actor celebrated for his work in thriller and mystery anime. His ability to convey psychological tension through vocal performance alone has earned him numerous voice acting awards.',
    birthYear: 1987,
    nationality: 'Japanese',
    knownFor: ['Thriller', 'Sci-Fi', 'Mystery'],
    titleIds: actorTitleMap.get('Shin Hayashi') || [],
  },
  {
    slug: 'andre-mitchell',
    name: 'Andre Mitchell',
    bio: 'Andre Mitchell is an American actor whose natural comedic talent and dramatic chops have made him equally at home in sitcoms and crime procedurals. He is also an accomplished screenwriter and director.',
    birthYear: 1981,
    nationality: 'American',
    knownFor: ['Comedy', 'Crime'],
    titleIds: actorTitleMap.get('Andre Mitchell') || [],
  },
  {
    slug: 'david-mwangi',
    name: 'David Mwangi',
    bio: 'David Mwangi is a Kenyan-British television presenter and actor known for his work in nature documentaries and adventure programming. His passionate advocacy for wildlife conservation shines through in every project he undertakes.',
    birthYear: 1978,
    nationality: 'British',
    knownFor: ['Documentary', 'Adventure'],
    titleIds: actorTitleMap.get('David Mwangi') || [],
  },
];

export function getActorBySlug(slug: string): Actor | undefined {
  return actors.find(a => a.slug === slug);
}

export function getActorTitles(actor: Actor): Title[] {
  return sampleTitles.filter(t => actor.titleIds.includes(t.id));
}

export function getAllActors(): Actor[] {
  return actors;
}

// =====================
// DIRECTORS
// =====================

const directorTitleMap = new Map<string, string[]>();
for (const title of sampleTitles) {
  const existing = directorTitleMap.get(title.director) || [];
  if (!existing.includes(title.id)) {
    existing.push(title.id);
  }
  directorTitleMap.set(title.director, existing);
}

export const directors: Director[] = [
  {
    slug: 'lena-marchetti',
    name: 'Lena Marchetti',
    bio: 'Lena Marchetti is an Italian-American filmmaker known for crafting high-stakes action sequences with emotional depth. Her background in documentary filmmaking gives her action films a raw, grounded quality.',
    birthYear: 1979,
    nationality: 'American',
    style: 'Combines visceral action choreography with intimate character moments, often using long takes and practical effects.',
    titleIds: directorTitleMap.get('Lena Marchetti') || [],
  },
  {
    slug: 'catherine-harlow',
    name: 'Catherine Harlow',
    bio: 'Catherine Harlow is a British director whose period dramas and romantic films have been praised for their visual elegance and emotional authenticity. She has a particular talent for drawing career-best performances from her actors.',
    birthYear: 1975,
    nationality: 'British',
    style: 'Elegant visual storytelling with meticulous period detail, known for soft natural lighting and emotionally resonant narratives.',
    titleIds: directorTitleMap.get('Catherine Harlow') || [],
  },
  {
    slug: 'yuto-hashimoto',
    name: 'Yuto Hashimoto',
    bio: 'Yuto Hashimoto is a Japanese filmmaker who blends cyberpunk aesthetics with philosophical storytelling. His visually stunning films explore the intersection of technology and humanity in increasingly relevant ways.',
    birthYear: 1982,
    nationality: 'Japanese',
    style: 'Neon-drenched cyberpunk visuals with layered narratives that explore identity, technology, and corporate power.',
    titleIds: directorTitleMap.get('Yuto Hashimoto') || [],
  },
  {
    slug: 'martin-hale',
    name: 'Martin Hale',
    bio: 'Martin Hale is a German-American director specializing in espionage thrillers and political dramas. His precise, methodical approach to filmmaking mirrors the tradecraft depicted in his stories.',
    birthYear: 1976,
    nationality: 'German',
    style: 'Taut, methodical pacing with muted color palettes and complex plot structures that reward attentive viewers.',
    titleIds: directorTitleMap.get('Martin Hale') || [],
  },
  {
    slug: 'sarah-goldstein',
    name: 'Sarah Goldstein',
    bio: 'Sarah Goldstein is an American director and former stand-up comedian whose films balance sharp humor with surprisingly poignant emotional beats. She is known for creating supportive on-set environments that bring out the best in comedic performers.',
    birthYear: 1980,
    nationality: 'American',
    style: 'Naturalistic comedy with improvisational energy, blending laugh-out-loud moments with genuine emotional stakes.',
    titleIds: directorTitleMap.get('Sarah Goldstein') || [],
  },
  {
    slug: 'nikolai-petrov',
    name: 'Nikolai Petrov',
    bio: 'Nikolai Petrov is a Russian-born director whose atmospheric horror films draw on Eastern European folklore and psychological tension. His films are renowned for building dread through environment and sound rather than relying on jump scares.',
    birthYear: 1974,
    nationality: 'American',
    style: 'Slow-burn atmospheric horror with rich sound design, practical effects, and an emphasis on psychological unease over gore.',
    titleIds: directorTitleMap.get('Nikolai Petrov') || [],
  },
  {
    slug: 'valentina-cruz',
    name: 'Valentina Cruz',
    bio: 'Valentina Cruz is a Spanish director whose romantic films celebrate the magic of human connection across cultural boundaries. Her work features vibrant cinematography and heartfelt performances that resonate with audiences worldwide.',
    birthYear: 1985,
    nationality: 'Spanish',
    style: 'Warm, sun-dappled cinematography with multicultural casts, celebrating love stories that transcend borders and expectations.',
    titleIds: directorTitleMap.get('Valentina Cruz') || [],
  },
  {
    slug: 'akira-fujimoto',
    name: 'Akira Fujimoto',
    bio: 'Akira Fujimoto is a Japanese animation director whose hand-drawn feature films have been compared to the works of Studio Ghibli. His films blend traditional artistic techniques with modern storytelling sensibilities.',
    birthYear: 1978,
    nationality: 'Japanese',
    style: 'Lush hand-drawn animation with detailed natural environments, blending whimsy with profound emotional depth.',
    titleIds: directorTitleMap.get('Akira Fujimoto') || [],
  },
  {
    slug: 'richard-okonkwo',
    name: 'Richard Okonkwo',
    bio: 'Richard Okonkwo is a Nigerian-British director who has redefined the crime procedural genre with his nuanced character work and socially conscious storytelling. His television work has earned numerous BAFTA nominations.',
    birthYear: 1977,
    nationality: 'British',
    style: 'Gritty, character-driven crime narratives with social commentary, using handheld cameras and desaturated tones.',
    titleIds: directorTitleMap.get('Richard Okonkwo') || [],
  },
  {
    slug: 'arjun-kapoor',
    name: 'Arjun Kapoor',
    bio: 'Arjun Kapoor is an Indian director whose epic fantasy television productions have brought the scale of feature filmmaking to the small screen. His ability to manage sprawling narratives with dozens of characters is unmatched in television.',
    birthYear: 1981,
    nationality: 'Indian',
    style: 'Sweeping epic narratives with rich world-building, large ensemble casts, and cinematic production values for television.',
    titleIds: directorTitleMap.get('Arjun Kapoor') || [],
  },
  {
    slug: 'min-jae-choi',
    name: 'Min-Jae Choi',
    bio: 'Min-Jae Choi is a South Korean director whose science fiction work explores existential questions through deeply human stories. His methodical approach to world-building creates immersive settings that feel lived-in and authentic.',
    birthYear: 1983,
    nationality: 'Korean',
    style: 'Contemplative science fiction with meticulous world-building, exploring existential themes through character-driven narratives.',
    titleIds: directorTitleMap.get('Min-Jae Choi') || [],
  },
  {
    slug: 'amy-rodriguez',
    name: 'Amy Rodriguez',
    bio: 'Amy Rodriguez is an American television director known for her ability to balance comedy with procedural storytelling. Her sharp comedic timing and knack for ensemble dynamics have made her shows long-running audience favorites.',
    birthYear: 1979,
    nationality: 'American',
    style: 'Snappy comedic pacing with strong ensemble chemistry, blending humor and heart within procedural frameworks.',
    titleIds: directorTitleMap.get('Amy Rodriguez') || [],
  },
  {
    slug: 'elif-baykal',
    name: 'Elif Baykal',
    bio: 'Elif Baykal is a Turkish director whose psychological thrillers have captivated audiences worldwide. Her intricate storytelling and ability to sustain tension across multiple episodes have earned her comparisons to the greatest suspense filmmakers.',
    birthYear: 1984,
    nationality: 'Turkish',
    style: 'Layered psychological narratives with unreliable perspectives, using claustrophobic framing and ambient sound to build unease.',
    titleIds: directorTitleMap.get('Elif Baykal') || [],
  },
  {
    slug: 'philippe-moreau',
    name: 'Philippe Moreau',
    bio: 'Philippe Moreau is a French documentary filmmaker whose nature series have set new standards for wildlife cinematography. His patient, observational approach reveals the hidden dramas of the natural world with breathtaking clarity.',
    birthYear: 1973,
    nationality: 'French',
    style: 'Patient, observational documentary style with groundbreaking macro and underwater cinematography techniques.',
    titleIds: directorTitleMap.get('Philippe Moreau') || [],
  },
  {
    slug: 'gabriela-fuentes',
    name: 'Gabriela Fuentes',
    bio: 'Gabriela Fuentes is a Mexican director whose gothic dramas explore family secrets and inherited trauma. Her visual style combines old-world grandeur with modern psychological insight, creating stories that feel both timeless and immediate.',
    birthYear: 1980,
    nationality: 'American',
    style: 'Gothic visual storytelling with rich production design, exploring family dynamics through layered mysteries and atmospheric tension.',
    titleIds: directorTitleMap.get('Gabriela Fuentes') || [],
  },
  {
    slug: 'isabelle-laurent',
    name: 'Isabelle Laurent',
    bio: 'Isabelle Laurent is a French-Canadian documentary director whose conservation-focused series combine stunning visuals with urgent environmental messaging. Her work has influenced policy discussions and inspired a new generation of conservationists.',
    birthYear: 1981,
    nationality: 'French',
    style: 'Emotionally engaging conservation documentaries with cinematic visuals and compelling personal narratives from field workers.',
    titleIds: directorTitleMap.get('Isabelle Laurent') || [],
  },
  {
    slug: 'kenichi-murakami',
    name: 'Kenichi Murakami',
    bio: 'Kenichi Murakami is a Japanese anime director renowned for his dynamic action sequences and intricate fantasy world-building. His series consistently push the boundaries of what is possible in animated storytelling.',
    birthYear: 1977,
    nationality: 'Japanese',
    style: 'Fluid, kinetic action animation with detailed fantasy world-building and meticulously choreographed battle sequences.',
    titleIds: directorTitleMap.get('Kenichi Murakami') || [],
  },
  {
    slug: 'yui-taniguchi',
    name: 'Yui Taniguchi',
    bio: 'Yui Taniguchi is a Japanese anime director whose mecha series have revitalized the genre for modern audiences. She balances spectacular robot battles with thoughtful explorations of war, identity, and the human cost of conflict.',
    birthYear: 1986,
    nationality: 'Japanese',
    style: 'Grand-scale mecha action with detailed mechanical designs, balancing spectacle with anti-war themes and character development.',
    titleIds: directorTitleMap.get('Yui Taniguchi') || [],
  },
  {
    slug: 'makoto-shinohara',
    name: 'Makoto Shinohara',
    bio: 'Makoto Shinohara is a Japanese anime director whose slice-of-life romance series are celebrated for their emotional honesty and beautiful seasonal imagery. His work captures the bittersweet nature of youth with remarkable sensitivity.',
    birthYear: 1984,
    nationality: 'Japanese',
    style: 'Delicate, emotionally nuanced romance with stunning seasonal landscape art and naturalistic character interactions.',
    titleIds: directorTitleMap.get('Makoto Shinohara') || [],
  },
  {
    slug: 'haruki-otsuka',
    name: 'Haruki Otsuka',
    bio: 'Haruki Otsuka is a Japanese anime director whose fantasy adventure series are praised for their richly imagined worlds and philosophical depth. His storytelling draws on world mythology to create narratives that feel both epic and intimate.',
    birthYear: 1975,
    nationality: 'Japanese',
    style: 'Mythologically rich fantasy with painterly backgrounds, weaving philosophical themes into adventure narratives.',
    titleIds: directorTitleMap.get('Haruki Otsuka') || [],
  },
  {
    slug: 'satoshi-kon-jr',
    name: 'Satoshi Kon Jr.',
    bio: 'Satoshi Kon Jr. is a Japanese anime director whose horror and mystery works explore the thin boundary between reality and nightmare. His atmospheric visual storytelling creates experiences that linger long after the credits roll.',
    birthYear: 1988,
    nationality: 'Japanese',
    style: 'Psychological horror with reality-bending visuals, using shifting perspectives and surreal imagery to create unease.',
    titleIds: directorTitleMap.get('Satoshi Kon Jr.') || [],
  },
  {
    slug: 'naoko-yamada',
    name: 'Naoko Yamada',
    bio: 'Naoko Yamada is a Japanese anime director whose slice-of-life comedies are celebrated for their warmth, gentle humor, and attention to everyday details. Her works find profound beauty in the ordinary moments of daily life.',
    birthYear: 1984,
    nationality: 'Japanese',
    style: 'Warm, observational slice-of-life with gentle humor, detailed everyday settings, and expressive character animation.',
    titleIds: directorTitleMap.get('Naoko Yamada') || [],
  },
  {
    slug: 'tetsuro-araki',
    name: 'Tetsuro Araki',
    bio: 'Tetsuro Araki is a Japanese anime director famous for his high-energy sports and action series. His ability to make athletic competition feel as thrilling as any battle sequence has earned him a massive international fanbase.',
    birthYear: 1976,
    nationality: 'Japanese',
    style: 'High-energy sports action with dramatic camera angles, intense rivalries, and inspirational underdog narratives.',
    titleIds: directorTitleMap.get('Tetsuro Araki') || [],
  },
  {
    slug: 'gen-urobuchi',
    name: 'Gen Urobuchi',
    bio: 'Gen Urobuchi is a Japanese writer and director known for his dark, psychologically complex anime series. His willingness to subvert genre conventions and explore moral ambiguity has made him one of the most influential voices in modern anime.',
    birthYear: 1972,
    nationality: 'Japanese',
    style: 'Dark psychological narratives that subvert genre expectations, with morally complex characters and philosophical undertones.',
    titleIds: directorTitleMap.get('Gen Urobuchi') || [],
  },
];

export function getDirectorBySlug(slug: string): Director | undefined {
  return directors.find(d => d.slug === slug);
}

export function getDirectorTitles(director: Director): Title[] {
  return sampleTitles.filter(t => director.titleIds.includes(t.id));
}

export function getAllDirectors(): Director[] {
  return directors;
}

// =====================
// COUNTRIES
// =====================

const languageToCountryMap: Record<string, string[]> = {
  English: ['united-states', 'united-kingdom', 'canada'],
  Japanese: ['japan'],
  Korean: ['south-korea'],
  French: ['france'],
  Hindi: ['india'],
  German: ['germany'],
  Turkish: ['turkey'],
  Spanish: ['spain'],
};

function countTitlesByCountry(countrySlug: string): number {
  let count = 0;
  for (const title of sampleTitles) {
    for (const lang of title.languages) {
      const countrySlugs = languageToCountryMap[lang] || [];
      if (countrySlugs.includes(countrySlug)) {
        count++;
        break;
      }
    }
  }
  return count;
}

export const countries: Country[] = [
  {
    slug: 'united-states',
    name: 'United States',
    description: 'Hollywood remains the global epicenter of film and television production, home to major studios and streaming platforms that shape entertainment worldwide.',
    count: countTitlesByCountry('united-states'),
  },
  {
    slug: 'united-kingdom',
    name: 'United Kingdom',
    description: 'The UK boasts a rich cinematic tradition spanning period dramas, gritty crime thrillers, and groundbreaking science fiction, supported by world-class talent and studios like Pinewood.',
    count: countTitlesByCountry('united-kingdom'),
  },
  {
    slug: 'japan',
    name: 'Japan',
    description: 'Japan is a powerhouse of both live-action cinema and animation, with its anime industry reaching global audiences and auteur filmmakers continuing to push creative boundaries.',
    count: countTitlesByCountry('japan'),
  },
  {
    slug: 'south-korea',
    name: 'South Korea',
    description: 'South Korean cinema and television have experienced an unprecedented global surge, with K-dramas and award-winning films captivating audiences across every continent.',
    count: countTitlesByCountry('south-korea'),
  },
  {
    slug: 'france',
    name: 'France',
    description: 'As the birthplace of cinema, France continues to produce influential films that balance artistic ambition with popular appeal, from auteur masterpieces to acclaimed documentaries.',
    count: countTitlesByCountry('france'),
  },
  {
    slug: 'india',
    name: 'India',
    description: 'India produces more films annually than any other country, with Bollywood leading a diverse industry that spans multiple languages, regions, and storytelling traditions.',
    count: countTitlesByCountry('india'),
  },
  {
    slug: 'germany',
    name: 'Germany',
    description: 'German cinema has a storied history from Expressionism to modern thrillers, and the country has become a major hub for international television production and co-productions.',
    count: countTitlesByCountry('germany'),
  },
  {
    slug: 'turkey',
    name: 'Turkey',
    description: 'Turkish television dramas have become a global phenomenon, exported to over 150 countries and captivating audiences with their sweeping narratives and production values.',
    count: countTitlesByCountry('turkey'),
  },
  {
    slug: 'spain',
    name: 'Spain',
    description: 'Spanish cinema and television have gained international prominence with critically acclaimed thrillers, dramas, and genre-defying series that showcase the country\'s creative vitality.',
    count: countTitlesByCountry('spain'),
  },
  {
    slug: 'canada',
    name: 'Canada',
    description: 'Canada is a major filming destination and co-production partner, with a thriving domestic industry known for innovative independent films, horror, and science fiction.',
    count: countTitlesByCountry('canada'),
  },
];

export function getCountryBySlug(slug: string): Country | undefined {
  return countries.find(c => c.slug === slug);
}

export function getTitlesByCountry(country: Country): Title[] {
  const matchingLanguages: string[] = [];
  for (const [lang, slugs] of Object.entries(languageToCountryMap)) {
    if (slugs.includes(country.slug)) {
      matchingLanguages.push(lang);
    }
  }
  return sampleTitles.filter(t =>
    t.languages.some(l => matchingLanguages.includes(l))
  );
}

// =====================
// YEARS
// =====================

const yearCountMap = new Map<number, number>();
for (const title of sampleTitles) {
  yearCountMap.set(title.year, (yearCountMap.get(title.year) || 0) + 1);
}

const uniqueYears = Array.from(yearCountMap.keys()).sort((a, b) => b - a);

export const years: Year[] = uniqueYears.map(y => ({
  year: y,
  slug: String(y),
  count: yearCountMap.get(y) || 0,
}));

export function getYearBySlug(slug: string): Year | undefined {
  return years.find(y => y.slug === slug);
}

export function getTitlesByYear(year: number): Title[] {
  return sampleTitles.filter(t => t.year === year);
}

// =====================
// STUDIOS
// =====================

const allTitleIds = sampleTitles.map(t => t.id);

export const studios: Studio[] = [
  {
    slug: 'horizon-pictures',
    name: 'Horizon Pictures',
    description: 'Horizon Pictures specializes in sweeping action and adventure films that push the boundaries of visual storytelling and practical effects.',
    founded: 1998,
    headquarters: 'Los Angeles, USA',
    titleIds: allTitleIds.slice(0, 3),
  },
  {
    slug: 'starlight-entertainment',
    name: 'Starlight Entertainment',
    description: 'Starlight Entertainment is known for heartfelt dramas and romantic stories that connect with audiences on a deeply personal level.',
    founded: 2005,
    headquarters: 'London, UK',
    titleIds: allTitleIds.slice(3, 6),
  },
  {
    slug: 'crimson-gate-films',
    name: 'Crimson Gate Films',
    description: 'Crimson Gate Films produces gripping thrillers and horror titles that keep audiences on the edge of their seats with innovative storytelling techniques.',
    founded: 2001,
    headquarters: 'New York, USA',
    titleIds: allTitleIds.slice(6, 9),
  },
  {
    slug: 'blue-atlas-studios',
    name: 'Blue Atlas Studios',
    description: 'Blue Atlas Studios creates thought-provoking science fiction and fantasy content that explores the frontiers of human imagination.',
    founded: 2010,
    headquarters: 'Vancouver, Canada',
    titleIds: allTitleIds.slice(9, 12),
  },
  {
    slug: 'neon-wave-productions',
    name: 'Neon Wave Productions',
    description: 'Neon Wave Productions is a cutting-edge studio focused on genre-bending narratives that merge visual innovation with bold storytelling.',
    founded: 2012,
    headquarters: 'Seoul, South Korea',
    titleIds: allTitleIds.slice(12, 15),
  },
  {
    slug: 'sakura-animation',
    name: 'Sakura Animation',
    description: 'Sakura Animation is a premier anime studio known for breathtaking hand-drawn and hybrid animation that has captivated audiences worldwide.',
    founded: 1995,
    headquarters: 'Tokyo, Japan',
    titleIds: allTitleIds.slice(15, 18),
  },
  {
    slug: 'silver-screen-media',
    name: 'Silver Screen Media',
    description: 'Silver Screen Media produces award-winning documentaries and prestige dramas that illuminate untold stories and spark meaningful conversations.',
    founded: 2003,
    headquarters: 'Toronto, Canada',
    titleIds: allTitleIds.slice(18, 21),
  },
  {
    slug: 'emerald-city-films',
    name: 'Emerald City Films',
    description: 'Emerald City Films is an independent studio championing diverse voices and fresh perspectives across every genre from comedy to thriller.',
    founded: 2008,
    headquarters: 'Berlin, Germany',
    titleIds: allTitleIds.slice(21, 24),
  },
];

export function getStudioBySlug(slug: string): Studio | undefined {
  return studios.find(s => s.slug === slug);
}

export function getStudioTitles(studio: Studio): Title[] {
  return sampleTitles.filter(t => studio.titleIds.includes(t.id));
}
