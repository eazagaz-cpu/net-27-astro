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
  // #1 — Y9999 Game (TOP)
  {
    name: 'y999-game',
    label: 'Y9999 Game',
    tagline: '🏆 Play & Win Big!',
    url: 'https://y9999.pk/',
    image: '/links/y999-game.webp',
    badge: '🔥 Hot',
  },
  // #2 — XD777 (updated URL)
  {
    name: 'XD777',
    label: 'XD777 Game',
    tagline: '🎰 Win Big Today!',
    url: 'https://apksting.com.pk/zentro-win-game/',
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
  // #6
  {
    name: 'jj77',
    label: 'JJ77',
    tagline: '🏆 Big Rewards!',
    url: 'https://jj77apk.pk/',
    image: '/links/JJ77.webp',
    badge: '💥 Hot',
  },
  // #7
  {
    name: 'M666',
    label: 'M666 Game',
    tagline: '🏆 Play & Win Big!',
    url: 'http://m666game.net/',
    image: '/links/M666.webp',
    badge: '⭐ New',
  },
  // #8
  {
    name: 'M19 game',
    label: 'M19 Game',
    tagline: '🎮 Bet & Win!',
    url: 'https://betapk.com.pk/bet939-game-2/',
    image: '/links/M19-game.webp',
    badge: '💥 Hot',
  },
  // #9
  {
    name: '1ppp game',
    label: '1PPP Game',
    tagline: '🌟 Play & Earn!',
    url: 'https://1pppp.com.pk/',
    image: '/links/1ppp-game.webp',
    badge: '🔥 Hot',
  },
    // New
  {
    name: 'Win786',
    label: 'Win786',
    tagline: '🎰 Win Big Today!',
    url: 'https://786win.pk/',
    image: '/links/win786.webp',
    badge: '🔥 Hot',
  },
    // New
  {
    name: '10win',
    label: '10win',
    tagline: '🎰 Play & Win Big!',
    url: 'https://110win.com.pk/',
    image: '/links/10win.webp',
    badge: '⭐ New',
  },
    // New
  {
    name: 'Xx555',
    label: 'Xx555',
    tagline: '🎰 Play & Win Big!',
    url: 'https://Xx555.com.pk/',
    image: '/links/xx555.webp',
    badge: '🔥 Hot',
  },
  // ➕ Aage yahan add karo:
  // {
  //   name: 'NewGame',
  //   label: 'New Game',
  //   tagline: '🎯 Play Now!',
  //   url: 'https://example.com/',
  //   image: '/links/NewGame.webp',   ← HAMESHA .webp use karo
  //   badge: '⭐ New',
  // },
];

// ═══════════════════════════════════════════════════════
// ✏️  TRAIL 2 SPONSORS (Secondary / Earning Games) — Sequence wise
// ═══════════════════════════════════════════════════════
const SPONSORS_RAIL_2 = [
  // #1 — Win786
  {
    name: 'Win786',
    label: 'Win786',
    tagline: '🎰 Win Big Today!',
    url: 'https://786win.pk/',
    image: '/links/win786.webp',
    badge: '🔥 Hot',
  },
  // #2 — 10win
  {
    name: '10win',
    label: '10win',
    tagline: '🎰 Play & Win Big!',
    url: 'https://110win.com.pk/',
    image: '/links/10win.webp',
    badge: '⭐ New',
  },
  // #3 — Xx555
  {
    name: 'Xx555',
    label: 'Xx555',
    tagline: '🎰 Play & Win Big!',
    url: 'https://Xx555.com.pk/',
    image: '/links/xx555.webp',
    badge: '🔥 Hot',
  },
  // ➕ Trail 2 ke naye links aage yahan add karo (sequence wise):
];

// ── Push to Cloudflare KV ─────────────────────────────────────────────────────
import { readFileSync, existsSync } from 'fs';
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

async function pushKeyToKV(key, data, label) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${key}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(15_000),
  });

  const resData = await res.json();
  if (!resData.success) {
    throw new Error(`KV update failed for key '${key}': ${JSON.stringify(resData.errors)}`);
  }
  console.log(`✅ ${label} update SUCCESS! (Key: ${key})`);
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

pushToKV();
