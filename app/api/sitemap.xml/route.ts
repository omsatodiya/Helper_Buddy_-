import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
    const db = getFirestore();
    const urls = [...staticPages];

    // Get services
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    servicesSnapshot.forEach((doc) => {
      urls.push({
        url: `/services/${doc.id}`,
        changefreq: 'daily',
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

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.map(page => `
        <url>
          <loc>${domain}${page.url}</loc>
          <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
          <changefreq>${page.changefreq}</changefreq>
          <priority>${page.priority}</priority>
        </url>
      `).join('')}
    </urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'all'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
} 