"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { defaultGallery } from "@/data/defaultCatalogue";

type MediaItem = {
  id: string | number;
  title: string;
  caption?: string;
  tag: string;
  eventTag?: string;
  category?: string;
  isVideo: boolean;
  type?: string;
  imageUrl: string;
  secure_url?: string;
};

const DEFAULT_CATEGORIES = ["Weddings", "Corporate", "Celebrations", "Private Dining"];

export default function GalleryClient() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [dbItems, setDbItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Robust loading state to prevent FOUC and layout shift
  const [isLoading, setIsLoading] = useState(true);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [catLoaded, setCatLoaded] = useState(false);

  useEffect(() => {
    if (galleryLoaded && catLoaded) {
      setIsLoading(false);
    }
  }, [galleryLoaded, catLoaded]);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribeGallery = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as MediaItem[];
      setDbItems(docs);
      setGalleryLoaded(true);
    }, (err) => {
      console.warn("Error subscribing to gallery in storefront, utilizing default catalogue:", err);
      setGalleryLoaded(true);
    });

    const qCat = query(collection(db, "gallery_categories"), orderBy("name", "asc"));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const cats = snapshot.docs.map((d) => d.data().name || d.id);
        setCategories(Array.from(new Set(cats)));
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
      setCatLoaded(true);
    }, (err) => {
      console.warn("Error fetching gallery_categories, using defaults:", err);
      setCategories(DEFAULT_CATEGORIES);
      setCatLoaded(true);
    });

    return () => {
      unsubscribeGallery();
      unsubscribeCat();
    };
  }, []);

  const filterCategories = ["All", "Photos", "Videos", ...categories];

  const mediaItems: MediaItem[] = dbItems.length > 0
    ? dbItems
    : defaultGallery.map((item, index) => ({ id: index + 1, ...item }));

  const filteredItems = mediaItems.filter((item) => {
    const isVid = item.isVideo || item.type === "video" || (item.imageUrl || item.secure_url || "").match(/\.(mp4|mov|webm)($|\?)/i);
    const tag = item.eventTag || item.tag || item.category;

    if (activeFilter === "All") return true;
    if (activeFilter === "Photos") return !isVid;
    if (activeFilter === "Videos") return Boolean(isVid);
    return tag === activeFilter;
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

        {/* Conditional Rendering: Skeleton Loader vs Actual Data */}
        {isLoading ? (
          <div className="space-y-14">
            {/* Skeleton Filter Chips */}
            <div className="flex justify-center flex-wrap gap-3">
              {[...Array(6)].map((_, idx) => (
                <div 
                  key={idx} 
                  className="w-24 h-10 rounded-full animate-pulse bg-[#18181B] border border-white/5"
                />
              ))}
            </div>

            {/* Skeleton Media Grid */}
            <div 
              className="grid gap-6"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
            >
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl aspect-[3/4] animate-pulse bg-[#18181B] border border-white/5 shadow-lg"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* Responsive Filter Navigation (Horizontal scrolling on mobile, flex-wrap on desktop) */}
            <div className="flex overflow-x-auto md:flex-wrap justify-start md:justify-center gap-3 mb-14 pb-2 md:pb-0 scrollbar-none">
              {filterCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide border transition-all duration-300 shrink-0 ${
                    activeFilter === category
                      ? "bg-gold/10 border-gold text-gold shadow-[0_4px_20px_rgba(212,175,55,0.2)]"
                      : "bg-[#151515] border-white/5 text-white hover:border-gold/50 hover:text-gold"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Graceful Empty State vs Media Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-[#151515] rounded-3xl border border-white/10 max-w-2xl mx-auto p-8 shadow-2xl">
                <p className="text-2xl font-bold text-white mb-2">No showcase assets found.</p>
                <p className="text-sm text-gray-400">
                  We are currently updating our portfolio for <span className="text-gold font-semibold">&ldquo;{activeFilter}&rdquo;</span>. Please select another tag to explore more event memories!
                </p>
              </div>
            ) : (
              <div 
                className="grid gap-6"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
              >
                {filteredItems.map((item) => {
                  const assetUrl = item.imageUrl || item.secure_url || "";
                  const isVid = item.isVideo || item.type === "video" || assetUrl.match(/\.(mp4|mov|webm)($|\?)/i);
                  const itemTitle = item.title || item.caption || "Event Moment";
                  const itemTag = item.eventTag || item.tag || item.category || "Moment";

                  return (
                    <div
                      key={item.id}
                      className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#151515] border border-white/5 group cursor-pointer transition-all duration-400 hover:-translate-y-1.5 hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-col justify-end"
                    >
                {/* Media Rendering: Image or Interactive Video Reel */}
                {isVid ? (
                  <video
                    src={assetUrl}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 cubic-bezier(0.25, 0.46, 0.45, 0.94) group-hover:scale-105"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <Image
                    src={assetUrl}
                    alt={itemTitle}
                    fill
                    className="object-cover transition-transform duration-700 cubic-bezier(0.25, 0.46, 0.45, 0.94) group-hover:scale-105"
                  />
                )}

                {/* Video Badge */}
                {isVid && (
                  <div className="absolute top-4 right-4 bg-black/85 text-gold text-xs font-extrabold tracking-widest px-3.5 py-1.5 rounded-full border border-gold/40 backdrop-blur-md flex items-center gap-1.5 z-10 group-hover:bg-gold group-hover:text-black transition-colors duration-300 shadow">
                    <span className="animate-pulse">▷</span> VIDEO
                  </div>
                )}

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/95 via-[#0f0f0f]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-8 z-10">
                  <span className="text-gold text-xs font-semibold tracking-[0.15em] uppercase mb-1.5 translate-y-3 group-hover:translate-y-0 transition-transform duration-400">
                    {itemTag}
                  </span>
                  <h3 className="text-white text-xl font-bold translate-y-3 group-hover:translate-y-0 transition-transform duration-400 delay-50">
                    {itemTitle}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    )}
      </div>
    </section>
  );
}
