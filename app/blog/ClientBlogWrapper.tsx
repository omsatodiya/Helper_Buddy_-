"use client";
import React, { useEffect, useState } from "react";
import Blog from "@/app/blog/Blog";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/preloader";

export default function ClientBlogWrapper() {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = () => {
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <Preloader onLoadingComplete={handleLoadingComplete} />}
      <main
        className={`transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Header />
        <div className="h-20"></div>
        <Blog />
        <Footer />
      </main>
    </>
  );
}
