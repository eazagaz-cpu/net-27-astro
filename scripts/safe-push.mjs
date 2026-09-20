/**
 * scripts/safe-push.mjs
 * ═══════════════════════════════════════════════════════════════════
 * BULLETPROOF GIT PUSH FOR NET-27.CC
 * 
 * Yeh script ensure karta hai:
 * 1. Account hamesha 'eazagaz-cpu' hi use ho (kisi aur account se conflict na ho)
 * 2. Remote commits (jaise TMDB cache refresh) pehle automatically rebase hon
 * 3. 403 Forbidden ya credentials popup kabhi na aaye
 * 4. Smooth push to origin main
 * ═══════════════════════════════════════════════════════════════════
 */

import { execSync } from 'child_process';

function run(cmd, desc) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { ok: true, out: out.trim() };
  } catch (err) {
    return {
      ok: false,
      err: (err.stderr || err.stdout || err.message || '').toString().trim()
    };
  }
}

async function main() {
  console.log('\n🛡️  Starting Bulletproof Git Safe Push...');
  console.log('═'.repeat(50));

  // 1. Lock remote URL to eazagaz-cpu
  const targetUrl = 'https://eazagaz-cpu@github.com/eazagaz-cpu/net-27-astro.git';
  run(`git remote set-url origin ${targetUrl}`);
  run('git config --local credential.https://github.com.username eazagaz-cpu');
  run('git config --local user.name "eazagaz-cpu"');
  run('git config --local user.email "eazagaz-cpu@users.noreply.github.com"');
  console.log('✅ Local repo locked to account: eazagaz-cpu');

  // 2. Ensure gh CLI active account is eazagaz-cpu
  const ghSwitch = run('gh auth switch --user eazagaz-cpu');
  if (ghSwitch.ok) {
    console.log('✅ gh CLI active account verified: eazagaz-cpu');
  }

  // 3. Stage & Commit if uncommitted changes exist
  const statusRes = run('git status --porcelain');
  if (statusRes.ok && statusRes.out.length > 0) {
    console.log('📦 Found uncommitted changes, staging...');
    run('git add -A');
    const msg = process.argv.slice(2).join(' ') || 'chore: auto-sync sponsors and updates';
    const commitRes = run(`git commit -m "${msg}"`);
    if (commitRes.ok) {
      console.log(`✅ Committed: "${msg}"`);
    }
  } else {
    console.log('ℹ️  Working tree is clean.');
  }

  // 4. Fetch & Rebase to incorporate any remote cache refreshes
  console.log('🔄 Pulling remote changes (git pull --rebase origin main)...');
  const pullRes = run('git pull --rebase origin main');
  if (!pullRes.ok) {
    console.error('❌ Error during rebase pull:', pullRes.err);
    console.log('💡 Tip: Agar conflict aya ho to solve karein, ya `git rebase --abort` karein.');
    process.exit(1);
  }
  console.log('✅ Rebase pull successful (origin/main in sync)');

  // 5. Push to origin main
  console.log('🚀 Pushing to origin main...');
  const pushRes = run('git push origin main');
  if (!pushRes.ok) {
    console.error('❌ Push failed:', pushRes.err);
    process.exit(1);
  }

  console.log('🎉 PUSH SUCCESSFUL! GitHub Actions deploy will trigger automatically.');
  console.log('═'.repeat(50) + '\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
