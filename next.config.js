/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    domains: ["localhost", "res.cloudinary.com"],
  },
};

module.exports = nextConfig;
