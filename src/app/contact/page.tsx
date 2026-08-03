import Header from "@/components/Header";
import FloatingActions from "@/components/FloatingActions";
import ContactClient from "./ContactClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Anna Caterers",
  description: "Get in touch with Anna Caterers in Kochi, Kerala to curate bespoke menus and plan your signature weddings, celebrations, and corporate events.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col justify-between">
      <div>
        <Header />
        <FloatingActions />
        <div className="pt-24">
          <ContactClient />
        </div>
      </div>
      <footer className="py-8 bg-[#111111] text-gray-500 text-center text-sm border-t border-white/5">
        <p>© 2026 Anna Caterers. All rights reserved. Built with passion for signature events across Kerala.</p>
      </footer>
    </main>
  );
}
