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
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${domain}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

try {
  // Ensure the static directory exists
  const staticDir = path.join(process.cwd(), '.next', 'static');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  // Write sitemap to static directory
  const sitemapPath = path.join(staticDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);

  // Also write robots.txt to static directory
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/static/

Sitemap: ${domain}/sitemap.xml`;
  
  const robotsPath = path.join(staticDir, 'robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt);

  console.log('Sitemap and robots.txt generated successfully');
} catch (error) {
  console.error('Error generating files:', error);
  process.exit(1);
} 