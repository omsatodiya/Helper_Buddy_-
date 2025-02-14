import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';

const domain = 'https://dudhkela.netlify.app';

const staticPages = [
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
    url: '/become-provider',
    changefreq: 'weekly',
    priority: 0.8
  }
];

async function generateDynamicUrls() {
  const db = getFirestore();
  const urls = [];

  // Get services
  const servicesSnapshot = await getDocs(collection(db, 'services'));
  servicesSnapshot.forEach(doc => {
    urls.push({
      url: `/services/${doc.id}`,
      changefreq: 'weekly',
      priority: 0.8
    });
  });

  // Get blog posts
  const blogSnapshot = await getDocs(collection(db, 'blogs'));
  blogSnapshot.forEach(doc => {
    urls.push({
      url: `/blog/${doc.id}`,
      changefreq: 'monthly',
      priority: 0.7
    });
  });

  return urls;
}

function generateSiteMap(urls: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...staticPages, ...urls]
    .map(page => `
    <url>
      <loc>${domain}${page.url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `).join('')}
</urlset>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const dynamicUrls = await generateDynamicUrls();
    const sitemap = generateSiteMap(dynamicUrls);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
    return res.status(200).send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).json({ error: 'Error generating sitemap' });
  }
} 