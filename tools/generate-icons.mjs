/**
 * @file generate-icons.mjs
 * @description Utility script to generate PWA / Apple Touch / maskable icons from a single
 * base image. Produces a set of PNG assets in `public/icons/` used by the web app's
 * manifest and layout metadata.
 *
 * USAGE:
 *   node tools/generate-icons.mjs [--input <path>] [--out-dir <path>] [--dry-run] [--verbose]
 *   (From repo root. Requires that dependencies including `sharp` are installed.)
 *
 * CLI FLAGS:
 *   --input <path>    Override source image (default: public/img/P-640x640.png)
 *   --out-dir <path>  Override output directory (default: public/icons)
 *   --dry-run         Show planned outputs without writing any files
 *   --verbose         Print detailed configuration and planned sizes
 *   --help | -h       Show usage help and exit
 *
 * PREREQUISITES:
 *   - Source image must exist at `public/img/P-640x640.png` (transparent PNG preferred).
 *   - The image should have important visual content centered so maskable icons crop cleanly.
 *
 * GENERATED OUTPUT DIRECTORY:
 *   public/icons/
 *   Contains standard icons, Apple Touch icon, and maskable variants. Sizes currently defined:
 *     Standard: 72, 96, 128, 144, 152, 180 (apple-touch), 192, 256, 384, 512
 *     Maskable: 192, 512 (padded via safe area scale 0.8)
 *
 * MASKABLE ICON STRATEGY:
 *   We downscale the original to 80% (`MASKABLE_CONTENT_SCALE`) then composite onto a
 *   transparent canvas. Adjust `MASKABLE_CONTENT_SCALE` if you need more or less padding.
 *
 * CUSTOMIZATION:
 *   - Change `inputImage` if the source file path or name differs.
 *   - Add/remove entries in the `sizes` array to alter generated variants.
 *   - To include favicons (16x16 / 32x32 / multi-size .ico), you can append additional
 *     entries here (PNG) and optionally create an ICO via `sharp` or a dedicated tool.
 *
 * ERROR HANDLING:
 *   Script exits with code 1 if the input image is missing or an unexpected error occurs.
 *
 * INTEGRATION NOTES:
 *   After generating icons, ensure `app/manifest.ts` lists all required sizes and `app/layout.tsx`
 *   includes appropriate <link rel="icon"> and <link rel="apple-touch-icon"> tags.
 *
 * FUTURE IMPROVEMENTS (Ideas):
 *   - Accept CLI flags for input path, output dir, content scale.
 *   - Auto-generate favicon.ico from multiple sizes.
 *   - Add --dry-run to preview actions.
 *
 * @example
 *   // Generate assets
 *   node tools/generate-icons.mjs
 *
 * @example
 *   // Dry run to preview outputs
 *   node tools/generate-icons.mjs --dry-run --verbose
 *
 * @example
 *   // Custom input and output directory
 *   node tools/generate-icons.mjs --input public/img/logo.png --out-dir public/assets/icons
 *
 * @see Issue #9 (Create icons and visual assets for web app)
 */
import sharp from 'sharp';

// -----------------------------
// CLI Flag Parsing (lightweight)
// -----------------------------
// Supported flags:
//   --input <path>    : Source image path override.
//   --out-dir <path>  : Output directory override.
//   --dry-run         : List planned outputs without writing files.
//   --verbose         : Extra logging details (timing, paths).

const argv = process.argv.slice(2);
// Collect warnings during early parse, printed later once verbosity known.
const pendingWarnings = [];
function getFlagValue(name) {
  const idx = argv.indexOf(name);
  if (idx === -1) return undefined;
  const candidate = argv[idx + 1];
  // No argument follows OR next token is another flag -> treat as missing value
  if (candidate === undefined || candidate.startsWith('-')) {
    // Emit a warning for flags that expect a value when verbose mode requested later.
    // We cannot yet check VERBOSE (declared after parsing), so we store warnings.
    pendingWarnings.push(`Flag ${name} provided without a value; ignoring.`);
    return undefined;
  }
  return candidate;
}
function hasFlag(name) {
  return argv.includes(name);
}

function showHelpAndExit() {
  console.log(
    `Usage: node tools/generate-icons.mjs [options]\n\n` +
      `Options:\n` +
      `  --input <path>    Source image (default: public/img/P-640x640.png)\n` +
      `  --out-dir <path>  Output directory (default: public/icons)\n` +
      `  --dry-run         List actions without writing files\n` +
      `  --verbose         Detailed configuration output\n` +
      `  --help, -h        Show this help\n\n` +
      `Examples:\n` +
      `  node tools/generate-icons.mjs\n` +
      `  node tools/generate-icons.mjs --dry-run --verbose\n` +
      `  node tools/generate-icons.mjs --input public/img/logo.png --out-dir public/assets/icons\n`,
  );
  process.exit(0);
}

if (hasFlag('--help') || hasFlag('-h')) {
  showHelpAndExit();
}
import { mkdir, access } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { constants } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, '..');
const inputVal = getFlagValue('--input');
const outDirVal = getFlagValue('--out-dir');

const inputImage = inputVal
  ? join(process.cwd(), inputVal)
  : join(baseDir, 'public/img/P-640x640.png');
const outputDir = outDirVal
  ? join(process.cwd(), outDirVal)
  : join(baseDir, 'public/icons');
const DRY_RUN = hasFlag('--dry-run');
const VERBOSE = hasFlag('--verbose');

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
  if (DRY_RUN) return; // Skip actual write
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
  if (DRY_RUN) return; // Skip actual write
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
    // Validate input image exists
    try {
      await access(inputImage, constants.R_OK);
    } catch {
      console.error(`Error: Input image not found at ${inputImage}`);
      console.error(
        'Please ensure the file exists before running this script or pass --input <path>.',
      );
      process.exit(1);
    }

    if (!DRY_RUN) {
      await mkdir(outputDir, { recursive: true });
      console.log(`Created directory: ${outputDir}`);
    } else {
      console.log(`[dry-run] Would create directory: ${outputDir}`);
    }

    if (VERBOSE) {
      if (pendingWarnings.length > 0) {
        console.warn('Warnings:');
        pendingWarnings.forEach((w) => console.warn('  ' + w));
      }
      console.log('Configuration:');
      console.log(`  inputImage: ${inputImage}`);
      console.log(`  outputDir : ${outputDir}`);
      console.log(`  dryRun    : ${DRY_RUN}`);
      console.log(`  verbose   : ${VERBOSE}`);
      console.log(`  maskable content scale: ${MASKABLE_CONTENT_SCALE}`);
      console.log('Planned sizes:');
      sizes.forEach(({ size, name, maskable }) => {
        console.log(
          `  - ${name} (${size}x${size})${maskable ? ' [maskable]' : ''}`,
        );
      });
    }

    // Generate each icon size
    for (const { size, name, maskable } of sizes) {
      if (maskable) {
        await generateMaskable(size, name);
        console.log(
          `${DRY_RUN ? '[dry-run] Would generate (maskable):' : 'Generated (maskable):'} ${name} (${size}x${size})`,
        );
      } else {
        await generateStandard(size, name);
        console.log(
          `${DRY_RUN ? '[dry-run] Would generate:' : 'Generated:'} ${name} (${size}x${size})`,
        );
      }
    }

    console.log(
      `\n${DRY_RUN ? 'Dry-run complete (no files written).' : 'All icons generated successfully!'}`,
    );
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
