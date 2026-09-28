/**
 * sponsor-thumbs.mjs — 192×192 WebP thumbnails for the sponsor rails.
 *
 * The rails show each logo at 96×96 CSS px, but the page used the full
 * public/links/*.webp files: ~2 MB for 20 logos, loading on mobile alongside
 * the hero image and pushing LCP out (Lighthouse, 2026-09-28). The rails are
 * server-rendered from these thumbnails (192 px = sharp at 2× DPR); the live
 * KV list already carries the same size inline as imageData.
 *
 *   node scripts/sponsor-thumbs.mjs      (add-sponsor runs it; verify-links checks it)
 *
 * Writes public/links/thumbs/<imageFile> for every manifest entry, skipping
 * thumbnails that are newer than their source.
 */
import { existsSync, mkdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import sharp from 'sharp';
import { ROOT, loadManifest } from './lib/sponsor-guard.mjs';

export const THUMB_DIR = join(ROOT, 'public', 'links', 'thumbs');
export const thumbFile = (s) => s.imageFile || basename(s.image);

export async function makeSponsorThumbs() {
  mkdirSync(THUMB_DIR, { recursive: true });
  const m = loadManifest();
  let made = 0;
  for (const s of [...m.trail1, ...m.trail2]) {
    const file = thumbFile(s);
    const src = join(ROOT, 'public', 'links', file);
    const out = join(THUMB_DIR, file);
    if (!existsSync(src)) { console.warn(`⚠️  source image missing: public/links/${file}`); continue; }
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) continue;
    await sharp(src)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 82, effort: 6 })
      .toFile(out);
    made++;
  }
  return made;
}

if (process.argv[1] && process.argv[1].endsWith('sponsor-thumbs.mjs')) {
  const made = await makeSponsorThumbs();
  console.log(`✅ sponsor thumbnails: ${made} written to public/links/thumbs/`);
}
