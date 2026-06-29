/**
 * @fileoverview Next.js root layout and site‑wide metadata.
 *
 * This file defines:
 * - Centralized metadata via Next.js Metadata API (Open Graph, Twitter, PWA hints).
 * - The root layout (`<html>`, `<body>`) applied to every page.
 * - JSON‑LD structured data injection for SEO.
 * - Early theme bootstrapping script to avoid FOUC when toggling dark mode.
 * - Vercel Analytics and Service Worker registration.
 */
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';

import './globals.css';

import { ServiceWorkerRegister } from '@/components/sw-register';

const inter = Inter({ subsets: ['latin'] });

// Import centralized constants and metadata builders.
import {
  APP_TITLE,
  APP_DESCRIPTION,
  APP_URL,
} from '@/lib/config/app-constants';
import { buildBaseMetadata, buildViewport } from '@/lib/config/metadata';

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
export const metadata: Metadata = buildBaseMetadata();

/**
 * Viewport configuration (Next.js App Router).
 *
 * Moved `themeColor` here per Next.js warning:
 * "Unsupported metadata themeColor is configured in metadata export. Please move it to viewport export instead.".
 * See: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 */
export const viewport: Viewport = buildViewport();

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
      {/**
       * Do NOT add a hand-written `<head>` here. In the App Router, a manual
       * `<head>` in the root layout breaks the insertion point of the Metadata
       * API, pushing `<title>`, `<link rel="manifest">`,
       * `<meta name="description">` and `og:*` into `<body>` (Chrome then
       * reports "No manifest detected"). Head tags are owned by the Metadata
       * API; the early theme script below runs as a plain inline `<script>` in
       * `<body>` (see the note there for why `next/script` is not used).
       */}
      <body className={`${inter.className} min-h-screen`}>
        {/**
         * Early theme bootstrapping to avoid FOUC (flash of wrong theme).
         *
         * This MUST be a plain inline `<script>` (not `next/script`): only a raw
         * inline script in the server HTML executes synchronously during parse,
         * before the body paints, so the `dark` class is set in time.
         * `next/script` (even `beforeInteractive`) defers execution via the
         * `self.__next_s` queue, which runs after first paint and reintroduces
         * the flash. Keeping it as the first child of `<body>` runs it ahead of
         * any visible content without needing a hand-written `<head>`.
         */}
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
        {/**
         * JSON-LD structured data for SEO. Body placement is fine: crawlers
         * read JSON-LD anywhere in the document and it needs no early execution.
         *
         * `<` is escaped to its JSON unicode form so that no value can close
         * the `<script>` tag early (e.g. a `</script>` substring). Values are
         * currently static constants, so this is defensive; `<` decodes
         * back to `<` when parsed as JSON, so the structured data is unchanged.
         */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {children}
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
