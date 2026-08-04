"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Review } from "@/types/admin";
import { Trash2, Star, MessageSquare, Loader2, ShieldAlert, Copy, Check, CheckCircle2 } from "lucide-react";

interface TestimonialModeratorTabProps {
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

const DEFAULT_REVIEWS: Partial<Review>[] = [
  {
    id: "default-1",
    name: "Vikram M.",
    role: "Sports Club Banquet",
    eventType: "Sports Club Banquet",
    rating: 5,
    content: "We brought them in to cater our cricket club's end-of-season banquet. The menu was hearty, premium, and absolutely spot-on for the team. Highly recommended!",
  },
  {
    id: "default-2",
    name: "Anjali K.",
    role: "Private Holiday Gathering",
    eventType: "Private Holiday Gathering",
    rating: 5,
    content: "I hosted a cozy holiday party for 10 people and wanted fine dining brought directly to my home. The customized spread was immaculate. A true luxury experience.",
  },
  {
    id: "default-3",
    name: "Priya S.",
    role: "Signature Wedding",
    eventType: "Signature Wedding",
    rating: 5,
    content: "The attention to detail was incredible. From the stunning presentation to the flawless service, they made our grand reception an unforgettable experience.",
  },
  {
    id: "default-4",
    name: "Rahul D.",
    role: "Corporate Annual Gala",
    eventType: "Corporate Annual Gala",
    rating: 5,
    content: "Anna Caterers handled our corporate gala with 500+ guests effortlessly. The live cooking stations and signature Kerala delicacies were the highlight of the evening!",
  },
  {
    id: "default-5",
    name: "Sneha P.",
    role: "Anniversary Celebration",
    eventType: "Anniversary Celebration",
    rating: 5,
    content: "Every single dish was bursting with authentic flavors and presented like artwork. Our family is already booking them again for our parent's golden anniversary.",
  },
];

export default function TestimonialModeratorTab({ showToast }: TestimonialModeratorTabProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const firestoreRulesText = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /reviews/{review} {\n      allow read, create: if true;\n      allow update, delete: if request.auth != null;\n    }\n    match /{document=**} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n  }\n}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(firestoreRulesText);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Review[];
      setReviews(docs);
      setLoading(false);
    }, (err: any) => {
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
      }
      console.warn("Error subscribing to reviews collection:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, name: string, isDefault?: boolean) => {
    if (isDefault) {
      showToast("info", "This is a permanent storefront default testimonial. Real client reviews submitted from your website appear above these defaults and can be deleted instantly.");
      return;
    }
    if (!confirm(`Permanently delete testimonial from "${name}" from the live public storefront?`)) return;
    try {
      await deleteDoc(doc(db, "reviews", id));
      showToast("info", `Permanently removed testimonial from "${name}".`);
    } catch (err: any) {
      console.error("Failed to delete testimonial:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
      }
      showToast("error", "Failed to delete testimonial from Firestore.");
    }
  };

  // Combine live database submissions at the top with permanent storefront defaults below
  const itemsToRender: any[] = [
    ...reviews,
    ...DEFAULT_REVIEWS.map(r => ({ ...r, isDefault: true }))
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Module Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-widest mb-2">
            <MessageSquare className="w-4 h-4" /> Live Reputation Feed
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Testimonial <span className="text-[#D4AF37] font-serif italic">Moderator</span>.
          </h2>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Manage live guest reviews displayed on the public storefront. Permanently delete inappropriate submissions.
          </p>
        </div>

        {/* Status indicator pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181B] border border-[#D4AF37]/30 text-xs font-bold text-[#D4AF37] shrink-0 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span>Live DB Reviews: {reviews.length} | Total Shown: {itemsToRender.length}</span>
        </div>
      </div>

      {/* Critical Educational Gold Banner for Public Submission Permission */}
      <div className="p-6 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] space-y-3 shadow-lg">
        <div className="flex items-center gap-2 font-extrabold text-sm text-white">
          <span>⚙️ IMPORTANT: Ensure Firestore Rules Allow Public Review Submissions!</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          If reviews submitted on the public website do not appear here, it means Firestore Security Rules are currently blocking unauthenticated users from writing to the <code className="text-[#D4AF37] font-mono font-bold">/reviews</code> collection. To fix this immediately, copy the rules below and paste them into <a href="https://console.firebase.google.com/project/anna-caterer-2c82a/firestore/rules" target="_blank" rel="noreferrer" className="text-white underline font-bold">Firebase Console &gt; Firestore Database &gt; Rules</a> and click <strong>Publish</strong>:
        </p>
        <div className="relative font-mono text-[11px] bg-[#0D0D0D] p-3 rounded-xl text-green-300 border border-white/10 overflow-x-auto">
          <button
            type="button"
            onClick={copyToClipboard}
            className="absolute top-2 right-2 px-2.5 py-1 rounded bg-[#D4AF37] text-black font-bold text-[10px] flex items-center gap-1 hover:bg-[#b5952f] shadow"
          >
            {copiedRules ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedRules ? "Copied!" : "Copy Rules"}</span>
          </button>
          <pre>{firestoreRulesText}</pre>
        </div>
      </div>

      {permissionBlocked && (
        <div className="p-6 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>Firestore Database Security Rules are blocking admin moderation! Please publish the copyable rules above.</span>
          </div>
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium">
          💡 No custom client submissions in database yet. Currently showing the 5 live storefront default testimonials. When guests submit reviews through the public storefront, they will immediately stream here for instant moderation!
        </div>
      )}

      {/* Review List & Actions wrapped in scrollable container */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-3" />
            <span className="text-xs font-bold uppercase tracking-widest">Synchronizing live reviews...</span>
          </div>
        ) : itemsToRender.length === 0 ? (
          <div className="p-16 text-center bg-[#18181B] border border-white/5 rounded-3xl text-gray-400 font-medium">
            No reviews found in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            {itemsToRender.map((rev) => {
              const reviewText = rev.content || rev.review || "No feedback text provided.";
              const displayEvent = rev.eventType || rev.role || "Signature Wedding";
              const ratingValue = rev.rating && typeof rev.rating === "number" ? rev.rating : 5;

              return (
                <div
                  key={rev.id}
                  className="p-7 rounded-3xl bg-[#18181B] border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-between shadow-xl relative group"
                >
                  <div>
                    {/* Live Badge & Stars */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-green-500/15 text-green-400 border border-green-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span>Live on Storefront</span>
                      </span>

                      <div className="flex items-center gap-1 text-[#D4AF37]">
                        {Array.from({ length: ratingValue }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>

                    {/* Quote Content */}
                    <blockquote className="text-gray-300 text-sm leading-relaxed italic font-serif mb-6 border-l-2 border-[#D4AF37]/50 pl-4">
                      &ldquo;{reviewText}&rdquo;
                    </blockquote>
                  </div>

                  {/* Author Info & Single Prominent Delete Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <div className="min-w-0 pr-4">
                      <h4 className="font-bold text-white text-base truncate">{rev.name || "Anonymous Guest"}</h4>
                      <p className="text-xs text-[#D4AF37] font-medium truncate mt-0.5">
                        {displayEvent} {rev.createdAt ? `• ${new Date(rev.createdAt?.seconds ? rev.createdAt.seconds * 1000 : Date.now()).toLocaleDateString()}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id, rev.name, rev.isDefault)}
                      title="Permanently Delete Review from Public Storefront"
                      className="px-4 py-2.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0 shadow-md group-hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
