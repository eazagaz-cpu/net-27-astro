/**
 * functions/api/index-notify.js — Google Indexing API via Cloudflare Worker
 *
 * Notifies Google that specific URLs have been updated, so Googlebot can
 * crawl them faster (typically within hours vs. the normal crawl queue).
 *
 * Setup (one-time):
 *   1. Google Search Console → Settings → Users & permissions → Add Owner
 *   2. Google Cloud Console → Create Service Account
 *   3. Enable "Web Search Indexing API" on the project
 *   4. Create & download a JSON key for the service account
 *   5. base64-encode the JSON:
 *        node -e "console.log(Buffer.from(require('fs').readFileSync('key.json')).toString('base64'))"
 *   6. Add GOOGLE_INDEXING_SA_KEY = <base64 string> to Cloudflare Pages
 *      Environment Variables (Settings → Environment variables)
 *
 * Usage (after deploy):
 *   POST https://net-27.cc/api/index-notify
 *   Content-Type: application/json
 *   { "urls": ["https://net-27.cc/movies/inception/", "https://net-27.cc/"] }
 *
 * Or: GET https://net-27.cc/api/index-notify  (pings homepage only)
 *
 * Quota: 200 URLs/day on free tier. Use sparingly — only for new/updated content.
 */

const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

/**
 * Minimal JWT signing using Web Crypto (available in CF Workers).
 * Signs a Google OAuth2 JWT assertion to exchange for an access token.
 */
async function getAccessToken(serviceAccountJson) {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

  const signingInput = `${encode(header)}.${encode(claim)}`;

  // Import the RSA private key from the service account JSON
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const keyBuffer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${signingInput}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

/**
 * Notify Google Indexing API for a single URL.
 */
async function notifyUrl(url, accessToken) {
  const res = await fetch(INDEXING_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  const body = await res.json();
  return { url, status: res.status, ok: res.ok, body };
}

export async function onRequest(context) {
  const { request, env } = context;

  // Only allow GET and POST
  if (!['GET', 'POST'].includes(request.method)) {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Check for service account key
  const saKeyB64 = env.GOOGLE_INDEXING_SA_KEY;
  if (!saKeyB64) {
    return new Response(
      JSON.stringify({ error: 'GOOGLE_INDEXING_SA_KEY env var not set. See setup instructions in index-notify.js.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Parse URLs to notify
  let urls = ['https://net-27.cc/'];
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (Array.isArray(body.urls) && body.urls.length > 0) {
        urls = body.urls.slice(0, 20); // max 20 per call to stay well within quota
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const saJson = atob(saKeyB64);
    const accessToken = await getAccessToken(saJson);

    const results = await Promise.allSettled(
      urls.map((url) => notifyUrl(url, accessToken)),
    );

    const summary = results.map((r) =>
      r.status === 'fulfilled' ? r.value : { error: r.reason?.message },
    );

    return new Response(JSON.stringify({ notified: summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
