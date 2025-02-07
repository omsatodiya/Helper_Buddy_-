import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FAQ from '@/components/faq/FAQ'

export default function Home() {
  return (
    <>
      <Header />
      <div className="h-screen">
        <FAQ />
      </div>
      <Footer />
    </>
  );
}
