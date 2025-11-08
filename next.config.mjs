import withPWA from 'next-pwa';

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
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
});

export default pwaConfig(nextConfig);
