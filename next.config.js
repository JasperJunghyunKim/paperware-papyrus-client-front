/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
  },
  rewrites: async () => {
    return [
      {
        source: '/health',
        destination: 'https://example.com/api/health',
        basePath: false
      },
    ];
  },
};

module.exports = nextConfig;