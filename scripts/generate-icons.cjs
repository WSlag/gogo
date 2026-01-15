const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const inputPath = path.join(__dirname, '../public/icons/logo.jpg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating PWA icons from logo.jpg...\n');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon (180x180)
  const appleTouchPath = path.join(outputDir, 'apple-touch-icon.png');
  await sharp(inputPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(appleTouchPath);
  console.log('✓ Generated apple-touch-icon.png');

  // Generate favicon.ico (using 32x32)
  const faviconPath = path.join(outputDir, 'favicon.png');
  await sharp(inputPath)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(faviconPath);
  console.log('✓ Generated favicon.png');

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
