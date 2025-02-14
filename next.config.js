/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    domains: ["localhost", "res.cloudinary.com"],
  },
  experimental: {
    disableGenerateMetadata: true,
  },
};

module.exports = nextConfig;
