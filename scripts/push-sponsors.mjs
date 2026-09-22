/**
 * scripts/push-sponsors.mjs
 * ═══════════════════════════════════════════════════════
 * INSTANT SPONSOR UPDATE — No build, no GitHub, no wait!
 * KV mein data push karo → 5-30 seconds mein live!
 * ═══════════════════════════════════════════════════════
 *
 * Usage:
 *   npm run sponsors:push
 *
 * Nayi link add karni ho:
 *   1. Neeche SPONSORS array mein add karo
 *   2. Image /public/links/ mein dalo
 *   3. npm run sponsors:push chalao
 *   4. 5-30 seconds mein live! ✅
 */

// ═══════════════════════════════════════════════════════
// ✏️  YAHAN SPONSORS EDIT KARO — Sequence wise
// ═══════════════════════════════════════════════════════
const SPONSORS = [
  // #1 — 12th Class Result Check (TOP)
  {
    name: '12th-class-result-check',
    label: '12th Class Result Check',
    tagline: '📢 Check Result Online!',
    url: 'https://9thclassresult.org.pk/',
    image: '/links/12th-class-result-check.webp',
    badge: '🔥 Hot',
  },
  // #2 — Y9999 Game
  {
    name: 'y999-game',
    label: 'Y9999 Game',
    tagline: '🏆 Play & Win Big!',
    url: 'https://y9999.pk/',
    image: '/links/y999-game.webp',
    badge: '🔥 Hot',
  },
  // #2 — XD777 (Link 1: Apksting)
  {
    name: 'xd777-sting',
    label: 'XD777 Game',
    tagline: '🎰 Win Big Today!',
    url: 'https://apksting.com.pk/zentro-win-game/',
    image: '/links/XD777-new.webp',
    badge: '🔥 Hot',
  },
  // #3 — XD777 (Link 2: Apkgamzu)
  {
    name: 'xd777-gamzu',
    label: 'XD777 Game',
    tagline: '🎰 Win Big Today!',
    url: 'https://apkgamzu.com.pk/x777-game/',
    image: '/links/XD777.webp',
    badge: '🔥 Hot',
  },
  // #2 — JB Game (New Earning Games)
  {
    name: 'jb-game',
    label: 'JB Game',
    tagline: '🎮 New Earning Games!',
    url: 'https://jbgame.pk',
    image: '/links/jb-game.webp',
    badge: '⭐ New',
  },
  // #3
  {
    name: 'Bet Rupees',
    label: 'Bet Rupees',
    tagline: '💰 Play & Win Big!',
    url: 'https://betrupe.com/',
    image: '/links/bet-rupees.webp',
    badge: '🔥 Hot',
  },
  // #4
  {
    name: 'P999 pk',
    label: 'P999 PK',
    tagline: '🎯 Top Rewards!',
    url: 'https://p999pk.org/',
    image: '/links/p999-pk.webp',
    badge: '⭐ New',
  },
  // #5
  {
    name: 'pak super game',
    label: 'Pak Super Game',
    tagline: '🎰 Play & Win Big!',
    url: 'https://paksupergame.cc/',
    image: '/links/pak-super-game.webp',
    badge: '🔥 Hot',
  },
  // #5
  {
    name: 'hh98',
    label: 'HH98',
    tagline: '🎯 Play & Win!',
    url: 'https://hh98.pk/',
    image: '/links/HH98.webp',
    badge: '⭐ New',
  },
  // #7
  {
    name: 'jj77',
    label: 'JJ77',
    tagline: '🏆 Big Rewards!',
    url: 'https://jj77apk.pk/',
    image: '/links/JJ77.webp',
    badge: '💥 Hot',
  },
];

// ═══════════════════════════════════════════════════════
// ✏️  TRAIL 2 SPONSORS (Secondary / Earning Games) — Sequence wise
// ═══════════════════════════════════════════════════════
const SPONSORS_RAIL_2 = [
  // #1 — 12th Class Result (TOP)
  {
    name: '12th-class-result',
    label: '12th Class Result',
    tagline: '🎓 Check Online Now!',
    url: 'https://12thclassresult.com.pk/',
    image: '/links/12th-class-result.webp',
    badge: '🔥 Hot',
  },
  // #2 — PKR365
  {
    name: 'pkr365',
    label: 'PKR365',
    tagline: '🎰 Play & Win Big!',
    url: 'https://gamesapks.com.pk/786ace-game/',
    image: '/links/pkr365.webp',
    badge: '🔥 Hot',
  },
  // #2 — M666 Game
  {
    name: 'M666',
    label: 'M666 Game',
    tagline: '🏆 Play & Win Big!',
    url: 'http://m666game.net/',
    image: '/links/M666.webp',
    badge: '⭐ New',
  },
  // #2 — M19 Game
  {
    name: 'M19 game',
    label: 'M19 Game',
    tagline: '🎮 Bet & Win!',
    url: 'https://betapk.com.pk/bet939-game-2/',
    image: '/links/M19-game.webp',
    badge: '💥 Hot',
  },
  // #3 — 1PPP Game
  {
    name: '1ppp game',
    label: '1PPP Game',
    tagline: '🌟 Play & Earn!',
    url: 'https://1pppp.com.pk/',
    image: '/links/1ppp-game.webp',
    badge: '🔥 Hot',
  },
  // #4 — Win786
  {
    name: 'Win786',
    label: 'Win786',
    tagline: '🎰 Win Big Today!',
    url: 'https://786win.pk/',
    image: '/links/win786.webp',
    badge: '🔥 Hot',
  },
  // #5 — 10win
  {
    name: '10win',
    label: '10win',
    tagline: '🎰 Play & Win Big!',
    url: 'https://110win.com.pk/',
    image: '/links/10win.webp',
    badge: '⭐ New',
  },
  // #6 — Xx555
  {
    name: 'Xx555',
    label: 'Xx555',
    tagline: '🎰 Play & Win Big!',
    url: 'https://Xx555.com.pk/',
    image: '/links/xx555.webp',
    badge: '🔥 Hot',
  },
  // #8 — 666c
  {
    name: '666c',
    label: '666C Games',
    tagline: '🎮 Play & Win Big!',
    url: 'https://666cgames.pk',
    image: '/links/666c.webp',
    badge: '🔥 Hot',
  },
  // ➕ Trail 2 ke naye links aage yahan add hote rahenge (sequence wise):
];

// ── Push to Cloudflare KV ─────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// .env se credentials load karo (gitignore mein hai — safe)
try {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
} catch {}

const KV_NAMESPACE_ID = 'aa59493bbbed47c0af878405e12bd8fb';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!ACCOUNT_ID || !API_TOKEN) {
  console.error('❌ .env mein CLOUDFLARE_ACCOUNT_ID ya CLOUDFLARE_API_TOKEN nahi mila!');
  process.exit(1);
}

async function inlineThumbnails(sponsorsList, railLabel) {
  let count = 0;
  const enriched = await Promise.all(
    sponsorsList.map(async (s) => {
      try {
        const filename = basename(s.image);
        const fullPath = join(ROOT, 'public', 'links', filename);
        if (existsSync(fullPath)) {
          const buf = await sharp(fullPath)
            .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 80, effort: 6 })
            .toBuffer();
          count++;
          return {
            ...s,
            imageData: `data:image/webp;base64,${buf.toString('base64')}`,
          };
        }
      } catch (err) {
        console.warn(`⚠️ Warning: could not inline image for ${s.name}: ${err.message}`);
      }
      return s;
    })
  );
  console.log(`✅ [${railLabel}] Inlined ${count}/${sponsorsList.length} sponsor images as instant Base64!`);
  return enriched;
}

async function pushKeyToKV(key, data, label, retries = 3) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${key}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(60_000),
      });

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(`KV update failed for key '${key}': ${JSON.stringify(resData.errors)}`);
      }
      console.log(`✅ ${label} update SUCCESS! (Key: ${key})`);
      return;
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt}/${retries} failed for ${key}: ${err.message}`);
      if (attempt === retries) throw err;
      console.log(`🔄 Retrying in ${attempt * 5}s...`);
      await new Promise(r => setTimeout(r, attempt * 5000));
    }
  }
}

async function pushToKV() {
  console.log('\n🚀 Sponsor Multi-Rail Instant Push — net27.watch');
  console.log('═'.repeat(50));

  console.log(`📋 Trail 1 (Featured): ${SPONSORS.length} links`);
  SPONSORS.forEach((s, i) => console.log(`   #${i + 1} ${s.label} → ${s.url}`));
  console.log('');

  console.log(`📋 Trail 2 (Gaming Links): ${SPONSORS_RAIL_2.length} links`);
  SPONSORS_RAIL_2.forEach((s, i) => console.log(`   #${i + 1} ${s.label} → ${s.url}`));
  console.log('');

  console.log('⚡ Generating instant Base64 WebP data (Zero 404 guarantee)...');
  const enrichedRail1 = await inlineThumbnails(SPONSORS, 'Trail 1');
  const enrichedRail2 = await inlineThumbnails(SPONSORS_RAIL_2, 'Trail 2');

  try {
    await pushKeyToKV('links', enrichedRail1, 'Trail 1 (Featured Sponsors)');
    await pushKeyToKV('links2', enrichedRail2, 'Trail 2 (Popular Gaming Links)');

    console.log('⚡ Syncing Cloudflare Pages functions hardcoded fallbacks...');
    updateFunctionFallbacks(enrichedRail1, enrichedRail2);

    console.log('\n⏱️  Both rails live in: 5–30 seconds');
    console.log(`🌐 Trail 1 Check: https://net27.watch/api/sponsors`);
    console.log(`🌐 Trail 2 Check: https://net27.watch/api/sponsors2`);
    console.log(`🌐 Site:          https://net27.watch/`);
    console.log('═'.repeat(50) + '\n');
  } catch (err) {
    console.error('❌ Error during KV push:', err.message);
    process.exit(1);
  }
}

function toJsArray(sponsors) {
  return sponsors.map(s => {
    const parts = [
      `name: ${JSON.stringify(s.name)}`,
      `label: ${JSON.stringify(s.label)}`,
      `tagline: ${JSON.stringify(s.tagline)}`,
      `url: ${JSON.stringify(s.url)}`,
      `image: ${JSON.stringify(s.image)}`,
      s.imageData ? `imageData: ${JSON.stringify(s.imageData)}` : null,
      `badge: ${JSON.stringify(s.badge)}`,
    ].filter(Boolean);
    return `    { ${parts.join(', ')} }`;
  }).join(',\n');
}

function updateFunctionFallbacks(t1, t2) {
  const sponsorsJsContent = `/**
 * functions/api/sponsors.js
 * Cloudflare Pages Function — KV se sponsor links serve karta hai
 *
 * GET /api/sponsors        → Trail 1 (Featured Sponsors - Gold Theme)
 * GET /api/sponsors?rail=2 → Trail 2 (Gaming Links - Emerald Theme)
 *
 * AUTO-SYNCED by: scripts/push-sponsors.mjs
 * Last updated: ${new Date().toISOString()}
 */

export async function onRequest(context) {
  const { env } = context;
  try {
    const url = new URL(context.request.url);
    const isRail2 = url.searchParams.get('rail') === '2';
    const key = isRail2 ? 'links2' : 'links';
    const raw = await env.SPONSORS.get(key, { type: 'json' });
    const sponsors = raw || (isRail2 ? getDefaultSponsors2() : getDefaultSponsors());
    return new Response(JSON.stringify(sponsors), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, s-maxage=30',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    const url = new URL(context.request.url);
    const isRail2 = url.searchParams.get('rail') === '2';
    return new Response(JSON.stringify(isRail2 ? getDefaultSponsors2() : getDefaultSponsors()), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    });
  }
}

function getDefaultSponsors() {
  return [
${toJsArray(t1)}
  ];
}

function getDefaultSponsors2() {
  return [
${toJsArray(t2)}
  ];
}
`;

  const sponsors2JsContent = `/**
 * functions/api/sponsors2.js
 * Cloudflare Pages Function — KV se Trail 2 sponsor links serve karta hai
 *
 * GET /api/sponsors2 → Trail 2 (Gaming Links - Emerald Theme)
 *
 * AUTO-SYNCED by: scripts/push-sponsors.mjs
 * Last updated: ${new Date().toISOString()}
 */

export async function onRequest(context) {
  const { env } = context;
  try {
    const raw = await env.SPONSORS.get('links2', { type: 'json' });
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

function getDefaultSponsors2() {
  return [
${toJsArray(t2)}
  ];
}
`;

  writeFileSync(join(ROOT, 'functions', 'api', 'sponsors.js'), sponsorsJsContent, 'utf8');
  writeFileSync(join(ROOT, 'functions', 'api', 'sponsors2.js'), sponsors2JsContent, 'utf8');
  console.log('✅ Auto-synced functions/api/sponsors.js & sponsors2.js with inline Base64 fallbacks!');
}

pushToKV();
