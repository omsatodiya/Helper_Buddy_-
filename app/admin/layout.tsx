import { AdminHeader } from "@/components/admin/AdminHeader";

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