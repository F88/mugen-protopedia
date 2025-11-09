import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, '..');
const inputImage = join(baseDir, 'public/img/P-640x640.png');
const outputDir = join(baseDir, 'public/icons');

// Icon sizes needed for PWA
// When maskable is true, we generate with padding (safe area) so launchers can crop.
const sizes = [
  // Standard icons
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 256, name: 'icon-256x256.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // Apple Touch Icon

  // Maskable variants (padded)
  { size: 192, name: 'icon-192x192-maskable.png', maskable: true },
  { size: 512, name: 'icon-512x512-maskable.png', maskable: true },
];

// Content scale ratio for maskable icons (keep important content within ~80% area)
const MASKABLE_CONTENT_SCALE = 0.8; // 0.8 = 80% of target box

async function generateStandard(size, name) {
  await sharp(inputImage)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toFile(join(outputDir, name));
}

async function generateMaskable(size, name) {
  const inner = Math.max(1, Math.round(size * MASKABLE_CONTENT_SCALE));

  // Resize source into a smaller square (inner x inner)
  const resizedBuffer = await sharp(inputImage)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  // Create transparent canvas and center-composite the resized content
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: resizedBuffer,
        gravity: 'center',
      },
    ])
    .png()
    .toFile(join(outputDir, name));
}

async function generateIcons() {
  try {
    // Create icons directory
    await mkdir(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);

    // Generate each icon size
    for (const { size, name, maskable } of sizes) {
      if (maskable) {
        await generateMaskable(size, name);
        console.log(`Generated (maskable): ${name} (${size}x${size})`);
      } else {
        await generateStandard(size, name);
        console.log(`Generated: ${name} (${size}x${size})`);
      }
    }

    console.log('\nAll icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
