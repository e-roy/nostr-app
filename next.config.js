/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  experimental: {
    reactCompiler: true,
  },
};

module.exports = nextConfig;
