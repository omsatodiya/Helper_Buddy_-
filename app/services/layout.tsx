import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Services | Find Local Service Providers",
  description:
    "Browse and book trusted local service providers for plumbing, electrical work, carpentry, cleaning, and more. Compare prices, read reviews, and schedule services online.",
  keywords:
    "home services, local services, plumber, electrician, carpenter, cleaning services, service booking",
  openGraph: {
    title: "Professional Services | Find Local Service Providers",
    description:
      "Browse and book trusted local service providers for plumbing, electrical work, carpentry, cleaning, and more.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg", // Add your OG image
        width: 1200,
        height: 630,
        alt: "Professional Services Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Services | Find Local Service Providers",
    description:
      "Browse and book trusted local service providers for plumbing, electrical work, carpentry, cleaning, and more.",
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
