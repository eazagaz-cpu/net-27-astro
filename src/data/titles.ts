export interface Title {
  id: string;
  slug: string;
  type: 'movie' | 'show' | 'anime';
  title: string;
  year: number;
  rating: number;
  runtime: string;
  quality: string;
  ageRating: string;
  genres: string[];
  languages: string[];
  country: string;
  platforms: string[];
  overview: string;
  poster: string;
  backdrop: string;
  cast: { name: string; role: string }[];
  director: string;
  trailerUrl: string;
  isTrending: boolean;
  isLatest: boolean;
  isFeatured: boolean;
  isTop10: boolean;
  popularity: number;
  relatedSlugs: string[];
}

export const titles: Title[] = [
  // ===== MOVIES =====
  {
    id: 'm1', slug: 'the-shawshank-redemption', type: 'movie', title: 'The Shawshank Redemption', year: 1994, rating: 8.7, runtime: '2h 22m', quality: 'HD', ageRating: 'A',
    genres: ['Drama', 'Crime'], languages: ['English'], country: 'USA', platforms: ['Netflix', 'Prime Video'],
    overview: 'A banker convicted of murder forms an unlikely friendship with a fellow inmate as they find solace and eventual redemption through acts of common decency during their years in prison.',
    poster: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', backdrop: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    cast: [{ name: 'Tim Robbins', role: 'Andy Dufresne' }, { name: 'Morgan Freeman', role: 'Red' }, { name: 'Bob Gunton', role: 'Warden Norton' }],
    director: 'Frank Darabont', trailerUrl: '', isTrending: true, isLatest: false, isFeatured: true, isTop10: true, popularity: 98, relatedSlugs: ['inception', 'interstellar'],
  },
  {
    id: 'm2', slug: 'inception', type: 'movie', title: 'Inception', year: 2010, rating: 8.4, runtime: '2h 28m', quality: '4K', ageRating: 'U/A 13+',
    genres: ['Sci-Fi', 'Action', 'Thriller'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Netflix', 'Prime Video', 'JioHotstar'],
    overview: 'A skilled thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.',
    poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', backdrop: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    cast: [{ name: 'Leonardo DiCaprio', role: 'Cobb' }, { name: 'Joseph Gordon-Levitt', role: 'Arthur' }, { name: 'Elliot Page', role: 'Ariadne' }, { name: 'Tom Hardy', role: 'Eames' }],
    director: 'Christopher Nolan', trailerUrl: '', isTrending: true, isLatest: false, isFeatured: true, isTop10: true, popularity: 95, relatedSlugs: ['interstellar', 'the-dark-knight'],
  },
  {
    id: 'm3', slug: 'interstellar', type: 'movie', title: 'Interstellar', year: 2014, rating: 8.7, runtime: '2h 49m', quality: '4K', ageRating: 'U/A 13+',
    genres: ['Sci-Fi', 'Drama', 'Adventure'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Prime Video', 'JioHotstar'],
    overview: 'When Earth becomes uninhabitable, a team of explorers travels through a wormhole near Saturn in search of a new home for humanity, testing the bonds of love and time itself.',
    poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', backdrop: '/xJHokMbljvjADYdit5fK1DVfjko.jpg',
    cast: [{ name: 'Matthew McConaughey', role: 'Cooper' }, { name: 'Anne Hathaway', role: 'Brand' }, { name: 'Jessica Chastain', role: 'Murph' }],
    director: 'Christopher Nolan', trailerUrl: '', isTrending: true, isLatest: false, isFeatured: true, isTop10: true, popularity: 94, relatedSlugs: ['inception', 'oppenheimer'],
  },
  {
    id: 'm4', slug: 'the-dark-knight', type: 'movie', title: 'The Dark Knight', year: 2008, rating: 9.0, runtime: '2h 32m', quality: '4K', ageRating: 'U/A 13+',
    genres: ['Action', 'Crime', 'Drama'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Netflix', 'Prime Video', 'JioHotstar'],
    overview: 'When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest tests to fight injustice and protect the city he loves.',
    poster: '/qJ2tW6WMUDux911jawTk2LKGQAG.jpg', backdrop: '/nMKdUUepR0i5zn0y1T4CsSB5ew.jpg',
    cast: [{ name: 'Christian Bale', role: 'Bruce Wayne' }, { name: 'Heath Ledger', role: 'Joker' }, { name: 'Aaron Eckhart', role: 'Harvey Dent' }],
    director: 'Christopher Nolan', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: true, popularity: 96, relatedSlugs: ['inception', 'joker'],
  },
  {
    id: 'm5', slug: 'oppenheimer', type: 'movie', title: 'Oppenheimer', year: 2023, rating: 8.3, runtime: '3h 00m', quality: '4K', ageRating: 'A',
    genres: ['Drama', 'History', 'Biography'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Prime Video', 'JioHotstar'],
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral complexities of scientific achievement.',
    poster: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    cast: [{ name: 'Cillian Murphy', role: 'Oppenheimer' }, { name: 'Emily Blunt', role: 'Kitty' }, { name: 'Robert Downey Jr.', role: 'Strauss' }],
    director: 'Christopher Nolan', trailerUrl: '', isTrending: true, isLatest: true, isFeatured: false, isTop10: true, popularity: 92, relatedSlugs: ['interstellar', 'inception'],
  },
  {
    id: 'm6', slug: 'dune-part-two', type: 'movie', title: 'Dune: Part Two', year: 2024, rating: 8.5, runtime: '2h 46m', quality: '4K', ageRating: 'U/A 13+',
    genres: ['Sci-Fi', 'Adventure', 'Drama'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Prime Video', 'JioHotstar'],
    overview: 'Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family while trying to prevent a terrible future only he can foresee on the desert planet Arrakis.',
    poster: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', backdrop: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    cast: [{ name: 'Timothée Chalamet', role: 'Paul Atreides' }, { name: 'Zendaya', role: 'Chani' }, { name: 'Austin Butler', role: 'Feyd-Rautha' }],
    director: 'Denis Villeneuve', trailerUrl: '', isTrending: true, isLatest: true, isFeatured: true, isTop10: true, popularity: 91, relatedSlugs: ['interstellar', 'oppenheimer'],
  },
  {
    id: 'm7', slug: 'john-wick-4', type: 'movie', title: 'John Wick: Chapter 4', year: 2023, rating: 7.7, runtime: '2h 49m', quality: '4K', ageRating: 'A',
    genres: ['Action', 'Thriller', 'Crime'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Prime Video', 'Netflix'],
    overview: 'John Wick uncovers a path to defeating The High Table, but before he can earn his freedom he must face a new enemy with powerful alliances across the globe.',
    poster: '/vZloFAK7NmvMGKE7Q2yGRq0QALY.jpg', backdrop: '/7I6VUdPj6tQECNHdviJkUHD2u89.jpg',
    cast: [{ name: 'Keanu Reeves', role: 'John Wick' }, { name: 'Donnie Yen', role: 'Caine' }, { name: 'Bill Skarsgård', role: 'Marquis' }],
    director: 'Chad Stahelski', trailerUrl: '', isTrending: false, isLatest: true, isFeatured: false, isTop10: true, popularity: 88, relatedSlugs: ['the-dark-knight', 'spider-man-no-way-home'],
  },
  {
    id: 'm8', slug: 'deepwater-horizon', type: 'movie', title: 'Deepwater Horizon', year: 2016, rating: 6.9, runtime: '1h 47m', quality: 'HD', ageRating: 'U/A 13+',
    genres: ['Action', 'Drama', 'Thriller'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Netflix', 'Prime Video'],
    overview: 'A dramatization of the 2010 Deepwater Horizon oil rig disaster in the Gulf of Mexico, following the workers who faced one of the worst industrial catastrophes in history.',
    poster: '/kBMqMXHMjcBhHlOjL3YoOMHdJtG.jpg', backdrop: '/hqMc08mhcaGOG7PL2EbbhGzP1r5.jpg',
    cast: [{ name: 'Mark Wahlberg', role: 'Mike Williams' }, { name: 'Kurt Russell', role: 'Jimmy Harrell' }, { name: 'John Malkovich', role: 'Vidrine' }],
    director: 'Peter Berg', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: true, isTop10: false, popularity: 72, relatedSlugs: ['the-shawshank-redemption', 'interstellar'],
  },
  {
    id: 'm9', slug: 'pushpa-the-rise', type: 'movie', title: 'Pushpa: The Rise', year: 2021, rating: 7.6, runtime: '2h 59m', quality: 'FHD', ageRating: 'U/A 16+',
    genres: ['Action', 'Drama', 'Thriller'], languages: ['Telugu', 'Hindi', 'Tamil'], country: 'India', platforms: ['Prime Video', 'JioHotstar'],
    overview: 'A laborer rises through the ranks of a red sandalwood smuggling syndicate, earning the name Pushpa Raj, while facing off against a ruthless police officer determined to bring him down.',
    poster: '/bwoEpYQ4a7N22Op4DCwWL2QFhYT.jpg', backdrop: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',
    cast: [{ name: 'Allu Arjun', role: 'Pushpa Raj' }, { name: 'Rashmika Mandanna', role: 'Srivalli' }, { name: 'Fahadh Faasil', role: 'SP Bhanwar Singh' }],
    director: 'Sukumar', trailerUrl: '', isTrending: true, isLatest: false, isFeatured: false, isTop10: true, popularity: 85, relatedSlugs: ['jai-bhim', 'train-to-busan'],
  },
  {
    id: 'm10', slug: 'train-to-busan', type: 'movie', title: 'Train to Busan', year: 2016, rating: 7.6, runtime: '1h 58m', quality: 'FHD', ageRating: 'A',
    genres: ['Action', 'Horror', 'Thriller'], languages: ['Korean'], country: 'South Korea', platforms: ['Netflix', 'Prime Video'],
    overview: 'While traveling to Busan, passengers on a high-speed train must fight for survival after a zombie outbreak spreads rapidly through the cars, testing the limits of human compassion.',
    poster: '/2Hfnhbo9NLx7YyIQGuGAWnAJFjL.jpg', backdrop: '/pZTxKOx23LBMl1HOUQBEmx9IQj.jpg',
    cast: [{ name: 'Gong Yoo', role: 'Seok-woo' }, { name: 'Ma Dong-seok', role: 'Sang-hwa' }, { name: 'Jung Yu-mi', role: 'Seong-kyeong' }],
    director: 'Yeon Sang-ho', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 78, relatedSlugs: ['parasite', 'pushpa-the-rise'],
  },
  {
    id: 'm11', slug: 'parasite', type: 'movie', title: 'Parasite', year: 2019, rating: 8.5, runtime: '2h 12m', quality: '4K', ageRating: 'A',
    genres: ['Thriller', 'Drama', 'Comedy'], languages: ['Korean'], country: 'South Korea', platforms: ['Prime Video', 'JioHotstar'],
    overview: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan in this masterful social thriller.',
    poster: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', backdrop: '/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    cast: [{ name: 'Song Kang-ho', role: 'Kim Ki-taek' }, { name: 'Lee Sun-kyun', role: 'Park Dong-ik' }, { name: 'Cho Yeo-jeong', role: 'Choi Yeon-gyo' }],
    director: 'Bong Joon-ho', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: true, popularity: 90, relatedSlugs: ['train-to-busan', 'joker'],
  },
  {
    id: 'm12', slug: 'spider-man-no-way-home', type: 'movie', title: 'Spider-Man: No Way Home', year: 2021, rating: 8.2, runtime: '2h 28m', quality: '4K', ageRating: 'U/A 13+',
    genres: ['Action', 'Adventure', 'Sci-Fi'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Netflix', 'Disney+'],
    overview: 'When Spider-Man\'s identity is revealed, he turns to Doctor Strange for help. When a spell goes wrong, dangerous foes from other universes start to appear, forcing Peter to discover what being Spider-Man truly means.',
    poster: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', backdrop: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    cast: [{ name: 'Tom Holland', role: 'Peter Parker' }, { name: 'Zendaya', role: 'MJ' }, { name: 'Benedict Cumberbatch', role: 'Doctor Strange' }],
    director: 'Jon Watts', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 89, relatedSlugs: ['avengers-endgame', 'the-dark-knight'],
  },
  {
    id: 'm13', slug: 'avengers-endgame', type: 'movie', title: 'Avengers: Endgame', year: 2019, rating: 8.4, runtime: '3h 01m', quality: '4K', ageRating: 'U/A 13+',
    genres: ['Action', 'Adventure', 'Sci-Fi'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Disney+', 'JioHotstar'],
    overview: 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos\' actions and restore balance to the universe in this epic conclusion.',
    poster: '/or06FN3Dka5tukK1e9NKIA2ky.jpg', backdrop: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d.jpg',
    cast: [{ name: 'Robert Downey Jr.', role: 'Tony Stark' }, { name: 'Chris Evans', role: 'Steve Rogers' }, { name: 'Scarlett Johansson', role: 'Natasha' }],
    director: 'Anthony Russo', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 93, relatedSlugs: ['spider-man-no-way-home', 'the-dark-knight'],
  },
  {
    id: 'm14', slug: 'joker', type: 'movie', title: 'Joker', year: 2019, rating: 8.4, runtime: '2h 02m', quality: '4K', ageRating: 'A',
    genres: ['Crime', 'Drama', 'Thriller'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Netflix', 'Prime Video'],
    overview: 'A struggling comedian in Gotham City is disregarded and mistreated by society. His slow descent into madness leads him to become the criminal mastermind known as the Joker.',
    poster: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', backdrop: '/n6bUvigpRFqSwmPp1m2YMDm2eTQ.jpg',
    cast: [{ name: 'Joaquin Phoenix', role: 'Arthur Fleck' }, { name: 'Robert De Niro', role: 'Murray Franklin' }, { name: 'Zazie Beetz', role: 'Sophie' }],
    director: 'Todd Phillips', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 87, relatedSlugs: ['the-dark-knight', 'parasite'],
  },
  {
    id: 'm15', slug: 'jai-bhim', type: 'movie', title: 'Jai Bhim', year: 2021, rating: 8.7, runtime: '2h 44m', quality: 'FHD', ageRating: 'U/A 16+',
    genres: ['Drama', 'Crime'], languages: ['Tamil', 'Hindi', 'Telugu'], country: 'India', platforms: ['Prime Video'],
    overview: 'A tribal man is arrested and goes missing from police custody. His wife seeks help from a lawyer to find her missing husband and bring the corrupt officers to justice.',
    poster: '/nnXpRnZkaIIVcbbYSDRfxlmyAy.jpg', backdrop: '/tN7NlFJvVg2k5qp31viApnL99QK.jpg',
    cast: [{ name: 'Suriya', role: 'Chandru' }, { name: 'Lijomol Jose', role: 'Sengeni' }, { name: 'Manikandan', role: 'Rajakannu' }],
    director: 'T.J. Gnanavel', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 82, relatedSlugs: ['pushpa-the-rise', 'parasite'],
  },

  // ===== TV SHOWS =====
  {
    id: 's1', slug: 'breaking-bad', type: 'show', title: 'Breaking Bad', year: 2008, rating: 9.5, runtime: '49m per ep', quality: '4K', ageRating: 'A',
    genres: ['Crime', 'Drama', 'Thriller'], languages: ['English'], country: 'USA', platforms: ['Netflix'],
    overview: 'A high school chemistry teacher diagnosed with terminal cancer partners with a former student to manufacture methamphetamine to secure his family\'s financial future.',
    poster: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', backdrop: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    cast: [{ name: 'Bryan Cranston', role: 'Walter White' }, { name: 'Aaron Paul', role: 'Jesse Pinkman' }, { name: 'Anna Gunn', role: 'Skyler White' }],
    director: 'Vince Gilligan', trailerUrl: '', isTrending: true, isLatest: false, isFeatured: false, isTop10: true, popularity: 97, relatedSlugs: ['stranger-things', 'narcos'],
  },
  {
    id: 's2', slug: 'stranger-things', type: 'show', title: 'Stranger Things', year: 2016, rating: 8.7, runtime: '51m per ep', quality: '4K', ageRating: 'U/A 13+',
    genres: ['Sci-Fi', 'Drama', 'Horror'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Netflix'],
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one very strange little girl with extraordinary powers.',
    poster: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', backdrop: '/56v2KjBlYlypkSIAt7piCRVkOXA.jpg',
    cast: [{ name: 'Millie Bobby Brown', role: 'Eleven' }, { name: 'Finn Wolfhard', role: 'Mike' }, { name: 'Winona Ryder', role: 'Joyce' }],
    director: 'Duffer Brothers', trailerUrl: '', isTrending: true, isLatest: false, isFeatured: false, isTop10: false, popularity: 93, relatedSlugs: ['breaking-bad', 'wednesday'],
  },
  {
    id: 's3', slug: 'game-of-thrones', type: 'show', title: 'Game of Thrones', year: 2011, rating: 9.2, runtime: '57m per ep', quality: '4K', ageRating: 'A',
    genres: ['Fantasy', 'Drama', 'Adventure'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['JioHotstar', 'HBO Max'],
    overview: 'Nine noble families fight for control over the mythical lands of Westeros, while an ancient enemy returns after being dormant for millennia to threaten all living things.',
    poster: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', backdrop: '/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
    cast: [{ name: 'Emilia Clarke', role: 'Daenerys' }, { name: 'Kit Harington', role: 'Jon Snow' }, { name: 'Peter Dinklage', role: 'Tyrion' }],
    director: 'David Benioff', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 95, relatedSlugs: ['the-boys', 'stranger-things'],
  },
  {
    id: 's4', slug: 'squid-game', type: 'show', title: 'Squid Game', year: 2021, rating: 7.8, runtime: '54m per ep', quality: '4K', ageRating: 'A',
    genres: ['Drama', 'Thriller', 'Mystery'], languages: ['Korean', 'English'], country: 'South Korea', platforms: ['Netflix'],
    overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games for a tempting cash prize, only to discover that the stakes are deadly.',
    poster: '/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', backdrop: '/oVr0pTLmKYq9MMR2PXC6GEYuUqH.jpg',
    cast: [{ name: 'Lee Jung-jae', role: 'Seong Gi-hun' }, { name: 'Park Hae-soo', role: 'Cho Sang-woo' }, { name: 'Wi Ha-joon', role: 'Hwang Jun-ho' }],
    director: 'Hwang Dong-hyuk', trailerUrl: '', isTrending: true, isLatest: true, isFeatured: false, isTop10: true, popularity: 90, relatedSlugs: ['money-heist', 'the-boys'],
  },
  {
    id: 's5', slug: 'the-boys', type: 'show', title: 'The Boys', year: 2019, rating: 8.7, runtime: '60m per ep', quality: '4K', ageRating: 'A',
    genres: ['Action', 'Comedy', 'Sci-Fi'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Prime Video'],
    overview: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers, exposing the dark truth behind the world\'s most celebrated heroes.',
    poster: '/stTEycfG9928HYGEISBFaG1ngjM.jpg', backdrop: '/7UPFfBYBR0l2V49OXHNI9qFP3Vy.jpg',
    cast: [{ name: 'Karl Urban', role: 'Billy Butcher' }, { name: 'Jack Quaid', role: 'Hughie' }, { name: 'Antony Starr', role: 'Homelander' }],
    director: 'Eric Kripke', trailerUrl: '', isTrending: true, isLatest: true, isFeatured: false, isTop10: false, popularity: 88, relatedSlugs: ['breaking-bad', 'squid-game'],
  },
  {
    id: 's6', slug: 'wednesday', type: 'show', title: 'Wednesday', year: 2022, rating: 8.1, runtime: '46m per ep', quality: '4K', ageRating: 'U/A 13+',
    genres: ['Comedy', 'Mystery', 'Fantasy'], languages: ['English', 'Hindi'], country: 'USA', platforms: ['Netflix'],
    overview: 'Wednesday Addams investigates a series of murders at Nevermore Academy while navigating new relationships and mastering her emerging psychic ability.',
    poster: '/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', backdrop: '/iHSwvRVsNBfc0HRDlMQKzXrl8h.jpg',
    cast: [{ name: 'Jenna Ortega', role: 'Wednesday Addams' }, { name: 'Gwendoline Christie', role: 'Principal Weems' }, { name: 'Catherine Zeta-Jones', role: 'Morticia' }],
    director: 'Tim Burton', trailerUrl: '', isTrending: false, isLatest: true, isFeatured: false, isTop10: false, popularity: 86, relatedSlugs: ['stranger-things', 'squid-game'],
  },
  {
    id: 's7', slug: 'money-heist', type: 'show', title: 'Money Heist', year: 2017, rating: 8.2, runtime: '50m per ep', quality: 'FHD', ageRating: 'U/A 16+',
    genres: ['Crime', 'Drama', 'Thriller'], languages: ['Spanish', 'English', 'Hindi'], country: 'Spain', platforms: ['Netflix'],
    overview: 'A criminal mastermind known as "The Professor" recruits eight people to carry out the biggest heist in recorded history — printing billions from the Royal Mint of Spain.',
    poster: '/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg', backdrop: '/xGrTm55V4PnSjJKaQYMd2nitmno.jpg',
    cast: [{ name: 'Álvaro Morte', role: 'The Professor' }, { name: 'Úrsula Corberó', role: 'Tokyo' }, { name: 'Itziar Ituño', role: 'Raquel' }],
    director: 'Álex Pina', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 84, relatedSlugs: ['narcos', 'squid-game'],
  },
  {
    id: 's8', slug: 'narcos', type: 'show', title: 'Narcos', year: 2015, rating: 8.8, runtime: '49m per ep', quality: 'FHD', ageRating: 'A',
    genres: ['Crime', 'Drama', 'Biography'], languages: ['Spanish', 'English'], country: 'USA', platforms: ['Netflix'],
    overview: 'A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar, and the DEA agents who pursued him across borders in one of the greatest manhunts in history.',
    poster: '/rTmal9fDbwh5F0waol2hq35U4ah.jpg', backdrop: '/g7YhfGxCWnNF3bNotVY4AcLnSVE.jpg',
    cast: [{ name: 'Wagner Moura', role: 'Pablo Escobar' }, { name: 'Boyd Holbrook', role: 'Steve Murphy' }, { name: 'Pedro Pascal', role: 'Javier Peña' }],
    director: 'Chris Brancato', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 83, relatedSlugs: ['breaking-bad', 'money-heist'],
  },

  // ===== ANIME =====
  {
    id: 'a1', slug: 'attack-on-titan', type: 'anime', title: 'Attack on Titan', year: 2013, rating: 9.0, runtime: '24m per ep', quality: '4K', ageRating: 'U/A 16+',
    genres: ['Action', 'Fantasy', 'Drama'], languages: ['Japanese', 'English'], country: 'Japan', platforms: ['Crunchyroll', 'Netflix', 'Prime Video'],
    overview: 'Humanity lives inside cities surrounded by enormous walls to protect them from Titans, gigantic humanoid creatures. When a colossal Titan breaches the wall, young Eren Yeager vows to destroy every last Titan.',
    poster: '/hTP1DtLGFamjfu8WqjnuQdP1n0.jpg', backdrop: '/sHfloBOvHGxOQusDSpO2pCIHzM.jpg',
    cast: [{ name: 'Yuki Kaji', role: 'Eren Yeager' }, { name: 'Yui Ishikawa', role: 'Mikasa' }, { name: 'Marina Inoue', role: 'Armin' }],
    director: 'Tetsurō Araki', trailerUrl: '', isTrending: true, isLatest: false, isFeatured: false, isTop10: true, popularity: 94, relatedSlugs: ['demon-slayer', 'jujutsu-kaisen'],
  },
  {
    id: 'a2', slug: 'demon-slayer', type: 'anime', title: 'Demon Slayer', year: 2019, rating: 8.6, runtime: '24m per ep', quality: '4K', ageRating: 'U/A 16+',
    genres: ['Action', 'Fantasy', 'Adventure'], languages: ['Japanese', 'English', 'Hindi'], country: 'Japan', platforms: ['Crunchyroll', 'Netflix'],
    overview: 'A young boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon. He embarks on a journey to find a cure and avenge his family.',
    poster: '/wrCwH6WOvXQvVuqBV0agmRIWQrF.jpg', backdrop: '/4MEhU3pRRuZ3bm7cqZYJBnXKlZN.jpg',
    cast: [{ name: 'Natsuki Hanae', role: 'Tanjiro' }, { name: 'Akari Kitō', role: 'Nezuko' }, { name: 'Hiro Shimono', role: 'Zenitsu' }],
    director: 'Haruo Sotozaki', trailerUrl: '', isTrending: true, isLatest: true, isFeatured: false, isTop10: true, popularity: 91, relatedSlugs: ['attack-on-titan', 'jujutsu-kaisen'],
  },
  {
    id: 'a3', slug: 'one-piece', type: 'anime', title: 'One Piece', year: 1999, rating: 8.7, runtime: '24m per ep', quality: 'FHD', ageRating: 'U/A 13+',
    genres: ['Action', 'Adventure', 'Comedy'], languages: ['Japanese', 'English'], country: 'Japan', platforms: ['Crunchyroll', 'Netflix'],
    overview: 'Monkey D. Luffy and his pirate crew explore the Grand Line in search of the ultimate treasure known as "One Piece" to become the next Pirate King.',
    poster: '/cMD9Ygz11zjJzAovURpO75Qg7rT.jpg', backdrop: '/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg',
    cast: [{ name: 'Mayumi Tanaka', role: 'Luffy' }, { name: 'Kazuya Nakai', role: 'Zoro' }, { name: 'Akemi Okamura', role: 'Nami' }],
    director: 'Eiichiro Oda', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 88, relatedSlugs: ['demon-slayer', 'naruto'],
  },
  {
    id: 'a4', slug: 'jujutsu-kaisen', type: 'anime', title: 'Jujutsu Kaisen', year: 2020, rating: 8.6, runtime: '24m per ep', quality: '4K', ageRating: 'U/A 16+',
    genres: ['Action', 'Fantasy', 'Horror'], languages: ['Japanese', 'English', 'Hindi'], country: 'Japan', platforms: ['Crunchyroll', 'Prime Video'],
    overview: 'A boy swallows a cursed talisman and becomes host to a powerful demon. He enrolls in a school for sorcerers to find and consume the rest of the demon\'s fingers.',
    poster: '/hFWP5HkbVEe40hrXbghBMRTy6mL.jpg', backdrop: '/sI2gMk6vFYMiakYQjRXjsQkBxa3.jpg',
    cast: [{ name: 'Junya Enoki', role: 'Yuji Itadori' }, { name: 'Yūichi Nakamura', role: 'Gojo Satoru' }, { name: 'Asami Seto', role: 'Nobara' }],
    director: 'Sunghoo Park', trailerUrl: '', isTrending: true, isLatest: true, isFeatured: false, isTop10: false, popularity: 89, relatedSlugs: ['demon-slayer', 'attack-on-titan'],
  },
  {
    id: 'a5', slug: 'spy-x-family', type: 'anime', title: 'SPY x FAMILY', year: 2022, rating: 8.5, runtime: '24m per ep', quality: '4K', ageRating: 'U/A 7+',
    genres: ['Action', 'Comedy', 'Family'], languages: ['Japanese', 'English'], country: 'Japan', platforms: ['Crunchyroll', 'Netflix'],
    overview: 'A spy must build a fake family to execute a mission, not realizing that the girl he adopts is a telepath and the woman he marries is an assassin.',
    poster: '/3r4LYFnRKBixIeBOoS9eSGEpNmW.jpg', backdrop: '/qPT2qVLwzRhYEqjRhJFZPBKRbQO.jpg',
    cast: [{ name: 'Takuya Eguchi', role: 'Loid Forger' }, { name: 'Atsumi Tanezaki', role: 'Anya' }, { name: 'Saori Hayami', role: 'Yor' }],
    director: 'Kazuhiro Furuhashi', trailerUrl: '', isTrending: false, isLatest: true, isFeatured: false, isTop10: false, popularity: 85, relatedSlugs: ['jujutsu-kaisen', 'one-piece'],
  },
  {
    id: 'a6', slug: 'death-note', type: 'anime', title: 'Death Note', year: 2006, rating: 9.0, runtime: '22m per ep', quality: 'HD', ageRating: 'U/A 16+',
    genres: ['Thriller', 'Mystery', 'Drama'], languages: ['Japanese', 'English'], country: 'Japan', platforms: ['Netflix', 'Crunchyroll'],
    overview: 'A high school genius discovers a supernatural notebook that kills anyone whose name is written in it. He decides to use it to rid the world of criminals, sparking a battle of wits with a brilliant detective.',
    poster: '/iigTJJMCMWxNRoC1KOOmj1rGJiL.jpg', backdrop: '/ai24Ks6tE4IdxXMpkMCwGFJBFNY.jpg',
    cast: [{ name: 'Mamoru Miyano', role: 'Light Yagami' }, { name: 'Kappei Yamaguchi', role: 'L' }, { name: 'Aya Hirano', role: 'Misa' }],
    director: 'Tetsurō Araki', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 92, relatedSlugs: ['attack-on-titan', 'jujutsu-kaisen'],
  },
  {
    id: 'a7', slug: 'naruto', type: 'anime', title: 'Naruto', year: 2002, rating: 8.4, runtime: '23m per ep', quality: 'HD', ageRating: 'U/A 13+',
    genres: ['Action', 'Adventure', 'Fantasy'], languages: ['Japanese', 'English', 'Hindi'], country: 'Japan', platforms: ['Crunchyroll', 'Netflix', 'Prime Video'],
    overview: 'A young ninja who carries a powerful fox spirit inside him dreams of becoming the leader of his village. Through hard work and bonds of friendship, he pursues his path to becoming Hokage.',
    poster: '/vauCEnR4CnEPMbyMOJhYEAgO1IW.jpg', backdrop: '/i5aEm3KsFcKB3zbbGn8FaKEzYGJ.jpg',
    cast: [{ name: 'Junko Takeuchi', role: 'Naruto' }, { name: 'Noriaki Sugiyama', role: 'Sasuke' }, { name: 'Chie Nakamura', role: 'Sakura' }],
    director: 'Hayato Date', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 87, relatedSlugs: ['one-piece', 'demon-slayer'],
  },
  {
    id: 'a8', slug: 'hunter-x-hunter', type: 'anime', title: 'Hunter x Hunter', year: 2011, rating: 9.1, runtime: '23m per ep', quality: 'FHD', ageRating: 'U/A 13+',
    genres: ['Action', 'Adventure', 'Fantasy'], languages: ['Japanese', 'English'], country: 'Japan', platforms: ['Crunchyroll', 'Netflix'],
    overview: 'A young boy embarks on a quest to find his father, a world-renowned Hunter, by becoming a Hunter himself and exploring a dangerous world filled with creatures and criminals.',
    poster: '/ysBRMCjFR8GEEytJroICimqBOEh.jpg', backdrop: '/dgy2WcAfEfOBkBnXflrv2t0PkIE.jpg',
    cast: [{ name: 'Megumi Han', role: 'Gon' }, { name: 'Mariya Ise', role: 'Killua' }, { name: 'Daisuke Namikawa', role: 'Hisoka' }],
    director: 'Hiroshi Kōjina', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 86, relatedSlugs: ['naruto', 'one-piece'],
  },
  {
    id: 'a9', slug: 'bleach', type: 'anime', title: 'Bleach', year: 2004, rating: 8.2, runtime: '24m per ep', quality: 'FHD', ageRating: 'U/A 13+',
    genres: ['Action', 'Adventure', 'Fantasy'], languages: ['Japanese', 'English'], country: 'Japan', platforms: ['Crunchyroll', 'Disney+'],
    overview: 'A teenager who can see ghosts obtains the power of a Soul Reaper and is drawn into a world of spiritual beings, deadly hollows, and ancient conspiracies.',
    poster: '/2EewmxXe72ogr0hLlCnD6GVnNyn.jpg', backdrop: '/vVnyGTD2AELJasmZxpXnhRP70ZR.jpg',
    cast: [{ name: 'Masakazu Morita', role: 'Ichigo' }, { name: 'Fumiko Orikasa', role: 'Rukia' }, { name: 'Noriaki Sugiyama', role: 'Uryū' }],
    director: 'Noriyuki Abe', trailerUrl: '', isTrending: false, isLatest: true, isFeatured: false, isTop10: false, popularity: 80, relatedSlugs: ['naruto', 'hunter-x-hunter'],
  },
  {
    id: 'a10', slug: 'sword-art-online', type: 'anime', title: 'Sword Art Online', year: 2012, rating: 7.5, runtime: '23m per ep', quality: 'FHD', ageRating: 'U/A 13+',
    genres: ['Action', 'Adventure', 'Romance'], languages: ['Japanese', 'English'], country: 'Japan', platforms: ['Crunchyroll', 'Netflix'],
    overview: 'Players are trapped in a virtual reality MMORPG where death in the game means death in real life. Kirito must fight his way through 100 floors to free everyone.',
    poster: '/dzDACEfr0MNH1JUbzAWXzVYnOGJ.jpg', backdrop: '/3kUxJ25kVHF3ItJyacPxXrfCBHF.jpg',
    cast: [{ name: 'Yoshitsugu Matsuoka', role: 'Kirito' }, { name: 'Haruka Tomatsu', role: 'Asuna' }, { name: 'Ayana Taketatsu', role: 'Leafa' }],
    director: 'Tomohiko Itō', trailerUrl: '', isTrending: false, isLatest: false, isFeatured: false, isTop10: false, popularity: 75, relatedSlugs: ['attack-on-titan', 'death-note'],
  },
];

// ===== HELPER FUNCTIONS =====

export function getTitleBySlug(slug: string): Title | undefined {
  return titles.find(t => t.slug === slug);
}

export function getByType(type: string): Title[] {
  return titles.filter(t => t.type === type).sort((a, b) => b.popularity - a.popularity);
}

export function getByGenre(genre: string): Title[] {
  return titles.filter(t => t.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
}

export function getByPlatform(platform: string): Title[] {
  return titles.filter(t => t.platforms.some(p => p.toLowerCase() === platform.toLowerCase()));
}

export function getByLanguage(lang: string): Title[] {
  return titles.filter(t => t.languages.some(l => l.toLowerCase() === lang.toLowerCase()));
}

export function getTrending(): Title[] {
  return titles.filter(t => t.isTrending).sort((a, b) => b.popularity - a.popularity);
}

export function getLatest(): Title[] {
  return titles.filter(t => t.isLatest).sort((a, b) => b.year - a.year);
}

export function getFeatured(): Title[] {
  return titles.filter(t => t.isFeatured).sort((a, b) => b.popularity - a.popularity);
}

export function getTop10(): Title[] {
  return titles.filter(t => t.isTop10).sort((a, b) => b.rating - a.rating).slice(0, 10);
}

export function getRelated(title: Title): Title[] {
  return title.relatedSlugs.map(s => titles.find(t => t.slug === s)).filter((t): t is Title => t !== undefined);
}

export function searchTitles(q: string): Title[] {
  const query = q.toLowerCase();
  return titles.filter(t =>
    t.title.toLowerCase().includes(query) ||
    t.genres.some(g => g.toLowerCase().includes(query)) ||
    t.director.toLowerCase().includes(query) ||
    t.cast.some(c => c.name.toLowerCase().includes(query)) ||
    t.platforms.some(p => p.toLowerCase().includes(query)) ||
    t.languages.some(l => l.toLowerCase().includes(query))
  );
}

export const allGenres = [...new Set(titles.flatMap(t => t.genres))].sort();
export const allLanguages = [...new Set(titles.flatMap(t => t.languages))].sort();
export const allYears = [...new Set(titles.map(t => t.year))].sort((a, b) => b - a);

export const allPlatforms = [
  { slug: 'netflix', name: 'Netflix' },
  { slug: 'prime-video', name: 'Prime Video' },
  { slug: 'jiohotstar', name: 'JioHotstar' },
  { slug: 'sonyliv', name: 'SonyLIV' },
  { slug: 'crunchyroll', name: 'Crunchyroll' },
  { slug: 'disney-plus', name: 'Disney+' },
  { slug: 'hbo-max', name: 'HBO Max' },
  { slug: 'apple-tv-plus', name: 'Apple TV+' },
  { slug: 'mx-player', name: 'MX Player' },
  { slug: 'kids', name: 'Kids' },
];
