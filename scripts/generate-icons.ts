import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const sizes = [
    { name: 'public/pwa-192x192.png', size: 192 },
    { name: 'public/pwa-512x512.png', size: 512 },
    { name: 'public/maskable-icon-512x512.png', size: 512 },
    { name: 'public/apple-touch-icon.png', size: 180 },
    { name: 'public/favicon.png', size: 64 },
  ];

  for (const item of sizes) {
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.resolve(item.name));
    console.log(`Generated ${item.name}`);
  }

  // Generate Android launcher mipmap icons
  const mipmaps = [
    { folder: 'android/app/src/main/res/mipmap-mdpi', size: 48 },
    { folder: 'android/app/src/main/res/mipmap-hdpi', size: 72 },
    { folder: 'android/app/src/main/res/mipmap-xhdpi', size: 96 },
    { folder: 'android/app/src/main/res/mipmap-xxhdpi', size: 144 },
    { folder: 'android/app/src/main/res/mipmap-xxxhdpi', size: 192 },
  ];

  for (const m of mipmaps) {
    const squareTarget = path.resolve(m.folder, 'ic_launcher.png');
    const roundTarget = path.resolve(m.folder, 'ic_launcher_round.png');
    const fgTarget = path.resolve(m.folder, 'ic_launcher_foreground.png');

    await sharp(svgBuffer).resize(m.size, m.size).png().toFile(squareTarget);
    await sharp(svgBuffer).resize(m.size, m.size).png().toFile(roundTarget);
    await sharp(svgBuffer).resize(m.size, m.size).png().toFile(fgTarget);
    console.log(`Generated Android icons for ${m.folder}`);
  }
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
