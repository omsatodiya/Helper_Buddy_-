import './globals.css';

export const metadata = {
  title: 'Helper Buddy',
  description: 'Made by Helper Buddy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  )
}
