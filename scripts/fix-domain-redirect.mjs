/**
 * Fix net-27.cc → net27.watch redirect via Cloudflare API
 * 1. Get zone ID for net-27.cc
 * 2. Fix DNS record (CNAME → pages.dev)
 * 3. Re-activate blocked Pages custom domain
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load .env
try {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
} catch {}

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN;
const PROJECT    = 'net-27-astro';
const OLD_DOMAIN = 'net-27.cc';
const PAGES_DEV  = 'net-27-astro.pages.dev';

const H = { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };

async function cf(path, opts = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers: H, ...opts });
  return res.json();
}

console.log('\n🔧 NET-27.CC → NET27.WATCH Redirect Fix');
console.log('═'.repeat(50));

// ─── Step 1: Get Zone ID for net-27.cc ───────────────
console.log('\n📍 Step 1: Getting zone ID for net-27.cc...');
const zones = await cf(`/zones?name=${OLD_DOMAIN}&status=active`);
if (!zones.success || !zones.result?.length) {
  console.error('❌ Zone not found for net-27.cc:', JSON.stringify(zones.errors));
  process.exit(1);
}
const ZONE_ID = zones.result[0].id;
console.log(`✅ Zone ID: ${ZONE_ID}`);

// ─── Step 2: List current DNS records ────────────────
console.log('\n📋 Step 2: Current DNS records for net-27.cc...');
const records = await cf(`/zones/${ZONE_ID}/dns_records?type=A&type=CNAME&name=${OLD_DOMAIN}`);
const dnsRecords = records.result || [];
dnsRecords.forEach(r => console.log(`   ${r.type} ${r.name} → ${r.content} [proxied:${r.proxied}]`));

// ─── Step 3: Delete existing A/CNAME records for root domain ─────
console.log('\n🗑️  Step 3: Removing old A records for net-27.cc root...');
for (const rec of dnsRecords) {
  if (rec.name === OLD_DOMAIN && (rec.type === 'A' || rec.type === 'CNAME')) {
    const del = await cf(`/zones/${ZONE_ID}/dns_records/${rec.id}`, { method: 'DELETE' });
    if (del.success) {
      console.log(`   ✅ Deleted: ${rec.type} ${rec.name} → ${rec.content}`);
    } else {
      console.error(`   ❌ Delete failed: ${JSON.stringify(del.errors)}`);
    }
  }
}

// ─── Step 4: Add CNAME → pages.dev ───────────────────
console.log(`\n➕ Step 4: Adding CNAME ${OLD_DOMAIN} → ${PAGES_DEV}...`);
const addDns = await cf(`/zones/${ZONE_ID}/dns_records`, {
  method: 'POST',
  body: JSON.stringify({
    type: 'CNAME',
    name: OLD_DOMAIN,
    content: PAGES_DEV,
    ttl: 1,
    proxied: true,
  }),
});
if (addDns.success) {
  console.log(`✅ CNAME added: ${OLD_DOMAIN} → ${PAGES_DEV} [proxied]`);
} else {
  console.error('❌ CNAME add failed:', JSON.stringify(addDns.errors, null, 2));
}

// ─── Step 5: Delete blocked domain from Pages ────────
console.log('\n🔄 Step 5: Removing blocked domain from Pages project...');
const delDomain = await cf(
  `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains/${OLD_DOMAIN}`,
  { method: 'DELETE' }
);
if (delDomain.success) {
  console.log(`✅ Removed ${OLD_DOMAIN} from Pages project`);
} else {
  console.log('   (May already be gone or different error):', JSON.stringify(delDomain.errors));
}

// ─── Step 6: Wait a moment then re-add ───────────────
console.log('\n⏳ Waiting 3 seconds before re-adding...');
await new Promise(r => setTimeout(r, 3000));

console.log(`\n➕ Step 6: Re-adding ${OLD_DOMAIN} to Pages project...`);
const reAdd = await cf(`/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains`, {
  method: 'POST',
  body: JSON.stringify({ name: OLD_DOMAIN }),
});
if (reAdd.success) {
  console.log(`✅ ${OLD_DOMAIN} added! Status: ${reAdd.result?.status}`);
} else {
  console.error('❌ Re-add failed:', JSON.stringify(reAdd.errors, null, 2));
}

// ─── Step 7: Final status check ──────────────────────
console.log('\n📊 Step 7: Final domain status check...');
await new Promise(r => setTimeout(r, 2000));
const finalCheck = await cf(`/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains`);
if (finalCheck.success) {
  console.log('Current custom domains:');
  (finalCheck.result || []).forEach(d => console.log(`   ${d.name} → [${d.status}]`));
}

console.log('\n═'.repeat(50));
console.log('🎉 Done! net-27.cc should redirect to net27.watch');
console.log('⏱️  DNS propagation: 2-5 minutes');
console.log('📌 Search Console mein 10 min baad "Try Again" karo');
