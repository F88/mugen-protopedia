import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputDir = join(__dirname, 'images');

await mkdir(outputDir, { recursive: true });

// 1. Good image - normal brightness and contrast, correct dimensions
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 100, g: 150, b: 200, alpha: 1 },
  },
})
  .composite([
    {
      input: await sharp({
        create: {
          width: 256,
          height: 256,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .png()
        .toBuffer(),
      gravity: 'center',
    },
  ])
  .png()
  .toFile(join(outputDir, 'icon-512x512.png'));

// 2. Too dark image
await sharp({
  create: {
    width: 192,
    height: 192,
    channels: 3,
    background: { r: 10, g: 10, b: 10 },
  },
})
  .png()
  .toFile(join(outputDir, 'icon-192x192-dark.png'));

// 3. Too bright image
await sharp({
  create: {
    width: 192,
    height: 192,
    channels: 3,
    background: { r: 250, g: 250, b: 250 },
  },
})
  .png()
  .toFile(join(outputDir, 'icon-192x192-bright.png'));

// 4. Low contrast (flat) image
await sharp({
  create: {
    width: 128,
    height: 128,
    channels: 3,
    background: { r: 128, g: 128, b: 128 },
  },
})
  .png()
  .toFile(join(outputDir, 'icon-128x128-flat.png'));

// 5. Wrong dimensions
await sharp({
  create: {
    width: 200,
    height: 200,
    channels: 3,
    background: { r: 100, g: 150, b: 200 },
  },
})
  .png()
  .toFile(join(outputDir, 'icon-512x512-wrong.png'));

// 6. High transparency
await sharp({
  create: {
    width: 256,
    height: 256,
    channels: 4,
    background: { r: 100, g: 150, b: 200, alpha: 0.2 },
  },
})
  .png()
  .toFile(join(outputDir, 'icon-256x256-transparent.png'));

// 7. Good image with proper contrast
await sharp({
  create: {
    width: 192,
    height: 192,
    channels: 4,
    background: { r: 50, g: 100, b: 150, alpha: 1 },
  },
})
  .composite([
    {
      input: await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4,
          background: { r: 200, g: 220, b: 240, alpha: 1 },
        },
      })
        .png()
        .toBuffer(),
      gravity: 'center',
    },
  ])
  .png()
  .toFile(join(outputDir, 'icon-192x192.png'));

console.log('Test fixtures created successfully!');
