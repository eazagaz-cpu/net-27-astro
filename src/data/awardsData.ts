/**
 * awardsData.ts — Static award winner TMDB IDs.
 * Cross-referenced with titles.json at build time for rich pages.
 */

export interface AwardEntry {
  tmdbId: number;
  award?: string; // e.g. "Best Picture", "Best Animated Feature"
}

export interface AwardCategory {
  slug: string;
  name: string;
  emoji: string;
  shortName: string;
  description: string;
  color: string;
  winners: AwardEntry[];
}

export const awardCategories: AwardCategory[] = [
  {
    slug: 'oscar-winners',
    name: 'Academy Award Winners',
    shortName: 'Oscars',
    emoji: '🏆',
    description: 'Best Picture winners and major award recipients from the Academy Awards — the most prestigious recognition in cinema history.',
    color: 'from-yellow-600/20 to-amber-500/20',
    winners: [
      // Best Picture winners (recent to older)
      { tmdbId: 872585, award: 'Best Picture 2024 — Oppenheimer' },
      { tmdbId: 674324, award: 'Best Picture 2023 — Everything Everywhere All at Once' },
      { tmdbId: 581734, award: 'Best Picture 2022 — CODA' },
      { tmdbId: 581272, award: 'Best Picture 2021 — Nomadland' },
      { tmdbId: 523397, award: 'Best Picture 2020 — Parasite' },
      { tmdbId: 490132, award: 'Best Picture 2019 — Green Book' },
      { tmdbId: 399055, award: 'Best Picture 2018 — The Shape of Water' },
      { tmdbId: 376867, award: 'Best Picture 2017 — Moonlight' },
      { tmdbId: 307081, award: 'Best Picture 2016 — Spotlight' },
      { tmdbId: 194662, award: 'Best Picture 2015 — Birdman' },
      { tmdbId: 76341,  award: 'Best Picture 2014 — 12 Years a Slave' },
      { tmdbId: 156022, award: 'Best Picture 2013 — Argo' },
      { tmdbId: 69668,  award: 'Best Picture 2012 — The Artist' },
      { tmdbId: 45269,  award: 'Best Picture 2011 — The King\'s Speech' },
      { tmdbId: 12162,  award: 'Best Picture 2009 — The Hurt Locker' },
      { tmdbId: 4922,   award: 'Best Picture 2009 — Slumdog Millionaire' },
      { tmdbId: 1418,   award: 'Best Picture 2008 — No Country for Old Men' },
      { tmdbId: 1422,   award: 'Best Picture 2007 — The Departed' },
      { tmdbId: 313369, award: 'Best Picture 2005 — Crash' },
      { tmdbId: 39254,  award: 'Best Picture 2005 — Million Dollar Baby' },
      { tmdbId: 120,    award: 'Best Picture 2004 — The Lord of the Rings: Return of the King' },
      { tmdbId: 508,    award: 'Best Picture 2003 — Chicago' },
      { tmdbId: 388,    award: 'Best Picture 2002 — A Beautiful Mind' },
    ],
  },
  {
    slug: 'golden-globe-winners',
    name: 'Golden Globe Winners',
    shortName: 'Golden Globes',
    emoji: '🌟',
    description: 'Best Motion Picture winners from the Golden Globes — celebrating excellence in both drama and comedy/musical categories.',
    color: 'from-amber-500/20 to-yellow-400/20',
    winners: [
      { tmdbId: 872585,  award: 'Best Drama Film 2024 — Oppenheimer' },
      { tmdbId: 792307,  award: 'Best Comedy/Musical 2024 — Poor Things' },
      { tmdbId: 545611,  award: 'Best Drama Film 2023 — The Fabelmans' },
      { tmdbId: 438695,  award: 'Best Comedy/Musical 2023 — The Banshees of Inisherin' },
      { tmdbId: 631842,  award: 'Best Drama Film 2022 — The Power of the Dog' },
      { tmdbId: 508947,  award: 'Best Comedy/Musical 2022 — Tick, Tick...Boom!' },
      { tmdbId: 527774,  award: 'Best Animated Film 2022 — Encanto' },
      { tmdbId: 539681,  award: 'Best Drama Film 2021 — Nomadland' },
      { tmdbId: 551271,  award: 'Best Comedy/Musical 2021 — Borat Subsequent Moviefilm' },
      { tmdbId: 496243,  award: 'Best Drama Film 2020 — 1917' },
      { tmdbId: 531219,  award: 'Best Comedy/Musical 2020 — Once Upon a Time in Hollywood' },
      { tmdbId: 490132,  award: 'Best Drama Film 2019 — Bohemian Rhapsody' },
      { tmdbId: 399055,  award: 'Best Drama Film 2018 — Three Billboards Outside Ebbing Missouri' },
    ],
  },
  {
    slug: 'cannes-winners',
    name: 'Cannes Palme d\'Or Winners',
    shortName: 'Cannes',
    emoji: '🌴',
    description: 'Palme d\'Or winners from the Cannes Film Festival — the most prestigious prize in world cinema and arthouse film.',
    color: 'from-green-600/20 to-emerald-500/20',
    winners: [
      { tmdbId: 496243,  award: 'Palme d\'Or 2019 — Parasite' },
      { tmdbId: 458156,  award: 'Palme d\'Or 2018 — Shoplifters' },
      { tmdbId: 337339,  award: 'Palme d\'Or 2017 — The Square' },
      { tmdbId: 318148,  award: 'Palme d\'Or 2016 — I, Daniel Blake' },
      { tmdbId: 296288,  award: 'Palme d\'Or 2015 — Dheepan' },
      { tmdbId: 244786,  award: 'Palme d\'Or 2014 — Winter Sleep' },
      { tmdbId: 167151,  award: 'Palme d\'Or 2013 — Blue is the Warmest Colour' },
      { tmdbId: 92389,   award: 'Palme d\'Or 2012 — Amour' },
      { tmdbId: 56292,   award: 'Palme d\'Or 2011 — The Tree of Life' },
      { tmdbId: 38734,   award: 'Palme d\'Or 2010 — Uncle Boonmee Who Can Recall His Past Lives' },
      { tmdbId: 37799,   award: 'Palme d\'Or 2009 — The White Ribbon' },
      { tmdbId: 4147,    award: 'Palme d\'Or 2008 — The Class' },
      { tmdbId: 217,     award: 'Palme d\'Or 2003 — Elephant' },
      { tmdbId: 289,     award: 'Palme d\'Or 1994 — Pulp Fiction' },
    ],
  },
  {
    slug: 'emmy-winners',
    name: 'Emmy Award Winners',
    shortName: 'Emmys',
    emoji: '📺',
    description: 'Outstanding Drama and Comedy series winners from the Primetime Emmy Awards — the highest honor in American television.',
    color: 'from-purple-600/20 to-violet-500/20',
    winners: [
      // Outstanding Drama Series
      { tmdbId: 1396,    award: 'Outstanding Drama Series — Breaking Bad' },
      { tmdbId: 1399,    award: 'Outstanding Drama Series — Game of Thrones' },
      { tmdbId: 66732,   award: 'Outstanding Drama Series — Stranger Things' },
      { tmdbId: 63333,   award: 'Outstanding Drama Series — The Crown' },
      { tmdbId: 82856,   award: 'Outstanding Drama Series — The Mandalorian' },
      { tmdbId: 76479,   award: 'Outstanding Drama Series — The Boys' },
      { tmdbId: 92749,   award: 'Outstanding Drama Series — Succession' },
      { tmdbId: 93405,   award: 'Outstanding Drama Series — Squid Game' },
      { tmdbId: 71614,   award: 'Outstanding Limited Series — Chernobyl' },
      // Outstanding Comedy Series
      { tmdbId: 2316,    award: 'Outstanding Comedy Series — The Office' },
      { tmdbId: 1418,    award: 'Outstanding Comedy Series — The Big Bang Theory' },
      { tmdbId: 18347,   award: 'Outstanding Comedy Series — Modern Family' },
      { tmdbId: 60625,   award: 'Outstanding Comedy Series — Ted Lasso' },
      { tmdbId: 95257,   award: 'Outstanding Comedy Series — The Bear' },
    ],
  },
];

export function getAwardBySlug(slug: string): AwardCategory | undefined {
  return awardCategories.find(a => a.slug === slug);
}
