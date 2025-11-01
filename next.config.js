/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  compress: true,
  optimizePackageImports: ['lucide-react'],
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' }
      ]
    }
  ],
  onDemandEntries: {
    maxInactiveAge: 15 * 60 * 1000,
    pagesBufferLength: 2,
  }
};

module.exports = nextConfig;
