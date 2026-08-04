"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { defaultServicesList } from "@/data/services";
import BookServiceButton from "./BookServiceButton";

export default function Services() {
  const [dbServices, setDbServices] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDbServices(items);
      },
      (error) => {
        console.warn("Error subscribing to real-time services:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Uses our central array so dropdown options and service cards always match
  const servicesToRender = dbServices.length > 0 ? dbServices : defaultServicesList;

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
        <div 
          className="grid gap-10" 
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
        >
          {servicesToRender.map((service, index) => (
            <div 
              key={index} 
              className="bg-[#151515] rounded-2xl border border-white/5 overflow-hidden flex flex-col group transition-all duration-400 hover:-translate-y-1 hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              {/* Image Header */}
              <div className="h-[220px] relative overflow-hidden">
                {service.imageUrl && (
                  <Image 
                    src={service.imageUrl} 
                    alt={service.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent opacity-80" />
                
                {service.price && (
                  <div className="absolute top-4 right-4 bg-[#1a1a1a]/85 backdrop-blur-sm border border-gold/30 text-gold px-3 py-1.5 rounded-full text-[0.85rem] font-semibold tracking-wide z-10">
                    {service.price}
                  </div>
                )}
              </div>
              
              {/* Card Body */}
              <div className="p-[30px] flex flex-col flex-grow relative z-10">
                <div className="flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {service.title}
                  </h3>
                  <p className="text-[#a0a0a0] leading-[1.6] text-[0.95rem] mb-6 flex-grow">
                    {service.description}
                  </p>
                </div>
                
                {/* Dynamic Trigger Button: Opens modal & pre-selects this service card's event title */}
                <BookServiceButton serviceTitle={service.title} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
