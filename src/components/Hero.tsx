import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Background with Diagonal Split */}
      <div className="absolute inset-0 w-full h-full">
        {/* Left Solid Dark Background is naturally handled by the section's bg */}
        {/* Right Diagonal Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
          style={{ clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 35% 100%)' }}
        >
          {/* Dark Overlay for the image */}
          <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/90" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-2xl">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight mb-6 animate-hero-spring">
            We Serve You<br />
            The Real <span className="text-gold italic font-serif">Happiness</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
            Elevating every occasion. Anna Caterers brings over 30 years of culinary excellence to your signature events.
          </p>
          <div className="flex gap-6 items-center">
            <Link 
              href="/services"
              className="px-8 py-4 bg-gold text-black font-semibold rounded-full hover:bg-gold-hover transition-colors tracking-wide text-lg inline-block"
            >
              VIEW OUR SERVICES
            </Link>
            <div className="flex items-center gap-2 text-white bg-white/5 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10">
              <span className="text-gold text-xl">★</span>
              <span className="font-bold">4.8</span>
              <span className="text-gray-400 text-sm">/ 5 Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
