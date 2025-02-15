import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Management | Admin Dashboard | Dudh-Kela',
  description: 'Manage and maintain blog content for Dudh-Kela platform. Create, edit, and delete blog posts.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Blog Management - Dudh-Kela Admin',
    description: 'Administrative interface for managing Dudh-Kela blog content',
    type: 'website',
    url: 'https://dudhkela.com/admin/blogs',
    siteName: 'Dudh-Kela Admin',
  },
};

export default function BlogAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="blog-admin-layout">{children}</div>;
} 