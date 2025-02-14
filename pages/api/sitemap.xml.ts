import { NextApiRequest, NextApiResponse } from 'next';

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

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${domain}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Robots-Tag', 'all');
  
  const sitemap = generateSiteMap();
  res.write(sitemap);
  res.end();
} 