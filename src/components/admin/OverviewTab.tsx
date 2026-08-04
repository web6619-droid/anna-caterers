"use client";

import React from "react";
import { AdminTabType } from "@/types/admin";
import { 
  BarChart3, 
  MessageSquare, 
  Utensils, 
  Sparkles, 
  ArrowRight, 
  PlusCircle, 
  CheckCircle,
  Image as ImageIcon,
  PhoneCall,
  ClipboardList
} from "lucide-react";

interface OverviewTabProps {
  metrics: {
    pendingReviews: number;
    totalMenuItems: number;
    activeServices: number;
    totalGalleryImages: number;
    totalBookings?: number;
  };
  onSwitchTab: (tab: AdminTabType) => void;
}

export default function OverviewTab({ metrics, onSwitchTab }: OverviewTabProps) {
  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18181B] via-[#1f1f23] to-[#18181B] p-8 md:p-10 border border-[#D4AF37]/30 shadow-2xl shadow-black">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Executive Command Center
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Welcome, <span className="text-[#D4AF37] font-serif italic">Master Admin</span>.
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
            Oversee Anna Caterers culinary experiences, manage global event pricing, approve guest testimonials, and control enterprise CDN assets in real-time.
          </p>
          
          <div className="flex flex-wrap gap-3.5 items-center">
            <button
              onClick={() => onSwitchTab("services")}
              className="px-6 py-3.5 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#b5952f] transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              <span>Manage Services</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Decorative Gold Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none translate-x-20 -translate-y-20" />
      </div>

      {/* Metrics Cards Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Real-Time Platform Analytics
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {/* Custom Event Bookings Card */}
          <div 
            onClick={() => onSwitchTab("bookings")}
            className="p-6 rounded-2xl bg-[#18181B] border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] transition-all duration-300 group cursor-pointer shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-colors duration-300">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                Leads
              </span>
            </div>
            <h4 className="text-4xl font-black text-white tracking-tight mb-1 group-hover:text-[#D4AF37] transition-colors">
              {metrics.totalBookings || 0}
            </h4>
            <p className="text-xs text-gray-300 font-bold tracking-wide">
              Custom Catering Orders
            </p>
          </div>

          {/* Live Reviews Card */}
          <div 
            onClick={() => onSwitchTab("testimonials")}
            className="p-6 rounded-2xl bg-[#18181B] border border-white/5 hover:border-[#D4AF37]/50 transition-all duration-300 group cursor-pointer shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-[#D4AF37] group-hover:text-black transition-colors duration-300">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Live
              </span>
            </div>
            <h4 className="text-4xl font-black text-white tracking-tight mb-1 group-hover:text-[#D4AF37] transition-colors">
              {metrics.pendingReviews || 5}
            </h4>
            <p className="text-xs text-gray-400 font-medium tracking-wide">
              Live Reviews {metrics.pendingReviews === 0 && "(Defaults)"}
            </p>
          </div>

          {/* Total Menu Items Card */}
          <div 
            onClick={() => onSwitchTab("menu")}
            className="p-6 rounded-2xl bg-[#18181B] border border-white/5 hover:border-[#D4AF37]/50 transition-all duration-300 group cursor-pointer shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-[#D4AF37] group-hover:text-black transition-colors duration-300">
                <Utensils className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-white/5 text-gray-300">
                Dishes
              </span>
            </div>
            <h4 className="text-4xl font-black text-white tracking-tight mb-1 group-hover:text-[#D4AF37] transition-colors">
              {metrics.totalMenuItems || 9}
            </h4>
            <p className="text-xs text-gray-400 font-medium tracking-wide">
              Active Menu Offerings {metrics.totalMenuItems === 0 && "(Defaults)"}
            </p>
          </div>

          {/* Active Services Card */}
          <div 
            onClick={() => onSwitchTab("services")}
            className="p-6 rounded-2xl bg-[#18181B] border border-white/5 hover:border-[#D4AF37]/50 transition-all duration-300 group cursor-pointer shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-[#D4AF37] group-hover:text-black transition-colors duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Live
              </span>
            </div>
            <h4 className="text-4xl font-black text-white tracking-tight mb-1 group-hover:text-[#D4AF37] transition-colors">
              {metrics.activeServices || 6}
            </h4>
            <p className="text-xs text-gray-400 font-medium tracking-wide">
              Event Packages {metrics.activeServices === 0 && "(Defaults)"}
            </p>
          </div>

          {/* Gallery Assets Card */}
          <div 
            onClick={() => onSwitchTab("gallery")}
            className="p-6 rounded-2xl bg-[#18181B] border border-white/5 hover:border-[#D4AF37]/50 transition-all duration-300 group cursor-pointer shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-[#D4AF37] group-hover:text-black transition-colors duration-300">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-white/5 text-gray-300">
                CDN Vault
              </span>
            </div>
            <h4 className="text-4xl font-black text-white tracking-tight mb-1 group-hover:text-[#D4AF37] transition-colors">
              {metrics.totalGalleryImages || 10}
            </h4>
            <p className="text-xs text-gray-400 font-medium tracking-wide">
              Showcase Assets {metrics.totalGalleryImages === 0 && "(Defaults)"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="pt-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Quick Action Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => onSwitchTab("contact")}
            className="p-5 rounded-2xl bg-[#18181B] border border-white/5 hover:border-[#D4AF37]/50 hover:bg-[#1f1f23] transition-all text-left flex items-center justify-between group cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">Configure Contact Info</p>
                <p className="text-xs text-gray-500">Master WhatsApp & Map URLs</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onSwitchTab("testimonials")}
            className="p-5 rounded-2xl bg-[#18181B] border border-white/5 hover:border-[#D4AF37]/50 hover:bg-[#1f1f23] transition-all text-left flex items-center justify-between group cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">Moderate Testimonials</p>
                <p className="text-xs text-gray-500">Manage live reviews & delete spam</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onSwitchTab("gallery")}
            className="p-5 rounded-2xl bg-[#18181B] border border-white/5 hover:border-[#D4AF37]/50 hover:bg-[#1f1f23] transition-all text-left flex items-center justify-between group cursor-pointer shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">Upload Event Photography</p>
                <p className="text-xs text-gray-500">Direct streaming to Cloudinary</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
}
