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
  // #1
  {
    name: 'Bet Rupees',
    label: 'Bet Rupees',
    tagline: '💰 Play & Win Big!',
    url: 'https://betrupe.com/',
    image: '/links/bet-rupees.png',
    badge: '🔥 Hot',
  },
  // #2
  {
    name: 'P999 pk',
    label: 'P999 PK',
    tagline: '🎯 Top Rewards!',
    url: 'https://p999pk.org/',
    image: '/links/p999-pk.png',
    badge: '⭐ New',
  },
  // #3
  {
    name: 'pak super game',
    label: 'Pak Super Game',
    tagline: '🎰 Play & Win Big!',
    url: 'https://paksupergame.cc/',
    image: '/links/pak-super-game.png',
    badge: '🔥 Hot',
  },
  // #2
  {
    name: 'XD777',
    label: 'XD777 Game',
    tagline: '🎰 Win Big Today!',
    url: 'https://apkgamzu.com.pk/x777-game/',
    image: '/links/XD777.png',
    badge: '🔥 Hot',
  },
  // #2
  {
    name: 'hh98',
    label: 'HH98',
    tagline: '🎯 Play & Win!',
    url: 'https://hh98.pk/',
    image: '/links/HH98.png',
    badge: '⭐ New',
  },
  // #3
  {
    name: 'jj77',
    label: 'JJ77',
    tagline: '🏆 Big Rewards!',
    url: 'https://jj77apk.pk/',
    image: '/links/JJ77.png',
    badge: '💥 Hot',
  },
  // #4
  {
    name: 'M666',
    label: 'M666 Game',
    tagline: '🏆 Play & Win Big!',
    url: 'http://m666game.net/',
    image: '/links/M666.png',
    badge: '⭐ New',
  },
  // #5
  {
    name: 'M19 game',
    label: 'M19 Game',
    tagline: '🎮 Bet & Win!',
    url: 'https://betapk.com.pk/bet939-game-2/',
    image: '/links/M19-game.png',
    badge: '💥 Hot',
  },
  // #6
  {
    name: '1ppp game',
    label: '1PPP Game',
    tagline: '🌟 Play & Earn!',
    url: 'https://1pppp.com.pk/',
    image: '/links/1ppp-game.png',
    badge: '🔥 Hot',
  },
  // ➕ Aage yahan add karo:
  // {
  //   name: 'NewGame',
  //   label: 'New Game',
  //   tagline: '🎯 Play Now!',
  //   url: 'https://example.com/',
  //   image: '/links/NewGame.png',
  //   badge: '⭐ New',
  // },
];

// ── Push to Cloudflare KV ─────────────────────────────────────────────────────
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

async function pushToKV() {
  console.log('\n🚀 Sponsor Instant Push — net27.watch');
  console.log('═'.repeat(45));
  console.log(`📋 Sponsors: ${SPONSORS.length} links`);
  SPONSORS.forEach((s, i) => console.log(`   #${i + 1} ${s.label} → ${s.url}`));
  console.log('');

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/links`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(SPONSORS),
      signal: AbortSignal.timeout(15_000),
    });

    const data = await res.json();

    if (data.success) {
      console.log('✅ KV update SUCCESS!');
      console.log('⏱️  Live in: 5–30 seconds');
      console.log(`🌐 Check: https://net27.watch/api/sponsors`);
      console.log(`🌐 Site:  https://net27.watch/`);
      console.log('═'.repeat(45) + '\n');
    } else {
      console.error('❌ KV update FAILED:');
      console.error(JSON.stringify(data.errors, null, 2));
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Network error:', err.message);
    process.exit(1);
  }
}

pushToKV();
