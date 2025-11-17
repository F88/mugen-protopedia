import type { Metadata, Viewport } from 'next';
import {
  APP_TITLE,
  APP_DESCRIPTION,
  APP_URL,
  APP_OG_IMAGE,
  APP_KEYWORDS,
} from './app-constants';
import { ENV } from './env';

/**
 * Build base site metadata consumed by Next.js Metadata API.
 */
export function buildBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(APP_URL),
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    keywords: [...APP_KEYWORDS],
    applicationName: APP_TITLE,
    authors: [{ name: 'F88', url: 'https://github.com/F88' }],
    creator: 'F88',
    publisher: 'F88',
    alternates: { canonical: APP_URL },
    icons: {
      icon: [
        { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: [{ url: '/icons/favicon.ico' }],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: APP_TITLE,
    },
    formatDetection: { telephone: false },
    openGraph: {
      type: 'website',
      url: APP_URL,
      siteName: APP_TITLE,
      title: APP_TITLE,
      description: APP_DESCRIPTION,
      images: [
        {
          url: APP_OG_IMAGE,
          width: 2300,
          height: 1294,
          alt: `${APP_TITLE} - ${APP_DESCRIPTION}`,
        },
      ],
      locale: 'ja_JP',
    },
    twitter: {
      card: 'summary_large_image',
      title: APP_TITLE,
      description: APP_DESCRIPTION,
      images: [APP_OG_IMAGE],
      creator: '@F88',
    },
    ...(ENV.GOOGLE_SITE_VERIFICATION_TOKEN
      ? { verification: { google: ENV.GOOGLE_SITE_VERIFICATION_TOKEN } }
      : {}),
  };
}

/**
 * Build viewport configuration (Next.js App Router).
 */
export function buildViewport(): Viewport {
  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
  };
}
