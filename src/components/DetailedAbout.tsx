"use client";

import { useState } from 'react';
import { Clock, Users, ChefHat, Star, Plus, Minus, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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

export default function DetailedAbout() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What kind of food does Anna Caterers serve?",
      a: "We offer a diverse and exquisite range of cuisines, specializing in authentic Kerala delicacies alongside premium global dishes. Our menus are fully customizable to match the theme and tone of your signature event."
    },
    {
      q: "For what kind of occasions can I hire Anna Caterers?",
      a: "From intimate private dining and birthday parties to grand corporate galas and lavish weddings, we scale our premium catering services to fit any occasion perfectly."
    },
    {
      q: "Will Anna Caterers be able to fully customise my menu?",
      a: "Absolutely. Please speak with our culinary team to fully understand our offerings. We pride ourselves on matching your taste, dietary preferences, and aesthetic vision seamlessly."
    },
    {
      q: "Do I need to book the caterers in advance?",
      a: "Yes, to ensure the highest quality of service and secure your preferred dates, we recommend booking well in advance, especially for large-scale events and weddings."
    }
  ];

  return (
    <div id="detailed-about" className="bg-[#0f0f0f] text-white selection:bg-gold selection:text-black">
      {/* 1. The Story Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-white/5">
        {/* Massive Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.02] select-none overflow-hidden">
          <h1 className="text-[12rem] md:text-[20rem] font-black tracking-tighter whitespace-nowrap text-white">ANNA</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h3 className="text-gold tracking-[0.2em] text-sm font-semibold uppercase mb-6">OUR HERITAGE</h3>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[1.1]">
              A Tradition of <br/><span className="text-gold italic font-serif">Taste.</span>
            </h2>
            <p className="text-[#a0a0a0] text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              Since 1995, we have dedicated ourselves to turning ordinary events into extraordinary memories through exceptional food. Proudly rooted in Ernakulam, we remain the gold standard for high-end event hospitality.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link href="#contact" className="px-8 py-4 bg-gold text-black font-semibold rounded-full hover:bg-[#b5952f] transition-all tracking-wide">
                Contact Us
              </Link>
              <Link href="#menu" className="px-8 py-4 bg-transparent border border-gold text-gold font-semibold rounded-full hover:bg-gold/10 transition-all tracking-wide">
                View Our Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Stats Banner */}
      <section className="py-20 bg-[#151515]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-6 divide-x-0 md:divide-x divide-white/10">
            <div className="flex flex-col items-center text-center">
              <Clock className="text-gold w-8 h-8 mb-4" />
              <p className="text-4xl font-bold mb-2 min-h-[40px] flex items-center justify-center">
                <StatCounter end={30} suffix="+" duration={2} />
              </p>
              <p className="text-xs tracking-widest text-[#a0a0a0] uppercase font-semibold">Years of Excellence</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="text-gold w-8 h-8 mb-4" />
              <p className="text-4xl font-bold mb-2 min-h-[40px] flex items-center justify-center">
                <StatCounter end={5000} suffix="+" duration={2.5} />
              </p>
              <p className="text-xs tracking-widest text-[#a0a0a0] uppercase font-semibold">Satisfied Clients</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <ChefHat className="text-gold w-8 h-8 mb-4" />
              <p className="text-4xl font-bold mb-2 min-h-[40px] flex items-center justify-center">
                <StatCounter end={50} suffix="+" duration={2} />
              </p>
              <p className="text-xs tracking-widest text-[#a0a0a0] uppercase font-semibold">Expert Chefs</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Star className="text-gold w-8 h-8 mb-4" />
              <p className="text-4xl font-bold mb-2 min-h-[40px] flex items-center justify-center">
                <StatCounter end={4.8} decimals={1} duration={2} />
                <span className="text-gold ml-0.5">★</span>
              </p>
              <p className="text-xs tracking-widest text-[#a0a0a0] uppercase font-semibold">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Philosophy & Specialties */}
      <section className="py-24 md:py-32 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left Content */}
            <div>
              <h3 className="text-gold tracking-[0.2em] text-sm font-semibold uppercase mb-6">OUR VISION</h3>
              <motion.h2 
                initial={{ opacity: 0, y: 15 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-20px" }} 
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-4xl md:text-5xl font-bold mb-8 tracking-tight"
              >
                Elegance on <span className="text-gold italic font-serif">Every Plate.</span>
              </motion.h2>
              <div className="space-y-6 text-[#a0a0a0] text-lg leading-relaxed mb-10">
                <p>
                  To us, dining is an art form. Our masterful culinary team harmonizes authentic local flavors with international flair, crafting bespoke menus that do more than simply feed your guests—they captivate them.
                </p>
                <p>
                  From exclusive private dinners to grand celebration banquets, we maintain an uncompromising standard for premium ingredients, striking aesthetics, and flawless execution.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {["Wedding Catering", "Corporate Events", "Birthday Parties", "Private Dining", "Cultural Feasts"].map((tag) => (
                  <span key={tag} className="px-5 py-2.5 rounded-full bg-[#151515] border border-white/10 text-sm font-medium text-gold hover:border-gold/50 transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Image Grid/Placeholder */}
            <div className="relative h-[600px] w-full rounded-2xl overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop" alt="Fine Dining Presentation" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ Grid */}
      <section className="py-24 bg-[#151515]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-gold tracking-[0.2em] text-sm font-semibold uppercase mb-4">Frequently Asked Questions</h3>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Common Questions <span className="text-gold italic font-serif">Answered.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-8 cursor-pointer hover:border-gold/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-lg font-semibold text-white leading-snug">{faq.q}</h4>
                    <div className="text-gold shrink-0 mt-1">
                      {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </div>
                  <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="text-[#a0a0a0] leading-relaxed text-sm md:text-base">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-32 bg-[#0f0f0f] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Award className="w-12 h-12 text-gold mx-auto mb-8" />
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Ready to Host the <span className="text-gold italic font-serif">Extraordinary?</span>
          </h2>
          <p className="text-[#a0a0a0] text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Allow our experts to turn your upcoming gathering into a flawless culinary journey. Connect with us today to curate a menu as unique as your event.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="#contact" className="px-8 py-4 bg-gold text-black font-semibold rounded-full hover:bg-[#b5952f] transition-all tracking-wide">
              Contact Us
            </Link>
            <Link href="/services" className="px-8 py-4 bg-transparent border border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all tracking-wide">
              Our Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
