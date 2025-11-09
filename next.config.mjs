/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    level: 'info',
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
      incomingRequests: true,
    },
  },
  images: {
    // Allow product images hosted on protopedia.net
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'protopedia.net',
        pathname: '/pic/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Global security-related headers
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Service worker specific hardening (native SW)
        source: '/sw-min.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; connect-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
