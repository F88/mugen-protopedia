import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '無限ProtoPedia',
    short_name: '∞PP',
    description:
      '仕事中のおさぼりから酒宴のつまみにも、寝酒のお供に、気付けば夜更け、朝ぼらけ',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-256x256.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    // Add screenshots to enable Richer PWA Install UI on desktop and mobile
    // Ref: https://developer.chrome.com/docs/web-platform/web-app-install-banners/#add-screenshots
    screenshots: [
      // Mobile (narrow) screenshot
      {
        src: '/screenshots/ss-mobile-dark.png',
        sizes: '780x1682',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Random prototype list on mobile (dark mode)',
      },
      // Desktop wide screenshot (light mode)
      {
        src: '/screenshots/ss-fhd-light.png',
        sizes: '2300x1294',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Prototype dashboard on desktop (light mode)',
      },
      // Additional wide screenshot (dark mode)
      {
        src: '/screenshots/ss-4k-dark.png',
        sizes: '2300x1294',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Prototype dashboard on desktop (dark mode)',
      },
    ],
  };
}
