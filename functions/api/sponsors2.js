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
    { name: 'Win786', label: 'Win786', tagline: '🎰 Win Big Today!',  url: 'https://786win.pk/',     image: '/links/win786.webp', badge: '🔥 Hot' },
    { name: '10win',  label: '10win',  tagline: '🎰 Play & Win Big!', url: 'https://110win.com.pk/', image: '/links/10win.webp',  badge: '⭐ New' },
    { name: 'Xx555',  label: 'Xx555',  tagline: '🎰 Play & Win Big!', url: 'https://Xx555.com.pk/', image: '/links/xx555.webp',  badge: '🔥 Hot' },
  ];
}
