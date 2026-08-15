const fs = require('fs');

async function generate() {
  // Try sharp first
  try {
    const sharp = require('sharp');
    const svgBuf = fs.readFileSync('public/favicon.svg');
    await Promise.all([
      sharp(svgBuf).resize(192, 192).png().toFile('public/icons/icon-192.png'),
      sharp(svgBuf).resize(512, 512).png().toFile('public/icons/icon-512.png'),
    ]);
    console.log('Icons generated with sharp');
    return;
  } catch {}

  // Try canvas
  try {
    const { createCanvas } = require('canvas');
    for (const size of [192, 512]) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0B0B0F';
      ctx.beginPath();
      const r = size * 0.1875;
      ctx.moveTo(r, 0);
      ctx.lineTo(size - r, 0);
      ctx.quadraticCurveTo(size, 0, size, r);
      ctx.lineTo(size, size - r);
      ctx.quadraticCurveTo(size, size, size - r, size);
      ctx.lineTo(r, size);
      ctx.quadraticCurveTo(0, size, 0, size - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fill();
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#FF3045');
      grad.addColorStop(1, '#7C3AED');
      ctx.fillStyle = grad;
      const fontSize = Math.round(size * 0.44);
      ctx.font = 'bold ' + fontSize + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N27', size / 2, size / 2 + Math.round(size * 0.04));
      fs.writeFileSync('public/icons/icon-' + size + '.png', canvas.toBuffer('image/png'));
      console.log('Generated icon-' + size + '.png via canvas');
    }
    return;
  } catch (e) {
    console.log('canvas not available:', e.message);
  }

  // Fallback: copy SVG as placeholder
  fs.copyFileSync('public/favicon.svg', 'public/icons/icon-192.png');
  fs.copyFileSync('public/favicon.svg', 'public/icons/icon-512.png');
  console.log('SVG fallback copies placed at public/icons/');
}

generate().catch(console.error);
