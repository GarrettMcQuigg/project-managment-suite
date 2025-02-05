/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transpilePackages: ['@packages/lib'],
  images: {
    dangerouslyAllowSVG: true,
    domains: ['vercel-storage.com'],
    formats: ['image/avif', 'image/webp']
  }
};

module.exports = nextConfig;
