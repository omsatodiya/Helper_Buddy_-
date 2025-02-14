/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    domains: ["localhost", "res.cloudinary.com"],
  },
  experimental: {
    disableGenerateMetadata: true,
  },
};

module.exports = nextConfig;
