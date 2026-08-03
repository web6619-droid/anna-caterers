"use client";

import { useState } from "react";
import Image from "next/image";

type MenuItem = {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
};

export default function MenuClient() {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filterCategories = ["ALL", "BEVERAGES", "DESSERTS", "STARTERS", "MAINS"];

  const menuItems: MenuItem[] = [
    {
      id: 1,
      category: "BEVERAGES",
      title: "Grape Juice",
      imageUrl: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      category: "BEVERAGES",
      title: "Mango Juice",
      imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      category: "BEVERAGES",
      title: "Watermelon Juice",
      imageUrl: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      category: "DESSERTS",
      title: "Ice Cream",
      imageUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      category: "STARTERS",
      title: "Fried Chicken",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      category: "STARTERS",
      title: "Cheese Balls",
      imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 7,
      category: "STARTERS",
      title: "Holiday Party Platter",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 8,
      category: "MAINS",
      title: "Biryani",
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 9,
      category: "MAINS",
      title: "Traditional Kerala Sadya",
      imageUrl: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const filteredItems = activeFilter === "ALL" 
    ? menuItems 
    : menuItems.filter((item) => item.category === activeFilter);

  return (
    <section className="py-24 bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-gold tracking-[0.2em] text-sm font-semibold uppercase block mb-4">
            A Taste of Luxury
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            A Feast for the <span className="text-gold italic font-serif">Senses.</span>
          </h1>
          <p className="text-[#a0a0a0] text-lg leading-relaxed">
            Discover a symphony of tastes designed to elevate your next gathering. From beloved local delicacies to sophisticated global fare, every dish is masterfully crafted to leave a lasting impression.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center flex-wrap gap-3 mb-16">
          {filterCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-7 py-2.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 uppercase ${
                activeFilter === category
                  ? "bg-gold text-black shadow-[0_4px_20px_rgba(212,175,55,0.3)] border border-gold"
                  : "bg-[#1a1a1a] text-white border border-white/5 hover:bg-gold hover:text-black hover:border-gold"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* The Visual Menu Grid */}
        <div 
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="relative rounded-[24px] overflow-hidden aspect-square bg-[#1a1a1a] border border-white/5 group cursor-pointer transition-all duration-400 hover:-translate-y-1.5 hover:border-[rgba(212,175,55,0.5)] hover:shadow-[0_16px_35px_rgba(0,0,0,0.7)]"
            >
              {/* Card Background Image */}
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-600 cubic-bezier(0.25, 0.46, 0.45, 0.94) group-hover:scale-105"
              />

              {/* Dark Linear Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                <span className="text-gray-300 text-xs font-bold uppercase tracking-[0.15em] mb-1.5">
                  {item.category}
                </span>
                <h3 className="text-white text-2xl font-bold leading-snug">
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
