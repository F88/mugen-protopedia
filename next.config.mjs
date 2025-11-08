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

export default nextConfig;
