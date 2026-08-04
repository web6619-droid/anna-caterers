"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { defaultGallery } from "@/data/defaultCatalogue";

type MediaItem = {
  id?: string | number;
  title?: string;
  caption?: string;
  tag?: string;
  eventTag?: string;
  category?: string;
  isVideo?: boolean;
  type?: string;
  imageUrl?: string;
  secure_url?: string;
};

export default function Gallery() {
  const [dbItems, setDbItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as MediaItem[];
        setDbItems(docs);
      },
      (err) => {
        console.warn("Error subscribing to gallery on homepage:", err);
      }
    );

    return () => unsubscribe();
  }, []);

  // When live database contains uploaded items (e.g. 1 item), render ONLY those items without fake fallbacks.
  // When database is completely empty (0 items), display 4 default catalogue items as initial showcase.
  const sourceItems: MediaItem[] =
    dbItems.length > 0
      ? dbItems
      : defaultGallery.map((item, index) => ({ id: index + 1, ...item }));

  const itemsToRender = sourceItems.slice(0, 4);

  // Responsive Grid styling that handles 1, 2, 3, or 4 items gracefully without stretching awkwardly
  const getGridClass = (count: number) => {
    if (count === 1) return "flex justify-center max-w-sm mx-auto w-full";
    if (count === 2) return "grid grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto gap-6 w-full";
    if (count === 3) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto gap-6 w-full";
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full";
  };

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

        <div className={getGridClass(itemsToRender.length)}>
          {itemsToRender.map((item, index) => {
            const assetUrl = item.imageUrl || item.secure_url || "";
            const isVid =
              item.isVideo ||
              item.type === "video" ||
              assetUrl.match(/\.(mp4|mov|webm)($|\?)/i);
            const itemTitle = item.title || item.caption || "Event Moment";
            const itemTag = item.eventTag || item.tag || item.category || "Moment";

            return (
              <div
                key={item.id || index}
                className="relative h-96 w-full rounded-2xl overflow-hidden bg-[#151515] border border-white/5 group cursor-pointer transition-all duration-400 hover:-translate-y-1.5 hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex flex-col justify-end"
              >
                {isVid ? (
                  <video
                    src={assetUrl}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

                {/* Video Badge */}
                {isVid && (
                  <div className="absolute top-4 right-4 bg-black/80 text-gold text-xs font-bold tracking-wider px-3 py-1.5 rounded-full border border-gold/40 backdrop-blur-md flex items-center gap-1.5 z-10 group-hover:bg-gold group-hover:text-black transition-all duration-300">
                    <span className="animate-pulse">▷</span> VIDEO
                  </div>
                )}

                {/* Hover Gradient Overlay with Tag & Title */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/95 via-[#0f0f0f]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-6 z-10">
                  <span className="text-gold text-xs font-semibold tracking-[0.15em] uppercase mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                    {itemTag}
                  </span>
                  <h3 className="text-white text-lg font-bold translate-y-2 group-hover:translate-y-0 transition-transform duration-400 delay-50 truncate">
                    {itemTitle}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/gallery"
            className="inline-block px-8 py-4 bg-[#1a1a1a] border border-white/10 text-white font-semibold rounded-full hover:bg-gold hover:text-black hover:border-gold transition-colors tracking-wide shadow-lg"
          >
            View Full Portfolio →
          </Link>
        </div>
      </div>
    </section>
  );
}
