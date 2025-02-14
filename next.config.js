/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    domains: ["localhost", "res.cloudinary.com"],
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ]
  },
};

module.exports = nextConfig;
