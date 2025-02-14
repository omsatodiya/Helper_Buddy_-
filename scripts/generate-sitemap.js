const fs = require('fs');
const path = require('path');

const domain = 'https://dudhkela.netlify.app';

const pages = [
  {
    url: '/',
    changefreq: 'daily',
    priority: 1.0
  },
  {
    url: '/services',
    changefreq: 'daily',
    priority: 0.9
  },
  {
    url: '/blog',
    changefreq: 'weekly',
    priority: 0.8
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    url: '/auth/login',
    changefreq: 'monthly',
    priority: 0.6
  },
  {
    url: '/auth/signup',
    changefreq: 'monthly',
    priority: 0.6
  }
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${domain}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

// Define directories
const publicDir = path.join(process.cwd(), 'public');
const nextDir = path.join(process.cwd(), '.next/static');

// Ensure directories exist
[publicDir, nextDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Write sitemap to both directories
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(nextDir, 'sitemap.xml'), sitemap);

console.log('Sitemap generated successfully in both public and .next/static directories!'); 