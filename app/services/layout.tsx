import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Services | Book Trusted Service Providers",
  description:
    "Browse and book professional services from verified providers. Find electricians, plumbers, cleaners, and more with real customer reviews.",
  keywords:
    "services, home services, professional services, cleaning, plumbing, electrical work",
  openGraph: {
    title: "Professional Services | Your Service Platform",
    description: "Find and book trusted service providers in your area",
    type: "website",
    url: "https://yourdomain.com/services",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://yourdomain.com/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
