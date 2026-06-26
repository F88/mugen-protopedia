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
 */
export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: minimal2023Preset,
  images: ['public/icons/icon-1024x1024.png'],
});
