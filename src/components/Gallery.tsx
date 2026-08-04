import Link from "next/link";

export default function Gallery() {
  const images = [
    "https://res.cloudinary.com/pzynujc5/image/upload/f_auto,q_auto/annacaterers/gallery-1.jpg",
    "https://res.cloudinary.com/pzynujc5/image/upload/f_auto,q_auto/annacaterers/gallery-2.jpg",
    "https://res.cloudinary.com/pzynujc5/image/upload/f_auto,q_auto/annacaterers/gallery-3.jpg",
    "https://res.cloudinary.com/pzynujc5/image/upload/f_auto,q_auto/annacaterers/gallery-4.jpg",
  ];

  return (
    <section id="gallery" className="py-24 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Our Portfolio <span className="text-gold italic font-serif">Gallery</span>.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            A visual feast of our recent wedding setups, corporate galas, and signature dish presentations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((src, index) => (
            <div 
              key={index}
              className="relative h-96 rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${src})` }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
              
              {/* Video Badge */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 group-hover:bg-gold group-hover:border-gold transition-all duration-300">
                <span className="text-xs font-bold tracking-wider group-hover:text-black">▷ VIDEO</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/gallery" className="inline-block px-8 py-4 bg-[#1a1a1a] border border-white/10 text-white font-semibold rounded-full hover:bg-gold hover:text-black hover:border-gold transition-colors tracking-wide">
            View Full Portfolio →
          </Link>
        </div>
      </div>
    </section>
  );
}
