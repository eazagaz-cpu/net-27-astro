/**
 * Fix net-27.cc redirect using Cloudflare Zone Ruleset API
 * Creates a redirect rule at the zone level — no DNS change needed
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

try {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
} catch {}

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_ID   = '5349a54b58591b5faf9bfeebf51b3201'; // net-27.cc zone ID
const H = { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };

async function cf(path, opts = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, { headers: H, ...opts });
  return res.json();
}

console.log('\n🔧 Creating Redirect Rule for net-27.cc → net27.watch');
console.log('═'.repeat(55));

// Check existing redirect rulesets
console.log('\n📋 Checking existing redirect rules...');
const existing = await cf(`/zones/${ZONE_ID}/rulesets/phases/http_request_redirect/entrypoint`);
console.log('Existing ruleset:', JSON.stringify(existing.result?.id || existing.errors, null, 2));

// Create/Update the redirect ruleset
console.log('\n➕ Creating redirect rule: net-27.cc/* → net27.watch/:splat (301)');
const rulesetBody = {
  rules: [
    {
      expression: '(http.host eq "net-27.cc" or http.host eq "www.net-27.cc")',
      description: 'Redirect net-27.cc to net27.watch (301 permanent)',
      action: 'redirect',
      action_parameters: {
        from_value: {
          target_url: {
            expression: 'concat("https://net27.watch", http.request.uri.path)',
          },
          status_code: 301,
          preserve_query_string: true,
        },
      },
      enabled: true,
    },
  ],
};

let result;
if (existing.result?.id) {
  // Update existing ruleset
  console.log('Updating existing ruleset...');
  result = await cf(`/zones/${ZONE_ID}/rulesets/${existing.result.id}`, {
    method: 'PUT',
    body: JSON.stringify(rulesetBody),
  });
} else {
  // Create new ruleset
  console.log('Creating new ruleset...');
  result = await cf(`/zones/${ZONE_ID}/rulesets/phases/http_request_redirect/entrypoint`, {
    method: 'PUT',
    body: JSON.stringify({ phase: 'http_request_redirect', ...rulesetBody }),
  });
}

if (result.success) {
  console.log('\n✅ Redirect Rule CREATED successfully!');
  console.log('   Rule ID:', result.result?.id);
  console.log('   Rules:', result.result?.rules?.length);
  console.log('\n🌐 Now net-27.cc → 301 → net27.watch');
  console.log('⏱️  Live in: 30 seconds - 2 minutes');
  console.log('📌 Search Console mein 5 min baad "Try Again" karo');
} else {
  console.error('\n❌ Ruleset creation failed:');
  console.error(JSON.stringify(result.errors, null, 2));

  // Try simpler approach via Page Rules
  console.log('\n🔄 Trying Page Rules as fallback...');
  const pageRule = await cf(`/zones/${ZONE_ID}/pagerules`, {
    method: 'POST',
    body: JSON.stringify({
      targets: [{ target: 'url', constraint: { operator: 'matches', value: 'net-27.cc/*' } }],
      actions: [{ id: 'forwarding_url', value: { url: 'https://net27.watch/$1', status_code: 301 } }],
      status: 'active',
      priority: 1,
    }),
  });
  
  if (pageRule.success) {
    console.log('✅ Page Rule created! net-27.cc → net27.watch (301)');
  } else {
    console.error('❌ Page Rule also failed:', JSON.stringify(pageRule.errors, null, 2));
    console.log('\n💡 Manual fix needed:');
    console.log('   Cloudflare Dashboard → net-27.cc zone → Rules → Redirect Rules');
    console.log('   Add rule: net-27.cc/* → 301 → https://net27.watch/$1');
  }
}
