import { Phone, Mail, MapPin } from 'lucide-react';

import Link from 'next/link';

export default function About() {
  return (
    <section id="legacy" className="py-24 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h3 className="text-gold tracking-widest text-sm font-semibold uppercase mb-4">Our Story</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              A Legacy of <span className="text-gold italic font-serif">Excellence</span>.
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Based in Thiruvaniyoor, Ernakulam, Anna Caterers has been a pillar of culinary excellence since 1995. For nearly three decades, our skilled and experienced chefs have been proficient in a diverse variety of cuisines, ensuring a high-quality dining experience. We believe that food should not just satisfy the palate, but elevate the entire occasion.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/about" className="inline-block px-8 py-4 bg-transparent border border-gold text-gold font-semibold rounded-full hover:bg-gold/10 transition-colors tracking-wide">
                Discover Our Story
              </Link>
              <Link href="/contact" className="inline-block px-8 py-4 bg-gold text-black font-semibold rounded-full hover:bg-gold-hover transition-colors tracking-wide">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right Image with Glassmorphism Stats */}
          <div className="relative h-[600px] rounded-3xl overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Glass Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-sm bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
              <div className="text-center pb-6 border-b border-white/10">
                <p className="text-3xl font-bold text-white mb-1">30+</p>
                <p className="text-xs tracking-widest text-gray-400 uppercase">Years of Excellence</p>
              </div>
              <div className="text-center pb-6 border-b border-white/10">
                <p className="text-3xl font-bold text-white mb-1">5000+</p>
                <p className="text-xs tracking-widest text-gray-400 uppercase">Happy Clients</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">4.8<span className="text-gold">★</span></p>
                <p className="text-xs tracking-widest text-gray-400 uppercase">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
