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
 * IMPORTANT: the maskable and apple icons add a safe-area margin that the
 * preset fills with WHITE by default. Our source master is opaque black, so we
 * override that fill to #000000 to keep the padding seamless and on-theme.
 * Do NOT remove these overrides — without them the maskable icon renders with a
 * white border.
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
      ...minimal2023Preset.apple,
      resizeOptions: {
        ...minimal2023Preset.apple.resizeOptions,
        background: '#000000',
      },
    },
  },
  images: ['public/icons/icon-1024x1024.png'],
});
