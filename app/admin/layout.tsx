import AdminProtected from '@/components/auth/AdminProtected';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProtected>{children}</AdminProtected>;
} 