import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FloatingActions from "@/components/FloatingActions";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <FloatingActions />
      <Hero />
      <About />
      <Gallery />
      <Reviews />
      <Footer />
    </main>
  );
}
