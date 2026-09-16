/**
 * Sponsor images ko PNG se WebP mein convert karta hai
 * WebP = 80-90% smaller size, fast load
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LINKS_DIR = join(__dirname, '..', 'public', 'links');

async function convertImages() {
  const files = await readdir(LINKS_DIR);
  const pngs = files.filter(f => extname(f).toLowerCase() === '.png');

  console.log(`\n🖼️  Found ${pngs.length} PNG images to convert...\n`);

  let totalSaved = 0;

  for (const file of pngs) {
    const inputPath = join(LINKS_DIR, file);
    const outputName = basename(file, '.png') + '.webp';
    const outputPath = join(LINKS_DIR, outputName);

    const inputStat = await stat(inputPath);
    const inputKB = Math.round(inputStat.size / 1024);

    await sharp(inputPath)
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath);

    const outputStat = await stat(outputPath);
    const outputKB = Math.round(outputStat.size / 1024);
    const saved = inputKB - outputKB;
    const pct = Math.round((saved / inputKB) * 100);
    totalSaved += saved;

    console.log(`✅ ${file}`);
    console.log(`   PNG: ${inputKB}KB  →  WebP: ${outputKB}KB  (${pct}% smaller, saved ${saved}KB)\n`);
  }

  console.log(`🎉 Done! Total saved: ~${Math.round(totalSaved / 1024)}MB across ${pngs.length} images\n`);
}

convertImages().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
