import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Anna Caterers Executive Portal",
  description: "Secure management suite for Anna Caterers services, menu dishes, client reviews, and Cloudinary enterprise assets.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans selection:bg-[#D4AF37] selection:text-black">
      {children}
    </div>
  );
}
