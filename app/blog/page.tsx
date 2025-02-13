import React from "react";
import Blog from "@/app/blog/Blog";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";
import dynamic from "next/dynamic";

// Add metadata export for SEO
export const metadata: Metadata = {
  title: "Blog | Helper Buddy",
  description: "Explore our latest articles and insights about [your topic]",
  openGraph: {
    title: "Blog | Helper Buddy",
    description: "Explore our latest articles and insights about [your topic]",
    type: "website",
    url: "https://helperbuddy.com/blog",
    images: [
      {
        url: "/path-to-your-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Blog page thumbnail",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Your Site Name",
    description: "Explore our latest articles and insights about [your topic]",
    images: ["/path-to-your-og-image.jpg"],
  },
};

// Move loading state to a client component
const ClientBlogWrapper = dynamic(() => import("./ClientBlogWrapper"), {
  ssr: true,
});

export default function BlogPage() {
  return <ClientBlogWrapper />;
}
