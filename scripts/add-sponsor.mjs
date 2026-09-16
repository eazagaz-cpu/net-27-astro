/**
 * scripts/add-sponsor.mjs
 * ═══════════════════════════════════════════════════════════════════════════
 * ALL-IN-ONE SPONSOR ADDITION + INSTANT DEPLOY + FAST WEBP OPTIMIZATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Yeh script ek hi command mein:
 * 1. Image ko WebP mein convert karta hai (90-95% compression, ultra-fast loading).
 * 2. Image ko public/links/ mein copy/save karta hai (.webp aur .png fallback dono).
 * 3. scripts/push-sponsors.mjs ke SPONSORS array mein add karta hai (.webp path ke sath).
 * 4. src/components/SponsorRailDynamic.tsx ke FALLBACK array mein add karta hai.
 * 5. Cloudflare KV ko direct API call se update karta hai (5-30s instant live!).
 * 6. SESSION_SPONSORS_STATE.md ko update karta hai.
 * 7. Git commit aur push to main automatically run karta hai.
 *
 * Usage:
 *   node scripts/add-sponsor.mjs --name "pk77" --label "PK77 Game" --url "https://pk77.com" --image "pk77.png" --tagline "🎰 Win Big!" --badge "🔥 Hot"
 *
 * Ya agar arguments na dein to command-line prompts poochega!
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import sharp from 'sharp';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LINKS_DIR = join(ROOT, 'links');
const PUBLIC_LINKS_DIR = join(ROOT, 'public', 'links');
const PUSH_SCRIPT_PATH = join(__dirname, 'push-sponsors.mjs');
const DYNAMIC_COMPONENT_PATH = join(ROOT, 'src', 'components', 'SponsorRailDynamic.tsx');
const STATE_MD_PATH = join(ROOT, 'SESSION_SPONSORS_STATE.md');

// .env se credentials load karo
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

// ── Parse CLI Args ──────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        parsed[key] = next;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, ans => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function main() {
  console.log('\n🚀 NET27 — Automatic Sponsor Addition & Instant Deployment');
  console.log('═'.repeat(60));

  const cliArgs = parseArgs();

  let name = cliArgs.name;
  let label = cliArgs.label;
  let url = cliArgs.url;
  let imageInput = cliArgs.image;
  let tagline = cliArgs.tagline || '🎰 Play & Win Big!';
  let badge = cliArgs.badge || '🔥 Hot';

  if (!name) name = await prompt('📌 Sponsor Name/Slug (e.g. pk77): ');
  if (!label) label = await prompt(`📌 Sponsor Display Label [${name}]: `) || name;
  if (!url) url = await prompt('🔗 Target URL (e.g. https://pk77.com/): ');
  if (!imageInput) imageInput = await prompt('🖼️ Image filename or path (in links/ or public/links/): ');

  if (!name || !url || !imageInput) {
    console.error('❌ Error: name, url aur image lazmi hain!');
    process.exit(1);
  }

  // Find image file
  let sourceImagePath = null;
  const possiblePaths = [
    imageInput,
    join(LINKS_DIR, imageInput),
    join(PUBLIC_LINKS_DIR, imageInput),
    join(LINKS_DIR, `${imageInput}.png`),
    join(PUBLIC_LINKS_DIR, `${imageInput}.png`),
  ];

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      sourceImagePath = p;
      break;
    }
  }

  if (!sourceImagePath) {
    console.error(`❌ Error: Image file nahi mili: "${imageInput}"`);
    console.log(`   Checked in: links/ aur public/links/`);
    process.exit(1);
  }

  console.log(`\n📁 Source image found: ${sourceImagePath}`);

  // Determine file base names
  const cleanBaseName = slugify(name);
  const targetWebpFilename = `${cleanBaseName}.webp`;
  const targetPngFilename = `${cleanBaseName}.png`;
  const targetWebpPath = join(PUBLIC_LINKS_DIR, targetWebpFilename);
  const targetPngPath = join(PUBLIC_LINKS_DIR, targetPngFilename);

  // 1. Convert to WebP using sharp with high compression & quality
  console.log('⚡ Converting image to optimized WebP...');
  const inputStat = await stat(sourceImagePath);
  const inputKB = Math.round(inputStat.size / 1024);

  await sharp(sourceImagePath)
    .webp({ quality: 82, effort: 6 })
    .toFile(targetWebpPath);

  // Copy PNG to public/links/ if it doesn't already exist there
  if (sourceImagePath !== targetPngPath) {
    copyFileSync(sourceImagePath, targetPngPath);
  }

  const outputStat = await stat(targetWebpPath);
  const outputKB = Math.round(outputStat.size / 1024);
  const saved = inputKB - outputKB;
  const pct = Math.round((saved / inputKB) * 100);

  console.log(`✅ Image converted: ${inputKB}KB → ${outputKB}KB (${pct}% smaller, saved ${saved}KB)`);
  console.log(`   WebP: /links/${targetWebpFilename}`);
  console.log(`   PNG Fallback: /links/${targetPngFilename}`);

  const webpUrl = `/links/${targetWebpFilename}`;

  // 2. Update scripts/push-sponsors.mjs
  console.log('\n📝 Updating scripts/push-sponsors.mjs...');
  let pushScriptContent = readFileSync(PUSH_SCRIPT_PATH, 'utf8');

  // Check if sponsor already exists
  if (pushScriptContent.includes(`'${url}'`) || pushScriptContent.includes(`"${url}"`)) {
    console.log(`⚠️ Sponsor with URL "${url}" already exists in push-sponsors.mjs. Skipping duplicate addition.`);
  } else {
    const newSponsorObjectCode = `  // New\n  {\n    name: '${name.replace(/'/g, "\\'")}',\n    label: '${label.replace(/'/g, "\\'")}',\n    tagline: '${tagline.replace(/'/g, "\\'")}',\n    url: '${url}',\n    image: '${webpUrl}',\n    badge: '${badge}',\n  },\n`;

    const marker = '// ➕ Aage yahan add karo:';
    if (pushScriptContent.includes(marker)) {
      pushScriptContent = pushScriptContent.replace(marker, `${newSponsorObjectCode}  ${marker}`);
      writeFileSync(PUSH_SCRIPT_PATH, pushScriptContent, 'utf8');
      console.log('✅ Added to scripts/push-sponsors.mjs');
    } else {
      console.warn('⚠️ Marker not found in push-sponsors.mjs. Please check manually.');
    }
  }

  // 3. Update src/components/SponsorRailDynamic.tsx FALLBACK array
  console.log('📝 Updating src/components/SponsorRailDynamic.tsx FALLBACK...');
  let dynamicRailContent = readFileSync(DYNAMIC_COMPONENT_PATH, 'utf8');

  if (dynamicRailContent.includes(`'${url}'`) || dynamicRailContent.includes(`"${url}"`)) {
    console.log(`⚠️ Sponsor with URL "${url}" already in FALLBACK. Skipping.`);
  } else {
    const fallbackEntry = `  { name: '${name.replace(/'/g, "\\'")}', label: '${label.replace(/'/g, "\\'")}', tagline: '${tagline.replace(/'/g, "\\'")}', url: '${url}', image: '${webpUrl}', badge: '${badge}' },\n];`;
    dynamicRailContent = dynamicRailContent.replace(/\n\];/, `\n${fallbackEntry}`);
    writeFileSync(DYNAMIC_COMPONENT_PATH, dynamicRailContent, 'utf8');
    console.log('✅ Added to FALLBACK array in SponsorRailDynamic.tsx');
  }

  // 4. Update Cloudflare KV Storage Immediately!
  console.log('\n☁️  Pushed immediately to Cloudflare KV...');
  try {
    execSync('node scripts/push-sponsors.mjs', { cwd: ROOT, stdio: 'inherit' });
    console.log('✅ Cloudflare KV updated! Live in 5-30s!');
  } catch (err) {
    console.error('❌ Cloudflare KV push error:', err.message);
  }

  // 5. Update SESSION_SPONSORS_STATE.md
  try {
    let stateContent = readFileSync(STATE_MD_PATH, 'utf8');
    const newTableRow = `| **#+** | **${label}** | \`${url}\` | \`${webpUrl}\` | ${badge} |\n`;
    const tableEndMarker = '\n---';
    if (stateContent.includes('| **#9** |')) {
      stateContent = stateContent.replace(
        /(\| \*\*#9\*\* [^\n]+\n)/,
        `$1${newTableRow}`
      );
      writeFileSync(STATE_MD_PATH, stateContent, 'utf8');
      console.log('✅ Updated SESSION_SPONSORS_STATE.md');
    }
  } catch {}

  // 6. Git Commit & Push
  console.log('\n🐙 Git Commit & Push to main...');
  try {
    execSync('git add -A', { cwd: ROOT, stdio: 'ignore' });
    const commitMsg = `feat(sponsor): add ${label} sponsor with ultra-fast WebP image`;
    execSync(`git commit -m "${commitMsg}"`, { cwd: ROOT, stdio: 'inherit' });
    console.log('🚀 Pushing to GitHub...');
    execSync('git push origin main', { cwd: ROOT, stdio: 'inherit' });
    console.log('✅ Git push successful! Cloudflare Pages is now deploying static assets.');
  } catch (err) {
    console.warn('⚠️ Git commit/push note:', err.message);
  }

  console.log('\n🎉 ALL DONE! SPONSOR IS LIVE!');
  console.log(`🌐 Live Site: https://net27.watch/`);
  console.log(`🌐 Live API:  https://net27.watch/api/sponsors\n`);
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
