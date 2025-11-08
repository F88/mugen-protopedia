import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ppv25',
  description: 'Viewer app for ProtoPedia 25',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
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
        <Analytics />
      </body>
    </html>
  );
}
