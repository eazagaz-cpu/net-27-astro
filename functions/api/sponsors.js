/**
 * functions/api/sponsors.js
 * Cloudflare Pages Function — KV se sponsor links serve karta hai
 * 
 * GET /api/sponsors → returns JSON array of sponsor cards
 * Cache: 30 seconds (instant update ke baad 30s mein sab users ko milega)
 */

export async function onRequest(context) {
  const { env } = context;

  try {
    // KV se sponsor data fetch karo
    const raw = await env.SPONSORS.get('links', { type: 'json' });

    // Agar KV mein kuch nahi — fallback to default
    const sponsors = raw || getDefaultSponsors();

    return new Response(JSON.stringify(sponsors), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // 30 sec cache — update ke 30s baad sab users ko naya data milega
        'Cache-Control': 'public, max-age=30, s-maxage=30',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    // Error pe bhi fallback dega — site kabhi break nahi hogi
    return new Response(JSON.stringify(getDefaultSponsors()), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    });
  }
}

// Default sponsors — KV mein data nahi hone par yeh show honge
function getDefaultSponsors() {
  return [
    { name: 'XD777',    label: 'XD777 Game', tagline: '🎰 Win Big Today!',   url: 'https://apkgamzu.com.pk/x777-game/',      image: '/links/XD777.png',     badge: '🔥 Hot' },
    { name: 'hh98',     label: 'HH98',       tagline: '🎯 Play & Win!',       url: 'https://hh98.pk/',                        image: '/links/HH98.png',      badge: '⭐ New' },
    { name: 'jj77',     label: 'JJ77',       tagline: '🏆 Big Rewards!',      url: 'https://jj77apk.pk/',                     image: '/links/JJ77.png',      badge: '💥 Hot' },
    { name: 'M666',     label: 'M666 Game',  tagline: '🏆 Play & Win Big!',   url: 'http://m666game.net/',                    image: '/links/M666.png',      badge: '⭐ New' },
    { name: 'M19 game', label: 'M19 Game',   tagline: '🎮 Bet & Win!',        url: 'https://betapk.com.pk/bet939-game-2/',   image: '/links/M19-game.png',  badge: '💥 Hot' },
    { name: '1ppp game',label: '1PPP Game',  tagline: '🌟 Play & Earn!',      url: 'https://1pppp.com.pk/',                   image: '/links/1ppp-game.png', badge: '🔥 Hot' },
  ];
}
