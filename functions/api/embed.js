// Proxy embed pages through our domain to inject popup-blocking script.
// Key techniques:
//   1. <base href> — fixes relative HTML asset/API URLs
//   2. window.open frozen — no ad scripts can open popup tabs
//   3. window.location Proxy — fakes hostname/origin so embed domain-checks pass
//   4. window.top/parent masked — prevents top-level navigation

// HTML error page that notifies the parent player via postMessage so it can
// auto-cycle to the next server instead of showing a blank/text error.
function errorPage(msg, status) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#000;color:#888;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif;font-size:14px;text-align:center"><p>${msg}</p><script>try{window.parent.postMessage({event:'error',type:'error',source:'embed-proxy',detail:'${msg}'},'*');}catch(e){}</script></body></html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Frame-Options': 'ALLOWALL' },
  });
}

const ALLOWED = new Set([
  'autoembed.co',
  'vidlink.pro',
  'vidsrc.to',
  'vidsrc.cc',
  '2embed.cc',
  'www.2embed.cc',
  'multiembed.mov',
  'superembed.stream',
  'www.2embed.skin',
  'vsembed.su',
  'vidfast.vc',
  'aether.ist',
  'embed.vidrift.net',
  'vidrift.net',
  'player.vidlove.cc',
  'vidlove.cc',
  'vidnest.fun',
]);

function makeBlocker(hostname) {
  return `<script>(function(){
  // 1. Freeze window.open — no ad tab can ever open
  try{Object.defineProperty(window,'open',{value:function(){return null;},writable:false,configurable:false});}catch(e){window.open=function(){return null;};}
  // 2. Fake window.location so embed domain-checks see their own hostname
  try{
    var _r=window.location,_h=${JSON.stringify(hostname)};
    var _p=new Proxy(_r,{get:function(t,k){
      if(k==='hostname'||k==='host')return _h;
      if(k==='origin')return 'https://'+_h;
      if(k==='href')return 'https://'+_h+t.pathname+t.search+t.hash;
      var v=t[k];return typeof v==='function'?v.bind(t):v;
    }});
    Object.defineProperty(window,'location',{get:function(){return _p;},configurable:true});
  }catch(e){}
  // 3. Mask window.top/parent — iframe cannot navigate parent frame
  try{var s=window.self;Object.defineProperty(window,'top',{get:function(){return s;},configurable:false});}catch(e){}
  try{Object.defineProperty(window,'parent',{get:function(){return window.self;},configurable:false});}catch(e){}
})();</script>`;
}

export async function onRequestGet(context) {
  const url    = new URL(context.request.url);
  const rawUrl = url.searchParams.get('url');

  if (!rawUrl) return errorPage('Missing url', 400);

  let target;
  try { target = new URL(rawUrl); } catch { return errorPage('Invalid url', 400); }

  if (target.protocol !== 'https:' || !ALLOWED.has(target.hostname)) {
    return errorPage('Domain not allowed', 403);
  }

  let upstream;
  try {
    upstream = await fetch(target.href, {
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         'https://www.google.com/',
        'Sec-Fetch-Dest':  'iframe',
        'Sec-Fetch-Mode':  'navigate',
        'Sec-Fetch-Site':  'cross-site',
      },
      redirect: 'follow',
    });
  } catch {
    return errorPage('Server unreachable', 502);
  }

  if (!upstream.ok) return errorPage(`Server error (${upstream.status})`, 502);

  const ct = upstream.headers.get('Content-Type') || '';
  if (!ct.includes('text/html')) {
    // Non-HTML response (redirect to binary etc) — pass through as-is
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'Content-Type': ct, 'Cache-Control': 'no-store' },
    });
  }

  let html = await upstream.text();
  const baseOrigin = `${target.protocol}//${target.hostname}`;
  const blocker    = makeBlocker(target.hostname);

  // Remove any existing <base> tags to avoid conflict
  html = html.replace(/<base[^>]*>/gi, '');

  // Inject base URL + popup blocker right after <head>
  const injection = `<base href="${baseOrigin}/">${blocker}`;
  html = /<head[\s>]/i.test(html)
    ? html.replace(/(<head[^>]*>)/i, '$1' + injection)
    : injection + html;

  return new Response(html, {
    headers: {
      'Content-Type':           'text/html; charset=utf-8',
      'Cache-Control':          'no-store',
      'X-Frame-Options':        'ALLOWALL',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
