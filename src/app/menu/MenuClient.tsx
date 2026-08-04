"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { defaultMenu } from "@/data/defaultCatalogue";

type MenuItem = {
  id: string | number;
  title: string;
  category: string;
  imageUrl: string;
  price?: string;
  description?: string;
};

type CategoryItem = {
  id: string;
  name: string;
};

const DEFAULT_CATEGORIES = [
  "Starter",
  "Main Course",
  "Dessert",
  "Kerala Traditional",
  "Beverage"
];

export default function MenuClient() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [dbItems, setDbItems] = useState<MenuItem[]>([]);
  const [fetchedCategories, setFetchedCategories] = useState<CategoryItem[]>([]);

  // Loading States to prevent data-fetching flicker without triggering cascading useEffect re-renders
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const isLoading = !(menuLoaded && categoriesLoaded);

  useEffect(() => {
    // 1. Subscribe to menu items
    const qMenu = query(collection(db, "menu_items"), orderBy("createdAt", "desc"));
    const unsubscribeMenu = onSnapshot(qMenu, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as MenuItem[];
      setDbItems(docs);
      setMenuLoaded(true);
    }, (err) => {
      console.warn("Error subscribing to menu items in storefront, utilizing default catalogue:", err);
      setMenuLoaded(true);
    });

    // 2. Subscribe to dynamic categories collection from Admin Dashboard
    const qCat = query(collection(db, "categories"), orderBy("createdAt", "asc"));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      const cats = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name || d.id,
      })) as CategoryItem[];
      setFetchedCategories(cats);
      setCategoriesLoaded(true);
    }, (err) => {
      console.warn("Error subscribing to categories in storefront, utilizing defaults:", err);
      setCategoriesLoaded(true);
    });

    return () => {
      unsubscribeMenu();
      unsubscribeCat();
    };
  }, []);

  // Construct dynamic filter options prepended with "All"
  const filterOptions = [
    "All",
    ...(fetchedCategories.length > 0
      ? fetchedCategories.map((cat) => cat.name)
      : DEFAULT_CATEGORIES)
  ];

  const itemsToRender: MenuItem[] = dbItems.length > 0 
    ? dbItems 
    : defaultMenu.map((item, index) => ({ id: index, ...item }));

  const filteredItems = (activeFilter === "All" || activeFilter === "ALL")
    ? itemsToRender 
    : itemsToRender.filter((item) => item.category?.trim().toLowerCase() === activeFilter.trim().toLowerCase());

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

        {/* Conditional Rendering: Skeleton Loader vs Actual Data */}
        {isLoading ? (
          <div className="space-y-16">
            {/* Skeleton Filter Chips */}
            <div className="flex justify-center flex-wrap gap-3">
              {[...Array(6)].map((_, idx) => (
                <div 
                  key={idx} 
                  className="w-28 h-10 rounded-full animate-pulse bg-[#18181B] border border-white/5"
                />
              ))}
            </div>

            {/* Skeleton Menu Grid */}
            <div 
              className="grid gap-6"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
            >
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-[24px] h-80 animate-pulse bg-[#18181B] border border-white/5 shadow-lg"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* Responsive Dynamic Category Filters (Horizontal scroll on mobile, wrap on larger viewports) */}
            <div className="flex overflow-x-auto md:flex-wrap justify-start md:justify-center gap-3 mb-16 pb-2 md:pb-0 scrollbar-none">
              {filterOptions.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-7 py-2.5 rounded-full text-sm font-bold tracking-wider transition-all duration-300 uppercase cursor-pointer shrink-0 ${
                    activeFilter.toLowerCase() === category.toLowerCase()
                      ? "bg-gold text-black shadow-[0_4px_20px_rgba(212,175,55,0.3)] border border-gold"
                      : "bg-[#1a1a1a] text-white border border-white/5 hover:bg-gold hover:text-black hover:border-gold"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Graceful Empty State vs Visual Menu Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-[#18181B] rounded-3xl border border-white/10 max-w-2xl mx-auto p-8 shadow-2xl">
                <p className="text-2xl font-bold text-white mb-2">No menu items found in this category.</p>
                <p className="text-sm text-gray-400">
                  We are currently preparing culinary offerings for <span className="text-gold font-semibold">&ldquo;{activeFilter}&rdquo;</span>. Please choose another filter or check back soon!
                </p>
              </div>
            ) : (
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

                    {item.price && (
                      <div className="absolute top-4 right-4 px-3.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-gold/30 text-gold text-xs font-extrabold z-10">
                        {item.price}
                      </div>
                    )}

                    {/* Dark Linear Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                      <span className="text-gray-300 text-xs font-bold uppercase tracking-[0.15em] mb-1.5">
                        {item.category}
                      </span>
                      <h3 className="text-white text-2xl font-bold leading-snug">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1 opacity-90">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
