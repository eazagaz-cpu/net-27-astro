export async function onRequestGet(context) {
  const country = context.request.headers.get('CF-IPCountry') || 'US';
  return new Response(JSON.stringify({ country }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
