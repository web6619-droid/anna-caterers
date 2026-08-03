"use client";

import Link from "next/link";
import Image from "next/image";
import { useBookingModal } from "@/context/BookingModalContext";

export default function Header() {
  // Access global booking modal control
  const { openModal } = useBookingModal();

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center group brand-container h-full">
            <div className="relative h-[90px] w-[150px] transition-transform group-hover:scale-105 mix-blend-lighten brand-logo">
              <Image 
                src="/Screenshot 2026-07-31 223231.png" 
                alt="Anna Caterers Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="sr-only">Anna Caterers</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {["ABOUT", "SERVICES", "MENU", "GALLERY", "CONTACT"].map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`}
                className="text-xs tracking-[0.2em] font-semibold text-gray-300 hover:text-gold transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Standalone General CTA Button: Opens modal with default "Select an Event..." placeholder */}
          <div className="hidden md:block">
            <button 
              onClick={() => openModal()}
              className="px-8 py-3 bg-gold text-black font-semibold rounded-full hover:bg-[#b5952f] transition-colors tracking-wide cursor-pointer shadow-lg shadow-gold/10"
            >
              BOOK EVENT
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
