import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import GalleryClient from "./GalleryClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Gallery | Anna Caterers",
  description: "Explore our recent culinary masterpieces and event setups, from intimate gatherings to grand corporate galas and luxury weddings across Kerala.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      <FloatingActions />
      <div className="pt-24">
        <GalleryClient />
      </div>
      <Footer />
    </main>
  );
}
