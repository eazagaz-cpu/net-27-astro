/**
 * scripts/add-sponsor.mjs — adds a sponsor link to THE list:
 * src/data/sponsor-links.json. Nothing else holds sponsor data; components,
 * Pages Functions and KV are all generated from that file.
 *
 *   npm run sponsors:add -- --url "https://pk77.com/" --label "PK77 Game" --image "PK77.png"
 *        [--trail 2]  [--position 1]  [--id pk77]  [--tagline "🎰 Win Big!"]  [--badge "🔥 Hot"]
 *   npm run sponsors:deploy        ← commit + push, then KV (5-30s live)
 *
 * --trail     1 = Featured (gold, default) · 2 = Popular Gaming (emerald)
 * --position  1 = top ("top pr lagao"); default = end of the trail
 * --image     file in links/ or public/links/ (fuzzy: "XD 777" finds XD777.png)
 *
 * Same name, different URL → a NEW entry; existing links are never replaced.
 * (Before 2026-09-25 this script wrote into push-sponsors.mjs, which no longer
 * holds the list — links added that way never reached the site, then vanished.)
 */
import { existsSync, readdirSync, copyFileSync } from 'fs';
import { join, extname, basename } from 'path';
import sharp from 'sharp';
import { ROOT, loadManifest, saveManifest, normUrl, parseArgs } from './lib/sponsor-guard.mjs';

const a = parseArgs();
a.id ??= a.name; // old flag name
const die = (m) => { console.error(`❌ ${m}`); process.exit(1); };

if (!a.url || !a.label || !a.image) die('--url, --label aur --image lazmi hain');
if (!/^https?:\/\/\S+$/.test(a.url)) die(`URL sahi nahi: ${a.url}`);
const trailKey = String(a.trail ?? '1') === '2' ? 'trail2' : 'trail1';

const m = loadManifest();
const all = [...m.trail1, ...m.trail2];
const existing = all.find((s) => normUrl(s.url) === normUrl(a.url));
if (existing) {
  console.log(`ℹ️  ${a.url} pehle se maujood hai (${existing.id}) — kuch nahi badla.`);
  process.exit(0);
}

// ── Unique id; never reuse one (same label + new URL = separate client) ─────
const slug = (t) => String(t).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/-+/g, '-');
const base = slug(a.id ?? a.label) || 'sponsor';
const taken = new Set([...all.map((s) => s.id), ...(m.removed ?? []).map((r) => r.id)]);
let id = base;
for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;

// ── Image → public/links/<id>.webp (+ .png fallback) ───────────────────────
const dirs = [join(ROOT, 'links'), join(ROOT, 'public', 'links')];
const squash = (s) => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]/g, '');
let src = [a.image, ...dirs.map((d) => join(d, a.image))].find((p) => existsSync(p) && extname(p));
if (!src) {
  const want = squash(basename(a.image));
  for (const d of dirs.filter(existsSync)) {
    const hit = readdirSync(d).find((f) => /\.(png|jpe?g|webp)$/i.test(f) && squash(f) === want);
    if (hit) { src = join(d, hit); break; }
  }
}
if (!src) die(`Image nahi mili: "${a.image}" (links/ aur public/links/ dono check kiye)`);

const webp = `${id}.webp`;
await sharp(src).webp({ quality: 82, effort: 6 }).toFile(join(ROOT, 'public', 'links', webp));
if (/\.png$/i.test(src)) copyFileSync(src, join(ROOT, 'public', 'links', `${id}.png`));
console.log(`🖼️  ${basename(src)} → public/links/${webp}`);

// ── Insert ─────────────────────────────────────────────────────────────────
const entry = {
  id,
  label: a.label,
  tagline: a.tagline ?? '🎰 Play & Win Big!',
  url: a.url,
  image: `/links/${webp}`,
  imageFile: webp,
  badge: a.badge ?? '🔥 Hot',
  enabled: true,
};
const trail = m[trailKey];
const pos = a.position ? Math.min(Math.max(parseInt(a.position, 10) || 1, 1), trail.length + 1) : trail.length + 1;
trail.splice(pos - 1, 0, entry);
m.removed = (m.removed ?? []).filter((r) => normUrl(r.url) !== normUrl(a.url)); // re-adding a removed link
saveManifest(m);

console.log(`✅ ${a.label} added to ${trailKey === 'trail1' ? 'Trail 1 (Featured)' : 'Trail 2 (Gaming)'} at #${pos} as "${id}"`);
console.log(`   ${m.expectedCounts.trail1} + ${m.expectedCounts.trail2} links · manifest ${m.manifestVersion}`);
console.log('\n👉 Ab live karo:  npm run sponsors:deploy\n');
