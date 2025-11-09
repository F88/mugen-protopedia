import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';

import './globals.css';

import { ServiceWorkerRegister } from '@/components/sw-register';

const inter = Inter({ subsets: ['latin'] });

// Centralized metadata constants to avoid duplication and ease future updates.
const APP_TITLE = '無限ProtoPedia';
const APP_DESCRIPTION = '無限ProtoPediaでよふかし';

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  applicationName: APP_TITLE,
  icons: {
    // Generic icons (optional but useful for some platforms)
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    // Apple touch icon generated in <head> automatically by Next.js
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
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
    siteName: APP_TITLE,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* Theme color primarily affects Chrome/Edge/Android; unsupported browsers will ignore it. */}
        <meta name="theme-color" content="#000000" />
        {/** Apple touch icon will be injected by Next.js metadata (icons.apple) */}
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
