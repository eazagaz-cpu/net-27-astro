/**
 * functions/player.js — Cloudflare Pages Function for /player route.
 *
 * This function runs server-side on every request to /player (and /player/).
 * It enforces DMCA/legal takedowns by inspecting query parameters before
 * any player content, embed, or API call is rendered.
 *
 * Cloudflare Pages _redirects does NOT support query-parameter matching,
 * so this function is the correct and only reliable place to enforce this.
 *
 * DMCA DENY LIST — Blocked TMDB IDs:
 *   1477712  — Active Cloudflare 451 mitigation on /player?id=1477712&type=movie
 *
 * To add a new blocked ID: append to DMCA_BLOCKED_IDS below.
 * Do NOT remove existing entries — this is a permanent legal record.
 */

const DMCA_BLOCKED_IDS = new Set(['1469342', '332282', '1204680', '1685882', '1441228', '1471168', '1341138', '1462861', '1444466', '1572116', 
  '1477712', // Active Cloudflare 451 — do not remove
  '969681',  // Spider-Man: Brand New Day — Report afd2de4e15d0c7ae
  '1284465', // The Death of Robin Hood    — Report a37e65dce9a83274
]);

const GONE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Removed — NetMirror</title>
  <style>
    body{background:#0a0a0f;color:#fff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:2rem}
    .wrap{max-width:480px}
    h1{font-size:1.5rem;font-weight:700;margin-bottom:.75rem}
    p{color:rgba(255,255,255,.6);font-size:.9rem;line-height:1.6}
    a{display:inline-block;margin-top:1.5rem;padding:.6rem 1.5rem;background:#e50914;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:.875rem}
    a:hover{background:#c0070f}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Content Not Available</h1>
    <p>This title has been removed and is no longer available on NetMirror.</p>
    <a href="/">Browse Other Titles</a>
  </div>
</body>
</html>`;

const THEATRE_HTML = GONE_HTML
  .replace('<title>Content Removed', '<title>In Theatres')
  .replace('<h1>Content Not Available</h1>', '<h1>Only in theatres for now</h1>')
  .replace('<p>This title has been removed and is no longer available on NetMirror.</p>',
    '<p>This film is still in cinemas and no streaming platform offers it yet. Its page shows the OTT release as soon as one is announced.</p>');

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get('id');
  const type = url.searchParams.get('type');

  // Block denied TMDB IDs regardless of type parameter.
  // The active 451 is for type=movie but we block the ID entirely
  // to prevent re-exposure under a different type parameter.
  if (id && DMCA_BLOCKED_IDS.has(id)) {
    return new Response(GONE_HTML, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  // Films still only in cinemas get no player (src/lib/theatrical.ts); the
  // build publishes their ids. Movie ids only: a TV id can equal a movie id.
  if (id && type !== 'tv' && (await theatreOnlyIds(context)).has(id)) {
    return new Response(THEATRE_HTML, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  // Pass all other requests through to the static player page.
  return context.next();
}

let theatre = { ids: new Set(), at: 0 };

/** The build's theatre-only list, cached per isolate for 10 minutes; empty if unreadable. */
async function theatreOnlyIds(context) {
  if (Date.now() - theatre.at < 600_000) return theatre.ids;
  try {
    const res = await context.env.ASSETS.fetch(new URL('/data/theatre-only.json', context.request.url));
    if (res.ok) theatre = { ids: new Set((await res.json()).ids), at: Date.now() };
  } catch { /* keep the last list */ }
  return theatre.ids;
}
