// This is a server component that handles the page configuration
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = false

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 