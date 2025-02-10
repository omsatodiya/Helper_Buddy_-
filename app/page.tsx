"use client";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/ui/preloader";
import Testimonials from "@/components/ui/Testimonials";
import FAQ from "@/components/FAQ/FAQ";

export default function Home() {
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
        }`}>
        <Header />
        <div className="h-screen"></div>
        <FAQ />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
