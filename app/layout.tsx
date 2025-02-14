import { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL('https://dudhkela.com'),
  title: {
    default: 'Dudh-Kela | Online Home Services',
    template: '%s | Dudh-Kela'
  },
  description: 'Best Home Services in your area. Find and book verified service professionals for all your home maintenance needs. Quality service guaranteed with real-time booking and support.',
  keywords: ['home services', 'home maintenance', 'professional services', 'verified professionals', 'Dudh-Kela'],
  authors: [{ name: 'Dudh-Kela Team' }],
  creator: 'Dudh-Kela',
  publisher: 'Dudh-Kela',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-us',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Dudh-Kela',
    title: 'Dudh-Kela - Your Trusted Partner for Professional Home Services',
    description: 'Find and book verified service professionals for all your home maintenance needs. Quality service guaranteed with real-time booking and support.',
    url: 'https://dudhkela.netlify.app',
    locale: 'en_US',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dudh-Kela - Professional Home Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dudh-Kela - Professional Home Services',
    description: 'Book trusted home service professionals for all your household needs',
    site: '@dudhkela',
    creator: '@dudhkela',
    images: ['/images/twitter-image.jpg'],
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
  verification: {
    google: 'plElx_sKYUqrw8K3SbepJDyBvbV1GwVYTavL7rMeo3E',
    other: {
      'facebook-domain-verification': '[your-facebook-verification-code]',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
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
        <Toaster />
      </body>
    </html>
  );
}
