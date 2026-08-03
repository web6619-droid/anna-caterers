"use client";

import { Phone, MessageCircle, MapPin } from "lucide-react";
import { adminContactSettings } from "@/data/config";

// Custom inline SVG for Instagram to guarantee cross-version compatibility without import build errors
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function FloatingActions() {
  // Exactly 4 icons configured with dynamic admin destinations & required URL protocols
  const actions = [
    {
      icon: InstagramIcon,
      href: adminContactSettings.instagramUrl,
      label: "Instagram",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      icon: Phone,
      href: `tel:${adminContactSettings.phone}`,
      label: "Call Us",
      target: "_self", // Native telephony protocol
      rel: undefined,
    },
    {
      icon: MessageCircle,
      href: `https://wa.me/${adminContactSettings.whatsappNumber}`,
      label: "WhatsApp",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      icon: MapPin,
      href: adminContactSettings.googleMapsUrl,
      label: "Google Maps Location",
      target: "_blank",
      rel: "noopener noreferrer",
    },
  ];

  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3.5">
      {actions.map((action, index) => (
        <a
          key={index}
          href={action.href}
          target={action.target}
          rel={action.rel}
          title={`Connect via ${action.label}`}
          aria-label={action.label}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[#151515]/90 backdrop-blur-md border border-white/20 text-white shadow-lg hover:text-[#d4af37] hover:border-[#d4af37] hover:bg-[#1c1c1c] transition-all duration-300 hover:scale-110 hover:shadow-[0_4px_18px_rgba(212,175,55,0.35)] cursor-pointer group"
        >
          <action.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-105" />
        </a>
      ))}
    </div>
  );
}
