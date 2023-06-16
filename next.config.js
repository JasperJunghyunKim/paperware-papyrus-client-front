/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
  },
  images: {
    domains: ["images.unsplash.com"],
  },
};

module.exports = nextConfig;