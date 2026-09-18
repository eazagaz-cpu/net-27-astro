/**
 * functions/api/sponsors2.js
 * Cloudflare Pages Function — KV se Trail 2 sponsor links serve karta hai
 *
 * GET /api/sponsors2 → Trail 2 (Gaming Links - Emerald Theme)
 *
 * ⚠️ IMPORTANT: getDefaultSponsors2() ko push-sponsors.mjs ke
 * SPONSORS_RAIL_2 array ke saath HAMESHA sync rakhna hai.
 * ─────────────────────────────────────────────────────────────────────────────
 * Cache: 30 seconds — KV update ke 30s baad sab users ko naya data milega
 */

export async function onRequest(context) {
  const { env } = context;

  try {
    // KV se rail 2 sponsor data fetch karo
    const raw = await env.SPONSORS.get('links2', { type: 'json' });

    // Agar KV mein kuch nahi — hardcoded latest list use karo
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
    // KV binding missing ya error — hardcoded list serve karo
    return new Response(JSON.stringify(getDefaultSponsors2()), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRAIL 2 — Popular Gaming Links (Emerald Theme)
// push-sponsors.mjs ke SPONSORS_RAIL_2 array se SYNC karo jab bhi change ho
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getDefaultSponsors2() {
  return [
    { name: 'pkr365',    label: 'PKR365',     tagline: '💎 Play & Win Big!', url: 'https://gamesapks.com.pk/786ace-game/', image: '/links/pkr365.webp',    badge: '🔥 Hot' },
    { name: 'M666',      label: 'M666 Game',  tagline: '🎮 Play & Win Big!', url: 'http://m666game.net/',                  image: '/links/M666.webp',      badge: '🆕 New' },
    { name: 'M19 game',  label: 'M19 Game',   tagline: '🎯 Bet & Win!',      url: 'https://betapk.com.pk/bet939-game-2/', image: '/links/M19-game.webp',  badge: '💎 Hot' },
    { name: '1ppp game', label: '1PPP Game',  tagline: '🎮 Play & Earn!',    url: 'https://1pppp.com.pk/',                image: '/links/1ppp-game.webp', badge: '🔥 Hot' },
    { name: 'Win786',    label: 'Win786',      tagline: '💰 Win Big Today!',  url: 'https://786win.pk/',                   image: '/links/win786.webp',    badge: '🔥 Hot' },
    { name: '10win',     label: '10win',       tagline: '💎 Play & Win Big!', url: 'https://110win.com.pk/',               image: '/links/10win.webp',     badge: '🆕 New' },
    { name: 'Xx555',     label: 'Xx555',       tagline: '💎 Play & Win Big!', url: 'https://Xx555.com.pk/',                image: '/links/xx555.webp',     badge: '🔥 Hot' },
    { name: '666c',      label: '666C Games',  tagline: '🎯 Play & Win Big!', url: 'https://666cgames.pk',                 image: '/links/666c.webp',      badge: '🔥 Hot' },
  ];
}
