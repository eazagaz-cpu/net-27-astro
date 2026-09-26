/**
 * scripts/remove-sponsor.mjs — the ONLY sanctioned way to take a sponsor
 * link off the site. Use it only when the user explicitly asks ("hata do").
 *
 *   npm run sponsors:remove -- --url "https://pk77.com/"  [--reason "client ended"]
 *   npm run sponsors:remove -- --id pk77
 *   npm run sponsors:deploy
 *
 * It moves the entry into `removed` in src/data/sponsor-links.json instead of
 * deleting it. The CI gate refuses any live link that disappears from the
 * manifest without such a record — that is what stops links vanishing by
 * accident — so deleting the JSON entry by hand will be blocked.
 */
import { loadManifest, saveManifest, normUrl, parseArgs } from './lib/sponsor-guard.mjs';

const a = parseArgs();
if (!a.url && !a.id) {
  console.error('❌ --url ya --id do');
  process.exit(1);
}

const m = loadManifest();
const match = (s) => (a.url ? normUrl(s.url) === normUrl(a.url) : s.id === a.id);
const trailKey = ['trail1', 'trail2'].find((k) => m[k].some(match));
if (!trailKey) {
  console.error(`❌ ${a.url ?? a.id} manifest mein nahi mila. Mojooda links: npm run verify:links`);
  process.exit(1);
}

const [entry] = m[trailKey].splice(m[trailKey].findIndex(match), 1);
m.removed = [...(m.removed ?? []), {
  id: entry.id,
  label: entry.label,
  url: entry.url,
  trail: trailKey,
  removedOn: new Date().toISOString().slice(0, 10),
  reason: a.reason && a.reason !== true ? a.reason : 'user asked',
}];
saveManifest(m);

console.log(`🗑️  ${entry.label} (${entry.url}) removed from ${trailKey} and recorded under "removed".`);
console.log(`   ${m.expectedCounts.trail1} + ${m.expectedCounts.trail2} links · manifest ${m.manifestVersion}`);
console.log('\n👉 Ab live karo:  npm run sponsors:deploy\n');
