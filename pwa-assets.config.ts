import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config';

/**
 * PWA asset generation (standalone CLI). Run: `npm run generate-pwa-assets`.
 *
 * This project is Next.js (not Vite), so the generated `<link>` / manifest
 * snippets are NOT auto-injected. The head is hand-written in
 * `lib/config/metadata.ts` and the manifest in `app/manifest.ts`; keep the
 * filenames there in sync with what this generates. Source and outputs live
 * under `public/icons/` so URLs stay under `/icons/`.
 *
 * IMPORTANT: the maskable icon keeps a safe-area margin that the preset fills
 * with WHITE by default. Our source master is opaque black, so we override that
 * fill to #000000 to keep the maskable padding seamless and on-theme. Do NOT
 * remove the maskable override — without it the maskable icon renders with a
 * white border. The apple icon uses `padding: 0` (full-bleed); iOS applies its
 * own rounded mask, so no extra margin is wanted.
 */
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: {
        ...minimal2023Preset.maskable.resizeOptions,
        background: '#000000',
      },
    },
    apple: {
      sizes: [180],
      padding: 0, // full-bleed; iOS applies its own rounded mask
    },
  },
  images: ['public/icons/icon-1024x1024.png'],
});
