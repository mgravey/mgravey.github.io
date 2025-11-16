const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

(async () => {
  const svgPath = path.join(__dirname, '..', 'assets', 'img', 'favicon.svg');
  const outRoot = path.join(__dirname, '..');
  const outImg = path.join(__dirname, '..', 'assets', 'img');

  const sizes = [16, 32, 48, 64];
  const pngBuffers = [];
  for (const s of sizes) {
    const buf = await sharp(svgPath, { density: 384 })
      .resize(s, s, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    pngBuffers.push(buf);
    await fs.promises.writeFile(path.join(outImg, `favicon-${s}.png`), buf);
  }

  const ico = await toIco(pngBuffers);
  await fs.promises.writeFile(path.join(outRoot, 'favicon.ico'), ico);

  // Apple touch icon (180x180)
  const apple = await sharp(svgPath, { density: 384 })
    .resize(180, 180, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.promises.writeFile(path.join(outImg, 'apple-touch-icon.png'), apple);

  console.log('Favicons generated: favicon.ico, favicon-*.png, apple-touch-icon.png');
})().catch(err => { console.error(err); process.exit(1); });

