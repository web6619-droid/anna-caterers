"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CountUp from "react-countup";

function StatCounter({ end, decimals = 0, suffix = "", duration = 2 }: { end: number; decimals?: number; suffix?: string; duration?: number }) {
  return (
    <CountUp 
      start={0} 
      end={end} 
      decimals={decimals} 
      duration={duration} 
      separator="" 
      suffix={suffix} 
      enableScrollSpy={true}
      scrollSpyOnce={true}
    />
  );
}

export default function About() {
  return (
    <section id="legacy" className="py-16 sm:py-20 md:py-24 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="pr-0 sm:pr-4 md:pr-0">
            <h3 className="text-gold tracking-widest text-xs sm:text-sm font-semibold uppercase mb-3 sm:mb-4">Our Story</h3>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-20px" }} 
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 sm:mb-6 tracking-tight leading-[1.2] sm:leading-tight"
            >
              A Legacy of <span className="text-gold italic font-serif">Excellence</span>.
            </motion.h2>
            <p className="text-gray-400 text-base md:text-lg mb-8 leading-normal md:leading-relaxed">
              Based in Aluva, Ernakulam, Anna Caterers has been a pillar of culinary excellence since 1995. For nearly three decades, our skilled and experienced chefs have been proficient in a diverse variety of cuisines, ensuring a high-quality dining experience. We believe that food should not just satisfy the palate, but elevate the entire occasion.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4">
              <Link href="/about" className="w-full sm:w-auto text-center px-6 md:px-8 py-3.5 md:py-4 bg-transparent border border-gold text-gold font-semibold rounded-full hover:bg-gold/10 transition-colors tracking-wide text-sm sm:text-base md:text-lg">
                Discover Our Story
              </Link>
              <Link href="/contact" className="w-full sm:w-auto text-center px-6 md:px-8 py-3.5 md:py-4 bg-gold text-black font-semibold rounded-full hover:bg-gold-hover transition-colors tracking-wide text-sm sm:text-base md:text-lg shadow-lg shadow-gold/15">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right Image with Glassmorphism Stats */}
          <div className="relative h-[450px] sm:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Glass Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 sm:w-3/4 max-w-sm bg-black/50 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 sm:gap-6">
              <div className="text-center pb-5 sm:pb-6 border-b border-white/10">
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 min-h-[36px] flex items-center justify-center">
                  <StatCounter end={30} suffix="+" duration={2} />
                </p>
                <p className="text-[0.7rem] sm:text-xs tracking-widest text-gray-400 uppercase font-medium">Years of Excellence</p>
              </div>
              <div className="text-center pb-5 sm:pb-6 border-b border-white/10">
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 min-h-[36px] flex items-center justify-center">
                  <StatCounter end={5000} suffix="+" duration={2.5} />
                </p>
                <p className="text-[0.7rem] sm:text-xs tracking-widest text-gray-400 uppercase font-medium">Happy Clients</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 min-h-[36px] flex items-center justify-center">
                  <StatCounter end={4.8} decimals={1} duration={2} />
                  <span className="text-gold ml-0.5">★</span>
                </p>
                <p className="text-[0.7rem] sm:text-xs tracking-widest text-gray-400 uppercase font-medium">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
