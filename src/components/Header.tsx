"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBookingModal } from "@/context/BookingModalContext";
import { Menu, X } from "lucide-react";

export default function Header() {
  // Access global booking modal control
  const { openModal } = useBookingModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* Logo Area */}
          <Link 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center group brand-container h-full"
          >
            <div className="relative h-[90px] w-[150px] transition-transform group-hover:scale-105 mix-blend-lighten brand-logo">
              <Image 
                src="/Screenshot 2026-08-03 175502.png" 
                alt="Anna Caterers Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="sr-only">Anna Caterers</span>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Mobile Hamburger Menu Toggle Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2.5 text-white/80 hover:text-gold focus:outline-none transition-colors rounded-xl border border-white/15 hover:border-gold/50 cursor-pointer bg-[#151515]"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-gold" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-white/10 px-5 py-6 animate-in slide-in-from-top-2 fade-in duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
          <nav className="flex flex-col space-y-2 text-center">
            {["ABOUT", "SERVICES", "MENU", "GALLERY", "CONTACT"].map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm tracking-[0.2em] font-bold text-gray-300 hover:text-gold transition-colors py-3 min-h-[44px] flex items-center justify-center uppercase rounded-lg active:bg-white/5"
              >
                {item}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-white/10">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openModal();
                }}
                className="w-full min-h-[48px] py-4 bg-gold text-black font-extrabold rounded-xl hover:bg-[#b5952f] transition-colors tracking-wider text-sm uppercase shadow-lg shadow-gold/20 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <span>BOOK EVENT</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
