"use client";

import { useState } from "react";
import Image from "next/image";

type MediaItem = {
  id: number;
  title: string;
  tag: string;
  category: string; // Used for filtering by "Weddings" or "Corporate"
  isVideo: boolean; // Used for filtering by "Videos" vs "Photos"
  imageUrl: string;
};

export default function GalleryClient() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filterCategories = ["All", "Photos", "Videos", "Weddings", "Corporate"];

  const mediaItems: MediaItem[] = [
    {
      id: 1,
      title: "Grand Banquet - Ernakulam",
      tag: "Weddings",
      category: "Weddings",
      isVideo: true,
      imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Tech Summit Gala - Kochi",
      tag: "Corporate",
      category: "Corporate",
      isVideo: false,
      imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Royal Baptism Reception",
      tag: "Celebrations",
      category: "Celebrations",
      isVideo: true,
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Sunset Villa Anniversary",
      tag: "Private Dining",
      category: "Private Dining",
      isVideo: false,
      imageUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      title: "Backwaters Destination Wedding",
      tag: "Weddings",
      category: "Weddings",
      isVideo: true,
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      title: "Milestone Birthday Soirée",
      tag: "Celebrations",
      category: "Celebrations",
      isVideo: false,
      imageUrl: "https://images.unsplash.com/photo-1530103862676-de88b635fd4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 7,
      title: "Traditional Kerala Sadya - Trivandrum",
      tag: "Cultural Feasts",
      category: "Cultural Feasts",
      isVideo: true,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 8,
      title: "Cathedral Reception Setup",
      tag: "Weddings",
      category: "Weddings",
      isVideo: false,
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 9,
      title: "Executive Annual Awards Dinner",
      tag: "Corporate",
      category: "Corporate",
      isVideo: true,
      imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 10,
      title: "Luxury Penthouse Tasting Menu",
      tag: "Private Dining",
      category: "Private Dining",
      isVideo: false,
      imageUrl: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const filteredItems = mediaItems.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Photos") return !item.isVideo;
    if (activeFilter === "Videos") return item.isVideo;
    if (activeFilter === "Weddings") return item.category === "Weddings";
    if (activeFilter === "Corporate") return item.category === "Corporate";
    return true;
  });

  return (
    <section className="py-24 bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Gallery Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-gold tracking-[0.2em] text-sm font-semibold uppercase block mb-4">
            Our Masterpieces
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            A Visual <span className="text-gold italic font-serif">Symphony.</span>
          </h1>
          <p className="text-[#a0a0a0] text-lg leading-relaxed">
            Explore our recent setups, from intimate gatherings to grand corporate galas.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex justify-center flex-wrap gap-3 mb-14">
          {filterCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide border transition-all duration-300 ${
                activeFilter === category
                  ? "bg-gold/10 border-gold text-gold"
                  : "bg-[#151515] border-white/5 text-white hover:border-gold/50 hover:text-gold"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        <div 
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#151515] border border-white/5 group cursor-pointer transition-all duration-400 hover:-translate-y-1.5 hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
            >
              {/* Image Background */}
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 cubic-bezier(0.25, 0.46, 0.45, 0.94) group-hover:scale-105"
              />

              {/* Video Badge */}
              {item.isVideo && (
                <div className="absolute top-4 right-4 bg-black/80 text-white text-xs font-bold tracking-widest px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md flex items-center gap-1.5 z-10 group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-colors duration-300">
                  <span>▷</span> VIDEO
                </div>
              )}

              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/95 via-[#0f0f0f]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-8 z-0">
                <span className="text-gold text-xs font-semibold tracking-[0.15em] uppercase mb-1.5 translate-y-3 group-hover:translate-y-0 transition-transform duration-400">
                  {item.tag}
                </span>
                <h3 className="text-white text-xl font-bold translate-y-3 group-hover:translate-y-0 transition-transform duration-400 delay-50">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
