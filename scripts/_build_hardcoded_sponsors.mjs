/**
 * scripts/_build_hardcoded_sponsors.mjs
 * Run: node scripts/_build_hardcoded_sponsors.mjs
 * Generates functions/api/sponsors.js with inline Base64 images baked in.
 * Isse GitHub fail hone par bhi images kabhi nahi tooteingi.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const TRAIL1 = [
  { name: 'y999-game',       label: 'Y9999 Game',     tagline: '🎮 Play & Win Big!',    url: 'https://y9999.pk/',                        image: '/links/y999-game.webp',      imageFile: 'y999-game.webp',      badge: '🔥 Hot' },
  { name: 'xd777-sting',     label: 'XD777 Game',     tagline: '💰 Win Big Today!',      url: 'https://apksting.com.pk/zentro-win-game/', image: '/links/XD777-new.webp',      imageFile: 'XD777-new.webp',      badge: '🔥 Hot' },
  { name: 'xd777-gamzu',     label: 'XD777 Game',     tagline: '💰 Win Big Today!',      url: 'https://apkgamzu.com.pk/x777-game/',       image: '/links/XD777.webp',          imageFile: 'XD777.webp',          badge: '🔥 Hot' },
  { name: 'jb-game',         label: 'JB Game',        tagline: '🎮 New Earning Games!',  url: 'https://jbgame.pk',                        image: '/links/jb-game.webp',        imageFile: 'jb-game.webp',        badge: '🆕 New' },
  { name: 'Bet Rupees',      label: 'Bet Rupees',     tagline: '🎯 Play & Win Big!',     url: 'https://betrupe.com/',                     image: '/links/bet-rupees.webp',     imageFile: 'bet-rupees.webp',     badge: '🔥 Hot' },
  { name: 'P999 pk',         label: 'P999 PK',        tagline: '🏆 Top Rewards!',        url: 'https://p999pk.org/',                      image: '/links/p999-pk.webp',        imageFile: 'p999-pk.webp',        badge: '🆕 New' },
  { name: 'pak super game',  label: 'Pak Super Game', tagline: '💎 Play & Win Big!',     url: 'https://paksupergame.cc/',                 image: '/links/pak-super-game.webp', imageFile: 'pak-super-game.webp', badge: '🔥 Hot' },
  { name: 'hh98',            label: 'HH98',           tagline: '🏆 Play & Win!',         url: 'https://hh98.pk/',                         image: '/links/HH98.webp',           imageFile: 'HH98.webp',           badge: '🆕 New' },
  { name: 'jj77',            label: 'JJ77',           tagline: '🎮 Big Rewards!',        url: 'https://jj77apk.pk/',                      image: '/links/JJ77.webp',           imageFile: 'JJ77.webp',           badge: '💎 Hot' },
];

const TRAIL2 = [
  { name: 'pkr365',      label: 'PKR365',      tagline: '💎 Play & Win Big!', url: 'https://gamesapks.com.pk/786ace-game/', image: '/links/pkr365.webp',    imageFile: 'pkr365.webp',    badge: '🔥 Hot' },
  { name: 'M666',        label: 'M666 Game',   tagline: '🎮 Play & Win Big!', url: 'http://m666game.net/',                  image: '/links/M666.webp',      imageFile: 'M666.webp',      badge: '🆕 New' },
  { name: 'M19 game',    label: 'M19 Game',    tagline: '🎯 Bet & Win!',      url: 'https://betapk.com.pk/bet939-game-2/', image: '/links/M19-game.webp',  imageFile: 'M19-game.webp',  badge: '💎 Hot' },
  { name: '1ppp game',   label: '1PPP Game',   tagline: '🎮 Play & Earn!',    url: 'https://1pppp.com.pk/',                image: '/links/1ppp-game.webp', imageFile: '1ppp-game.webp', badge: '🔥 Hot' },
  { name: 'Win786',      label: 'Win786',      tagline: '💰 Win Big Today!',  url: 'https://786win.pk/',                   image: '/links/win786.webp',    imageFile: 'win786.webp',    badge: '🔥 Hot' },
  { name: '10win',       label: '10win',       tagline: '💎 Play & Win Big!', url: 'https://110win.com.pk/',               image: '/links/10win.webp',     imageFile: '10win.webp',     badge: '🆕 New' },
  { name: 'Xx555',       label: 'Xx555',       tagline: '💎 Play & Win Big!', url: 'https://Xx555.com.pk/',                image: '/links/xx555.webp',     imageFile: 'xx555.webp',     badge: '🔥 Hot' },
  { name: '666c',        label: '666C Games',  tagline: '🎯 Play & Win Big!', url: 'https://666cgames.pk',                 image: '/links/666c.webp',      imageFile: '666c.webp',      badge: '🔥 Hot' },
];

async function inlineBase64(sponsors) {
  return Promise.all(sponsors.map(async (s) => {
    const fp = join(ROOT, 'public', 'links', s.imageFile);
    let imageData = '';
    if (existsSync(fp)) {
      const buf = await sharp(fp)
        .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 75, effort: 6 })
        .toBuffer();
      imageData = `data:image/webp;base64,${buf.toString('base64')}`;
      console.log(`  ✅ ${s.name} (${buf.length}b)`);
    } else {
      console.warn(`  ⚠️  MISSING: ${s.imageFile}`);
    }
    return { ...s, imageData };
  }));
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

async function main() {
  console.log('\n⚡ Building hardcoded sponsors with inline Base64...');
  console.log('Trail 1:');
  const t1 = await inlineBase64(TRAIL1);
  console.log('Trail 2:');
  const t2 = await inlineBase64(TRAIL2);

  const output = `/**
 * functions/api/sponsors.js
 * Cloudflare Pages Function — KV se sponsor links serve karta hai
 *
 * GET /api/sponsors      → Trail 1 (Featured Sponsors - Gold Theme)
 * GET /api/sponsors?rail=2 → Trail 2 (Gaming Links - Emerald Theme)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * NUCLEAR FALLBACK SYSTEM (4-Layer Shield):
 *   Layer 1: KV mein live data (push-sponsors.mjs se update hota hai)
 *   Layer 2: getDefaultSponsors() — hardcoded list WITH inline Base64
 *            (GitHub fail hone par bhi images toot nahi sakti!)
 *   Layer 3: SponsorRailDynamic.tsx FALLBACK array
 *   Layer 4: onError avatar (🎰 badge)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * AUTO-GENERATED by: node scripts/_build_hardcoded_sponsors.mjs
 * Last updated: ${new Date().toISOString()}
 * DO NOT EDIT MANUALLY — Run the script to regenerate.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Cache: 30s — KV update ke 30s baad sab users ko naya data milega
 */

export async function onRequest(context) {
  const { env } = context;

  try {
    const url = new URL(context.request.url);
    const isRail2 = url.searchParams.get('rail') === '2';
    const key = isRail2 ? 'links2' : 'links';

    // KV se sponsor data fetch karo
    const raw = await env.SPONSORS.get(key, { type: 'json' });

    // Agar KV mein kuch nahi — hardcoded list use karo (WITH inline Base64!)
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
    // KV binding missing ya error — hardcoded list serve karo (WITH inline Base64!)
    const url = new URL(context.request.url);
    const isRail2 = url.searchParams.get('rail') === '2';
    return new Response(JSON.stringify(isRail2 ? getDefaultSponsors2() : getDefaultSponsors()), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRAIL 1 — Featured Sponsors (Gold Theme) — 9 Links
// imageData = inline Base64 WebP (192x192) — ZERO HTTP requests, ZERO 404s
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getDefaultSponsors() {
  return [
${toJsArray(t1)}
  ];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRAIL 2 — Popular Gaming Links (Emerald Theme) — 8 Links
// imageData = inline Base64 WebP (192x192) — ZERO HTTP requests, ZERO 404s
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getDefaultSponsors2() {
  return [
${toJsArray(t2)}
  ];
}
`;

  const outPath = join(ROOT, 'functions', 'api', 'sponsors.js');
  writeFileSync(outPath, output, 'utf8');
  console.log(`\n✅ Generated: functions/api/sponsors.js`);
  console.log(`   Trail 1: ${t1.length} sponsors`);
  console.log(`   Trail 2: ${t2.length} sponsors`);
  console.log('   All images hardcoded as inline Base64 ✅\n');
}

main().catch(e => { console.error(e); process.exit(1); });
