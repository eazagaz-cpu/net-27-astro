/**
 * Add net-27.cc as custom domain to Cloudflare Pages project
 * so _redirects file can handle the 301 redirect to net27.watch
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
} catch (e) {}

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN;
const PROJECT    = 'net-27-astro';

if (!ACCOUNT_ID || !API_TOKEN) {
  console.error('❌ .env mein CLOUDFLARE_ACCOUNT_ID ya CLOUDFLARE_API_TOKEN nahi mila!');
  process.exit(1);
}

const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/domains`;
const HEADERS = { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };

// Step 1: Check existing domains
console.log('\n🔍 Checking existing custom domains...');
const listRes = await fetch(BASE, { headers: HEADERS });
const listData = await listRes.json();

if (listData.success) {
  const domains = listData.result || [];
  console.log(`📋 Existing domains (${domains.length}):`);
  domains.forEach(d => console.log(`   - ${d.name} [${d.status}]`));

  const alreadyAdded = domains.find(d => d.name === 'net-27.cc');
  if (alreadyAdded) {
    console.log(`\n✅ net-27.cc already added! Status: ${alreadyAdded.status}`);
    console.log('   Agar status "active" nahi hai to Cloudflare DNS check karo.');
    process.exit(0);
  }
} else {
  console.error('❌ Domain list fetch failed:', JSON.stringify(listData.errors));
}

// Step 2: Add net-27.cc
console.log('\n➕ Adding net-27.cc as custom domain...');
const addRes = await fetch(BASE, {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({ name: 'net-27.cc' }),
});
const addData = await addRes.json();

if (addData.success) {
  console.log('✅ net-27.cc ADDED successfully!');
  console.log('   Status:', addData.result?.status);
  console.log('\n📌 Next Steps:');
  console.log('   1. Cloudflare DNS mein net-27.cc ka CNAME record check karo');
  console.log('      net-27.cc → net-27-astro.pages.dev');
  console.log('   2. 5-10 minutes mein active ho jayega');
  console.log('   3. Phir Search Console mein "Try Again" karo');
} else {
  console.error('❌ Failed to add domain:');
  console.error(JSON.stringify(addData.errors, null, 2));
  console.log('\n💡 Manual fix:');
  console.log('   Cloudflare Dashboard → Workers & Pages → net-27-astro → Custom Domains');
  console.log('   → "Set up a custom domain" → net-27.cc add karo');
}
