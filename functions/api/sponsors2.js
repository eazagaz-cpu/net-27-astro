/**
 * functions/api/sponsors2.js
 * Cloudflare Pages Function — KV se Trail 2 (Secondary Earning Games) sponsor links serve karta hai
 * 
 * GET /api/sponsors2 → returns JSON array of sponsor cards for Rail 2
 * Cache: 30 seconds
 */

export async function onRequest(context) {
  const { env } = context;

  try {
    // KV se rail 2 sponsor data fetch karo
    const raw = await env.SPONSORS.get('links2', { type: 'json' });

    // Agar KV mein kuch nahi — fallback to default
    const sponsors = raw || getDefaultSponsors2();

    return new Response(JSON.stringify(sponsors), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, s-maxage=30',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify(getDefaultSponsors2()), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    });
  }
}

// Default sponsors for Trail 2
function getDefaultSponsors2() {
  return [
    { name: 'pkr365',    label: 'PKR365',    tagline: 'Play & Win Big!', url: 'https://gamesapks.com.pk/786ace-game/', image: '/links/pkr365.webp',    badge: '🔥 Hot' },
    { name: 'm666',     label: 'M666 Game', tagline: 'Play & Win Big!', url: 'http://m666game.net/',                  image: '/links/M666.webp',      badge: '🆕 New' },
    { name: 'm19-game', label: 'M19 Game',  tagline: 'Bet & Win!',      url: 'https://betapk.com.pk/bet939-game-2/', image: '/links/M19-game.webp',  badge: '💎 Hot' },
    { name: '1ppp-game',label: '1PPP Game', tagline: 'Play & Earn!',    url: 'https://1pppp.com.pk/',                image: '/links/1ppp-game.webp', badge: '🔥 Hot' },
    { name: 'win786',   label: 'Win786',    tagline: 'Win Big Today!',  url: 'https://786win.pk/',                   image: '/links/win786.webp',    badge: '🔥 Hot' },
    { name: '10win',    label: '10win',     tagline: 'Play & Win Big!', url: 'https://110win.com.pk/',               image: '/links/10win.webp',     badge: '🆕 New' },
    { name: 'xx555',    label: 'Xx555',     tagline: 'Play & Win Big!', url: 'https://Xx555.com.pk/',                image: '/links/xx555.webp',     badge: '🔥 Hot' },
  ];
}
