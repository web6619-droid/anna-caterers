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
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-8 w-full pt-28 sm:pt-24 pb-16 md:py-0">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white leading-[1.15] sm:leading-[1.1] tracking-tight mb-6 animate-hero-spring">
            We Serve You<br />
            The Real <span className="text-gold italic font-serif">Happiness</span>.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 md:mb-10 max-w-lg leading-normal md:leading-relaxed">
            Elevating every occasion. Anna Caterers brings over 30 years of culinary excellence to your signature events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <Link 
              href="/services"
              className="w-full sm:w-auto text-center px-6 md:px-8 py-3.5 md:py-4 bg-gold text-black font-semibold rounded-full hover:bg-gold-hover transition-colors tracking-wide text-sm sm:text-base md:text-lg inline-block shadow-lg shadow-gold/15"
            >
              VIEW OUR SERVICES
            </Link>
            <div className="flex items-center justify-center gap-2 text-white bg-white/5 px-5 py-3 md:px-6 md:py-3 rounded-full backdrop-blur-sm border border-white/10 w-full sm:w-auto">
              <span className="text-gold text-lg md:text-xl">★</span>
              <span className="font-bold text-sm md:text-base">4.8</span>
              <span className="text-gray-400 text-xs md:text-sm">/ 5 Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
