import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import MenuClient from "./MenuClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Menu | Anna Caterers",
  description: "Explore our culinary offerings, from traditional Kerala Sadyas and Biryanis to luxury private dining, exquisite starters, and beverages.",
};

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <Header />
      <FloatingActions />
      <div className="pt-24">
        <MenuClient />
      </div>
      <Footer />
    </main>
  );
}
