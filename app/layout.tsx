import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Helper Buddy - Your Trusted Partner for Household Services',
  description: 'Find reliable household services including cleaning, appliance repair, plumbing, electrical work and more. Book trusted professionals for your home service needs.',
  metadataBase: new URL('https://dudhkela.netlify.app'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'plElx_sKYUqrw8K3SbepJDyBvbV1GwVYTavL7rMeo3E',
  },
  openGraph: {
    title: 'Helper Buddy - Professional Home Services',
    description: 'Your trusted partner for finding reliable household services and professionals. Book verified service providers for cleaning, repairs, and maintenance.',
    url: 'https://dudhkela.netlify.app',
    siteName: 'Helper Buddy',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'images/logo.jpg', // Add your OG image path
        width: 1200,
        height: 630,
        alt: 'Helper Buddy Services',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  keywords: ['home services', 'cleaning services', 'appliance repair', 'plumbing', 'electrical work', 'handyman', 'house cleaning', 'AC service', 'carpenter'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="plElx_sKYUqrw8K3SbepJDyBvbV1GwVYTavL7rMeo3E" />
      </head>
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
