"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { defaultServicesList } from "@/data/services";
import BookServiceButton from "./BookServiceButton";

export default function Services() {
  const [dbServices, setDbServices] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "services"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
        items.sort((a, b) => {
          const timeB = b?.createdAt?.toMillis?.() || b?.createdAt?.seconds * 1000 || 0;
          const timeA = a?.createdAt?.toMillis?.() || a?.createdAt?.seconds * 1000 || 0;
          return timeB - timeA;
        });
        setDbServices(items);
      },
      (error) => {
        console.warn("Error subscribing to real-time services:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Uses our central array so dropdown options and service cards always match
  const rawServices = dbServices.length > 0 ? dbServices : defaultServicesList;
  const servicesToRender = [...rawServices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <section id="services" className="py-24 bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-gold tracking-[0.2em] text-sm font-semibold uppercase mb-4">
            Our Expertise
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Tailored <span className="text-gold italic font-serif">Occasions.</span>
          </h2>
          <p className="text-[#a0a0a0] text-lg leading-relaxed">
            Every event demands a unique atmosphere. We provide precisely curated menus that match the scale, theme, and elegance of your gathering.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 md:gap-10">
          {servicesToRender.map((service, index) => (
            <motion.div 
              key={service.id || index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25), ease: "easeOut" }}
              className="bg-[#151515] rounded-xl md:rounded-2xl border border-white/5 overflow-hidden flex flex-col group transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              {/* Image Header */}
              <div className="h-28 sm:h-44 md:h-[220px] relative overflow-hidden shrink-0">
                {service.imageUrl && (
                  <Image 
                    src={service.imageUrl} 
                    alt={service.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent opacity-80" />
                

              </div>
              
              {/* Card Body */}
              <div className="p-2.5 sm:p-6 md:p-[30px] flex flex-col flex-grow relative z-10">
                <div className="flex-grow flex flex-col">
                  <h3 className="text-xs sm:text-xl md:text-2xl font-bold mb-2 md:mb-3 text-white line-clamp-1 md:line-clamp-none" title={service.title}>
                    {service.title}
                  </h3>
                  <p className="hidden sm:block text-[#a0a0a0] leading-relaxed text-xs sm:text-sm md:text-[0.95rem] mb-4 md:mb-6 flex-grow line-clamp-3 md:line-clamp-none">
                    {service.description}
                  </p>
                </div>
                
                {/* Dynamic Trigger Button: Opens modal & pre-selects this service card's event title */}
                <BookServiceButton serviceTitle={service.title} />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
