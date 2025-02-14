import { Metadata } from 'next';
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Dudh-Kela administration dashboard for managing services, providers, and content.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <AdminHeader />
      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
} 