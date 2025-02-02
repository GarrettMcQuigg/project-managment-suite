/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  transpilePackages: ['@packages/lib'],
  images: {
    dangerouslyAllowSVG: true,
    domains: ['vercel-storage.com'],
    formats: ['image/avif', 'image/webp']
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name][ext]'
      }
    });
    return config;
  }
};

module.exports = nextConfig;
