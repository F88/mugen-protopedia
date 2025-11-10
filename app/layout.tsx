/**
 * @fileoverview Next.js root layout and site‑wide metadata.
 *
 * This file defines:
 * - Centralized metadata via Next.js Metadata API (Open Graph, Twitter, PWA hints).
 * - The root layout (`<html>`, `<head>`, `<body>`) applied to every page.
 * - JSON‑LD structured data injection for SEO.
 * - Early theme bootstrapping script to avoid FOUC when toggling dark mode.
 * - Vercel Analytics and Service Worker registration.
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';

import './globals.css';

import { ServiceWorkerRegister } from '@/components/sw-register';

const inter = Inter({ subsets: ['latin'] });

// Centralized metadata constants to avoid duplication and ease future updates.
const APP_TITLE = '無限ProtoPedia';
const APP_DESCRIPTION =
  '仕事中のおさぼりから酒宴のつまみにも、寝酒のお供に、気付けば夜更け、朝ぼらけ';
const APP_URL = 'https://mugen-pp.vercel.app';
const APP_OG_IMAGE = `${APP_URL}/screenshots/ss-fhd-light.png`;
const APP_KEYWORDS = [
  'ProtoPedia',
  'プロトタイプ',
  'プロトタイピング',
  '無限',
  '無限Viewer',
  'IoT',
  'Maker',
  'メイカー',
  'ものづくり',
  'ハッカソン',
  'コンテスト',
  '電子工作',
];
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION_TOKEN;

/**
 * Site‑wide metadata consumed by Next.js at build/runtime.
 *
 * Notes:
 * - `metadataBase` is used by Next.js to resolve relative URLs.
 * - `icons.apple` are handled by Next.js and injected into `<head>`.
 * - When `GOOGLE_SITE_VERIFICATION_TOKEN` is present, the verification meta is
 *   attached automatically via the `verification.google` field.
 *
 * @remarks Next.js 15
 * see Functions: generateMetadata | Next.js https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata
 * see Functions: generateViewport | Next.js https://nextjs.org/docs/15/app/api-reference/functions/generate-viewport
 *
 * @remarks Next.js 16
 * see Functions: generateMetadata | Next.js https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 * see Functions: generateViewport | Next.js https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 */
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  keywords: APP_KEYWORDS,
  applicationName: APP_TITLE,
  authors: [{ name: 'F88', url: 'https://github.com/F88' }],
  creator: 'F88',
  publisher: 'F88',
  alternates: {
    canonical: APP_URL,
  },
  icons: {
    // Generic icons (optional but useful for some platforms)
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    // Apple touch icon generated in <head> automatically by Next.js
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
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
        alt: `${APP_TITLE} - ProtoPediaのプロトタイプをランダムに表示`,
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
  // Add site verification meta via Next.js Metadata API when the token is provided.
  ...(GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

/**
 * Root layout component that wraps all application routes.
 *
 * Responsibilities:
 * - Sets document language and hydration suppression flags.
 * - Injects JSON‑LD structured data for `WebSite` and `WebApplication`.
 * - Boots theme state before React hydration to prevent flash of wrong theme.
 * - Renders global providers/components such as Analytics and SW register.
 *
 * @param props.children React subtree to render inside the layout.
 * @returns The application root HTML structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${APP_URL}/#website`,
        url: APP_URL,
        name: APP_TITLE,
        description: APP_DESCRIPTION,
        inLanguage: 'ja',
      },
      {
        '@type': 'WebApplication',
        '@id': `${APP_URL}/#webapplication`,
        url: APP_URL,
        name: APP_TITLE,
        description: APP_DESCRIPTION,
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'JPY',
        },
        author: {
          '@type': 'Person',
          name: 'F88',
          url: 'https://github.com/F88',
        },
        inLanguage: 'ja',
      },
    ],
  };

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/** Apple touch icon will be injected by Next.js metadata (icons.apple) */}
        {/** JSON-LD structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  if (theme === 'dark' || theme === 'light') {
                    window.__theme = theme;
                  } else {
                    window.__theme = 'light';
                  }

                  if (window.__theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  window.__theme = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors`}
      >
        {children}
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
