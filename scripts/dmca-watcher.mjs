#!/usr/bin/env node
/**
 * dmca-watcher.mjs — Scans Gmail for DMCA/copyright/abuse notices.
 *
 * Sources monitored:
 *   - Cloudflare (abuse@cloudflare.com)
 *   - Google DMCA (dmca-agent@google.com, legal@google.com)
 *   - Google Search Console (manual actions)
 *   - Lumen Database, anti-piracy senders
 *
 * On detection: writes to dmca/queue.json. The repo is PUBLIC, so only the
 * sender's domain, date, report ID and target URLs are kept: never an
 * address, subject or body. Under GitHub Actions the counts go to
 * $GITHUB_OUTPUT (new_auto, new_manual).
 *
 * Exit 1 = could not scan (credentials missing or rejected): a real outage.
 *
 * Usage:
 *   node scripts/dmca-watcher.mjs           # Full scan
 *   node scripts/dmca-watcher.mjs --dry-run # Preview only
 *   node scripts/dmca-watcher.mjs --days=7  # Scan last 7 days
 *
 * Env vars needed:
 *   GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_ADDRESS
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DAYS_BACK = parseInt((args.find(a => a.startsWith('--days=')) || '--days=30').split('=')[1], 10);

// ── ENV loader ────────────────────────────────────────────────────────────────
function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const eq = line.indexOf('=');
      if (eq < 1) continue;
      const k = line.slice(0, eq).trim();
      const v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (k && !process.env[k]) process.env[k] = v;
    }
    break;
  }
}
loadEnv();

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_ADDRESS } = process.env;

// ── Detection patterns ────────────────────────────────────────────────────────
const DMCA_SENDERS = [
  /abuse@cloudflare\.com/i,
  /dmca[-_]?agent@google\.com/i,
  /legal@google\.com/i,
  /copyright@google\.com/i,
  /lumendatabase\.org/i,
  /antipiracy@/i,
  /takedown@/i,
  /dmca@/i,
  /copyright@(netflix|amazon|disney|sony|warner|universal|paramount)/i,
];

const DMCA_SUBJECTS = [
  /\bdmca\b/i,
  /copyright\s+(infringement|violation|removal)/i,
  /takedown\s+request/i,
  /removal\s+request/i,
  /abuse\s+report/i,
  /manual\s+action/i,
  /infringing\s+content/i,
  /intellectual\s+property/i,
];

// ── Gmail helpers ─────────────────────────────────────────────────────────────
let _token = null, _tokenExp = 0;

async function accessToken() {
  if (_token && Date.now() < _tokenExp) return _token;
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    throw new Error('Gmail OAuth2 credentials missing. Run: npm run dmca:setup -- --client <client_secret.json>');
  }
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!r.ok) throw new Error(`Token refresh failed: ${r.status} ${await r.text()}`);
  const d = await r.json();
  _token = d.access_token;
  _tokenExp = Date.now() + (d.expires_in - 60) * 1000;
  return _token;
}

async function gmailApi(path) {
  const tok = await accessToken();
  const r = await fetch(`https://gmail.googleapis.com/gmail/v1${path}`, {
    headers: { Authorization: `Bearer ${tok}` },
  });
  if (!r.ok) throw new Error(`Gmail API ${path}: ${r.status}`);
  return r.json();
}

// ── Email body decoder ────────────────────────────────────────────────────────
function decodeBody(payload) {
  let text = '';
  function walk(p) {
    if (!p) return;
    if ((p.mimeType === 'text/plain' || p.mimeType === 'text/html') && p.body?.data) {
      let part = Buffer.from(p.body.data, 'base64url').toString('utf8');
      if (p.mimeType === 'text/html') part = part.replace(/<[^>]+>/g, ' ');
      text += part + '\n';
    }
    if (p.parts) p.parts.forEach(walk);
  }
  if (payload?.body?.data) text += Buffer.from(payload.body.data, 'base64url').toString('utf8');
  walk(payload);
  return text;
}

// ── URL extractor ─────────────────────────────────────────────────────────────
export function extractTargets(text) {
  const seen = new Set();
  const targets = [];

  // /movies/slug-tmdbid or /shows/slug-tmdbid. The domain is required: this inbox
  // also gets notices about other sites, whose /movies/ paths are not ours.
  const re1 = /(?:https?:\/\/)?(?:[a-z0-9-]+\.)*(?:net27\.watch|net-27\.cc|net-27-astro\.pages\.dev)\/(?:[a-z]{2}\/)?(movies|shows)\/([a-z0-9](?:[a-z0-9-]*[a-z0-9])?-(\d{4,9}))\/?/gi;
  let m;
  while ((m = re1.exec(text)) !== null) {
    const key = `${m[1]}:${m[3]}`;
    if (!seen.has(key)) {
      seen.add(key);
      targets.push({ type: m[1] === 'movies' ? 'movie' : 'show', slug: m[2], tmdbId: parseInt(m[3], 10) });
    }
  }

  // /player/?type=movie&id=TMDBID (older links: /player?id=TMDBID)
  const re2 = /(?:https?:\/\/)?(?:[a-z0-9-]+\.)*(?:net27\.watch|net-27\.cc|net-27-astro\.pages\.dev)\/player\/?\?(?:[^\s"'<>]*?&)?id=(\d+)/gi;
  while ((m = re2.exec(text)) !== null) {
    const key = `player:${m[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      targets.push({ type: 'player', slug: null, tmdbId: parseInt(m[1], 10) });
    }
  }

  return targets;
}

export function extractCloudflareId(text) {
  // Google: "reference ID when doing so: 5-5498000041661-2024935596"
  const m = text.match(/reference\s+ID[^:\n]*:\s*(\d-\d{6,}-\d{6,})/i) ||
            text.match(/[Rr]eport\s+(?:ID|#):?\s*([a-f0-9]{16,32})/i) ||
            text.match(/\[([a-f0-9]{16,32})\]/);
  return m ? m[1] : null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍 NET27 Watch — DMCA Watcher');
  console.log(`   Mode:    ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Scan:    Last ${DAYS_BACK} days\n`);

  if (!GMAIL_CLIENT_ID) {
    console.error('❌ Gmail credentials not configured.');
    console.error('   Setup: npm run dmca:setup -- --client <client_secret.json>');
    process.exitCode = DRY_RUN ? 0 : 1;
    return;
  }

  const afterTs = Math.floor((Date.now() - DAYS_BACK * 86400_000) / 1000);
  const q = encodeURIComponent(
    `(subject:DMCA OR subject:"copyright infringement" OR subject:"takedown request" ` +
    `OR subject:"abuse report" OR subject:"manual action" OR subject:"copyright removal" ` +
    `OR from:abuse@cloudflare.com OR from:dmca-agent@google.com OR from:legal@google.com) ` +
    `-from:github.com after:${afterTs}`
  );

  console.log('📧 Searching Gmail...');
  const search = await gmailApi(`/users/me/messages?q=${q}&maxResults=100`);
  const msgIds = (search.messages || []).map(m => m.id);
  console.log(`   Candidate emails: ${msgIds.length}\n`);

  const detected = [];

  for (const id of msgIds) {
    const msg = await gmailApi(`/users/me/messages/${id}?format=full`);
    const hdrs = Object.fromEntries((msg.payload?.headers || []).map(h => [h.name.toLowerCase(), h.value]));
    const from = hdrs.from || '';
    const subject = hdrs.subject || '';
    const date = hdrs.date || '';
    const body = decodeBody(msg.payload);
    const fullText = `${from}\n${subject}\n${body}`;
    // Public repo + public Actions logs: never store or print addresses or subjects.
    const fromDomain = (from.match(/@([a-z0-9.-]+)/i) || [])[1]?.toLowerCase() || 'unknown';

    // Our own GitHub issue mails say "DMCA" too; reading them back would open
    // a new issue every run.
    if (/(^|\.)github\.com$/.test(fromDomain)) continue;
    if (!DMCA_SENDERS.some(p => p.test(from)) && !DMCA_SUBJECTS.some(p => p.test(subject))) continue;

    console.log(`📩 Detected notice from ${fromDomain} | Date: ${date}`);

    const targets = extractTargets(fullText);
    const reportId = extractCloudflareId(fullText);

    if (targets.length === 0) {
      console.log(`   ⚠️  No net27.watch URL found — MANUAL REVIEW required\n`);
      detected.push({ messageId: id, date, fromDomain, reportId, targets: [], action: 'manual-review', reason: 'No extractable URL' });
    } else {
      targets.forEach(t => console.log(`   🎯 ${t.type}: ${t.slug || 'player'} (TMDB: ${t.tmdbId})`));
      console.log('');
      detected.push({ messageId: id, date, fromDomain, reportId, targets, action: 'auto-remove' });
    }
  }

  const autoRemove = detected.filter(d => d.action === 'auto-remove');
  const manualReview = detected.filter(d => d.action === 'manual-review');

  console.log('─'.repeat(55));
  console.log(`📊 Auto-remove: ${autoRemove.length} emails (${autoRemove.reduce((s,d) => s+d.targets.length,0)} URLs)`);
  console.log(`   Manual review: ${manualReview.length} emails`);

  if (detected.length === 0) { console.log('\n✅ Inbox clean. No DMCA notices.\n'); return; }

  const queuePath = join(ROOT, 'dmca', 'queue.json');
  if (!existsSync(join(ROOT, 'dmca'))) mkdirSync(join(ROOT, 'dmca'), { recursive: true });

  let q2 = { processed: [], pending: [], manualReview: [] };
  if (existsSync(queuePath)) { try { q2 = JSON.parse(readFileSync(queuePath, 'utf8')); } catch {} }

  // Anything already queued counts as seen, or a manual-review notice would
  // be re-reported on every run.
  const done = new Set([...(q2.processed || []), ...(q2.pending || []), ...(q2.manualReview || [])].map(p => p.messageId));
  const newAuto = autoRemove.filter(d => !done.has(d.messageId));
  const newManual = manualReview.filter(d => !done.has(d.messageId));

  console.log(`   New (unprocessed): ${newAuto.length + newManual.length}`);

  if (DRY_RUN) { console.log('\n[DRY RUN] No files written.\n'); return; }
  if (newAuto.length === 0 && newManual.length === 0) { console.log('\n✅ All already processed.\n'); return; }

  (q2.pending ??= []).push(...newAuto);
  (q2.manualReview ??= []).push(...newManual);
  writeFileSync(queuePath, JSON.stringify(q2, null, 2), 'utf8');
  console.log(`\n✅ Queue updated → dmca/queue.json`);
  if (newManual.length > 0) console.log('⚠️  MANUAL REVIEW: Check dmca/queue.json → manualReview');
  console.log('');

  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `new_auto=${newAuto.length}\nnew_manual=${newManual.length}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => { console.error('Fatal:', err.message); process.exitCode = 1; });
}
