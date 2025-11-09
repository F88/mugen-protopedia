import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Analytics } from '@vercel/analytics/next';

import './globals.css';

import { ServiceWorkerRegister } from '@/components/sw-register';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '無限ProtoPedia',
  description: '無限ProtoPediaでよふかし',
  applicationName: '無限ProtoPedia',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '無限ProtoPedia',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: '無限ProtoPedia',
    title: '無限ProtoPedia',
    description: '無限ProtoPediaでよふかし',
  },
  twitter: {
    card: 'summary',
    title: '無限ProtoPedia',
    description: '無限ProtoPediaでよふかし',
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
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
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
