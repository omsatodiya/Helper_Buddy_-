import './globals.css';
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from '@/context/AuthContext';

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
