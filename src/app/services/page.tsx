import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import Services from "@/components/Services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      <FloatingActions />
      <div className="pt-24">
        <Services />
      </div>
      <Footer />
    </main>
  );
}
