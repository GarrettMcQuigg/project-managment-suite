/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transpilePackages: ['@packages/lib'],
  images: {
    dangerouslyAllowSVG: true,
    domains: ['dkxluoddm8u1ixug.public.blob.vercel-storage.com', 'pensrbokwgcwpvpojxjg.supabase.co'],
    formats: ['image/avif', 'image/webp']
  }
};

module.exports = nextConfig;
