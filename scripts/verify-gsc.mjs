/**
 * verify-gsc.mjs — Verifies Google Search Console API read-only access
 * for net27-watch@net27-security.iam.gserviceaccount.com on net27.watch.
 *
 * Uses built-in Node.js crypto and fetch. No secrets are logged or exposed.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY_FILE = join(ROOT, 'net27-security-efd5a03b525b.json');
const TARGET_URL_PREFIX = 'https://net27.watch/';
const TARGET_DOMAIN_PROP = 'sc-domain:net27.watch';

function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(creds) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: creds.token_uri || 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const unsignedToken = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(creds.private_key);
  const assertion = `${unsignedToken}.${base64url(signature)}`;

  const res = await fetch(creds.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errText}`);
  }

  const tokenData = await res.json();
  return tokenData.access_token;
}

async function verifyGsc() {
  console.log('=== Google Search Console API Access Verification ===\n');

  if (!existsSync(KEY_FILE)) {
    console.error(`❌ Credentials file not found: net27-security-efd5a03b525b.json`);
    process.exit(1);
  }

  let creds;
  try {
    creds = JSON.parse(readFileSync(KEY_FILE, 'utf8'));
  } catch (e) {
    console.error(`❌ Failed to parse credentials JSON:`, e.message);
    process.exit(1);
  }

  console.log(`✅ Google Cloud Project: ${creds.project_id}`);
  console.log(`✅ Service Account: ${creds.client_email}`);
  console.log(`🔒 Authentication: RSA-SHA256 signed JWT (Read-Only scope)\n`);

  let accessToken;
  try {
    accessToken = await getAccessToken(creds);
    console.log(`✅ OAuth2 Access Token successfully minted for service account.`);
  } catch (err) {
    console.error(`❌ Authentication failed:`, err.message);
    process.exit(1);
  }

  // Step 1: List all accessible sites in Search Console
  console.log('\n--- Step 1: Querying Search Console Verified Sites ---');
  const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!sitesRes.ok) {
    const errText = await sitesRes.text();
    console.error(`❌ Failed to list sites (${sitesRes.status}): ${errText}`);
    console.log('\nPlease verify that the Google Search Console API is enabled in Google Cloud project:');
    console.log(`https://console.cloud.google.com/apis/library/searchconsole.googleapis.com?project=${creds.project_id}`);
    process.exit(1);
  }

  const sitesData = await sitesRes.json();
  const siteList = sitesData.siteEntry || [];

  console.log(`Sites accessible to this Service Account: ${siteList.length}`);
  siteList.forEach((entry) => {
    console.log(`  - Site: ${entry.siteUrl} (Permission: ${entry.permissionLevel})`);
  });

  const matchedSite = siteList.find(
    (s) =>
      s.siteUrl === TARGET_URL_PREFIX ||
      s.siteUrl === TARGET_DOMAIN_PROP ||
      s.siteUrl.includes('net27.watch')
  );

  if (!matchedSite) {
    console.log(`\n⚠️  The service account does not have access to ${TARGET_URL_PREFIX} or ${TARGET_DOMAIN_PROP} yet.`);
    console.log('\nAction Required to complete verification:');
    console.log('1. Go to Google Search Console: https://search.google.com/search-console');
    console.log(`2. Select your property: net27.watch (or ${TARGET_URL_PREFIX})`);
    console.log('3. In the left menu, click "Settings" -> "Users and permissions"');
    console.log('4. Click "Add user" (blue button at top right)');
    console.log(`5. Enter Email address: ${creds.client_email}`);
    console.log('6. Set Permission to "Full" or "Restricted" (Read-only is sufficient)');
    console.log('7. Click "Add". Then run this script again!');
    return;
  }

  console.log(`\n✅ Matched property: ${matchedSite.siteUrl}`);
  console.log(`✅ Permission level: ${matchedSite.permissionLevel}`);

  // Step 2: Query Search Analytics Report
  console.log('\n--- Step 2: Querying Search Analytics Performance Data ---');
  const now = new Date();
  const end = new Date(now.getTime() - 2 * 24 * 3600 * 1000); // 2 days ago
  const start = new Date(now.getTime() - 30 * 24 * 3600 * 1000); // 30 days ago

  const fmt = (d) => d.toISOString().split('T')[0];
  const queryBody = {
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ['date'],
    rowLimit: 10,
  };

  const queryRes = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(matchedSite.siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryBody),
    }
  );

  if (!queryRes.ok) {
    const errText = await queryRes.text();
    console.log(`Search Analytics query response (${queryRes.status}): ${errText}`);
    return;
  }

  const queryData = await queryRes.json();
  const rows = queryData.rows || [];

  if (rows.length === 0) {
    console.log('🎉 API connection successful. Site property verified.');
    console.log('ℹ️  No query data recorded yet (Normal for a new website / brand new property).');
    console.log('Metrics Summary:');
    console.log('  - Total Clicks: 0');
    console.log('  - Total Impressions: 0');
    console.log('  - Average CTR: 0.00%');
    console.log('  - Average Position: N/A');
  } else {
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalPosition = 0;

    rows.forEach((r) => {
      totalClicks += r.clicks || 0;
      totalImpressions += r.impressions || 0;
      totalPosition += (r.position || 0) * (r.impressions || 0);
    });

    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    const avgPos = totalImpressions > 0 ? (totalPosition / totalImpressions).toFixed(1) : 'N/A';

    console.log('🎉 Metrics Summary (Last 28 Days):');
    console.log(`  - Total Clicks: ${totalClicks}`);
    console.log(`  - Total Impressions: ${totalImpressions}`);
    console.log(`  - Average CTR: ${avgCtr}%`);
    console.log(`  - Average Position: ${avgPos}`);
  }
}

verifyGsc().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
