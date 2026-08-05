"use client";

import { useState, useEffect } from "react";
import { X, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Reviews() {
  const initialTestimonials = [
    {
      stars: "★★★★★",
      quote: "We brought them in to cater our cricket club's end-of-season banquet. The menu was hearty, premium, and absolutely spot-on for the team. Highly recommended!",
      initial: "V",
      author: "Vikram M.",
      role: "Sports Club Banquet",
    },
    {
      stars: "★★★★★",
      quote: "I hosted a cozy holiday party for 10 people and wanted fine dining brought directly to my home. The customized spread was immaculate. A true luxury experience.",
      initial: "A",
      author: "Anjali K.",
      role: "Private Holiday Gathering",
    },
    {
      stars: "★★★★★",
      quote: "The attention to detail was incredible. From the stunning presentation to the flawless service, they made our grand reception an unforgettable experience.",
      initial: "P",
      author: "Priya S.",
      role: "Signature Wedding",
    },
    {
      stars: "★★★★★",
      quote: "Anna Caterers handled our corporate gala with 500+ guests effortlessly. The live cooking stations and signature Kerala delicacies were the highlight of the evening!",
      initial: "R",
      author: "Rahul D.",
      role: "Corporate Annual Gala",
    },
    {
      stars: "★★★★★",
      quote: "Every single dish was bursting with authentic flavors and presented like artwork. Our family is already booking them again for our parent's golden anniversary.",
      initial: "S",
      author: "Sneha P.",
      role: "Anniversary Celebration",
    },
  ];

  const [reviewsList, setReviewsList] = useState(initialTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Subscribe to live 'reviews' collection from Firestore and merge with defaults
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const liveReviews = snapshot.docs.map((d) => {
          const data = d.data();
          const rValue = data.rating && typeof data.rating === "number" ? Math.min(5, Math.max(1, data.rating)) : 5;
          const authorName = data.name || "Anonymous";
          return {
            id: d.id,
            stars: "★".repeat(rValue) + "☆".repeat(5 - rValue),
            quote: data.content || data.review || "Excellent culinary service and event presentation!",
            initial: authorName.trim().charAt(0).toUpperCase() || "C",
            author: authorName.trim(),
            role: data.eventType || data.role || "Signature Event",
          };
        });
        // Lead with custom live database submissions, followed by default luxury testimonials
        setReviewsList([...liveReviews, ...initialTestimonials]);
      } else {
        setReviewsList(initialTestimonials);
      }
    }, (err) => {
      console.warn("Error streaming live reviews on storefront:", err);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-Rotation Interval (Rotates every 2.5 seconds continuously)
  useEffect(() => {
    if (isModalOpen) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviewsList.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [isModalOpen, reviewsList.length]);

  // Navigation handlers for manual controls
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviewsList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviewsList.length) % reviewsList.length);
  };

  // Calculate the 3 currently visible cards in an infinite loop using modulo arithmetic
  const visibleCards = [
    reviewsList[currentIndex % reviewsList.length],
    reviewsList[(currentIndex + 1) % reviewsList.length],
    reviewsList[(currentIndex + 2) % reviewsList.length],
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string) || "Anonymous";
    const eventType = (formData.get("eventType") as string) || "Signature Event";
    const reviewText = formData.get("review") as string;

    const newReviewCard = {
      id: "temp-" + Date.now(),
      stars: "★".repeat(rating) + "☆".repeat(5 - rating),
      quote: reviewText,
      initial: name.trim().charAt(0).toUpperCase() || "C",
      author: name.trim(),
      role: eventType,
    };

    try {
      // Write directly to Firestore 'reviews' collection so it synchronizes in real-time with Admin Dashboard!
      await addDoc(collection(db, "reviews"), {
        name: name.trim(),
        eventType: eventType || "Signature Event",
        role: eventType || "Signature Event",
        content: reviewText.trim(),
        review: reviewText.trim(),
        rating: rating,
        createdAt: serverTimestamp(),
      });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setIsModalOpen(false);
        setRating(5);
        setCurrentIndex(0); // Immediately highlight newly submitted live review at front of carousel!
      }, 1500);
    } catch (error: any) {
      console.error("Error saving review to Firestore:", error);
      if (error?.code === "permission-denied" || error?.message?.includes("permission") || error?.message?.includes("insufficient")) {
        alert("⚠️ Could not save your review to the live Firebase Database because Firestore Security Rules are currently blocking unauthenticated guest submissions!\n\nTo fix this instantly, open Firebase Console > Firestore Database > Rules, and allow public creates on the /reviews collection:\n\nmatch /reviews/{review} {\n  allow read, create: if true;\n  allow update, delete: if request.auth != null;\n}");
      } else {
        alert("Notice: Added your feedback to the local active session. Ensure network connectivity for permanent database persistence.");
      }
      // Fallback optimistic UI update for local demonstration
      setReviewsList((prevReviews) => [newReviewCard, ...prevReviews]);
      setCurrentIndex(0);
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="py-24 bg-[#0f0f0f] text-white border-t border-white/5 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[#d4af37] tracking-[0.2em] text-xs md:text-sm font-bold uppercase block mb-3">
            CLIENT TESTIMONIALS
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight">
            Words from <span className="text-[#d4af37] italic font-serif">Clients.</span>
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center bg-[#1a1a1a] text-[#d4af37] border border-[#d4af37] px-8 py-3.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all duration-300 hover:bg-[#d4af37] hover:text-black hover:-translate-y-1 hover:shadow-[0_6px_25px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            + LEAVE YOUR REVIEW
          </button>
        </div>

        {/* Carousel Container (Runs continuously without freezing when mouse rests on screen) */}
        <div className="relative px-2 sm:px-12">
          {/* 3-Card Responsive Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500">
            {visibleCards.map((item, idx) => (
              <div
                key={`${item.author}-${idx}`}
                className="bg-[#151515] border border-white/5 rounded-[22px] p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:border-[#d4af37]/50 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)] shadow-[0_10px_30px_rgba(0,0,0,0.4)] min-h-[300px] transform opacity-100 animate-fadeIn"
                style={{
                  animation: "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div>
                  <div className="text-[#d4af37] text-xl tracking-wider mb-5">
                    {item.stars}
                  </div>
                  <p className="text-white text-base sm:text-lg leading-relaxed mb-8 font-normal line-clamp-4">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-5 border-t border-white/10 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] font-bold text-xl flex items-center justify-center shrink-0 shadow-inner">
                    {item.initial}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-white text-base font-bold tracking-wide">
                      {item.author}
                    </h4>
                    <span className="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold mt-0.5">
                      {item.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation Bar (Prev / Play-Pause / Next & Dots) */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={handlePrev}
              aria-label="Previous review"
              className="w-11 h-11 rounded-full bg-[#151515] border border-white/10 hover:border-[#d4af37] text-white/70 hover:text-[#d4af37] flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-2">
              {reviewsList.map((_, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive ? "w-8 bg-[#d4af37]" : "w-2.5 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              })}
            </div>

            <button
              onClick={handleNext}
              aria-label="Next review"
              className="w-11 h-11 rounded-full bg-[#151515] border border-white/10 hover:border-[#d4af37] text-white/70 hover:text-[#d4af37] flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>

      {/* Review Submission Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
          style={{ width: "100vw", height: "100vh", top: 0, left: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="relative bg-[#151515] border border-white/10 rounded-[24px] p-6 sm:p-8 max-w-[480px] w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-left my-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-white/60 hover:text-[#d4af37] transition-colors p-1 z-10 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-white font-bold text-2xl mb-2 tracking-tight">
              Share Your Experience
            </h3>
            <p className="text-[#a0a0a0] text-sm mb-6">
              We would love to feature your glowing review on our website.
            </p>

            {successMsg ? (
              <div className="py-10 text-center bg-[#d4af37]/10 border border-[#d4af37] rounded-xl my-4">
                <h4 className="text-[#d4af37] text-xl font-bold mb-1">Thank you! ✓</h4>
                <p className="text-gray-300 text-sm">Your feedback is now live on the carousel.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Rating Section */}
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-2">
                    Rating Out of 5
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((starIdx) => {
                      const isFilled = starIdx <= (hoverRating || rating);
                      return (
                        <button
                          type="button"
                          key={starIdx}
                          onMouseEnter={() => setHoverRating(starIdx)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starIdx)}
                          className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors duration-200 ${
                              isFilled
                                ? "fill-[#d4af37] text-[#d4af37]"
                                : "fill-transparent text-gray-500 hover:text-[#d4af37]"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Vikram M."
                    className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm"
                  />
                </div>

                {/* Event Type Field */}
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1.5">
                    Event Type (Optional)
                  </label>
                  <input
                    type="text"
                    name="eventType"
                    placeholder="e.g. Sports Club Banquet / Wedding"
                    className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm"
                  />
                </div>

                {/* Review Text Field */}
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1.5">
                    Your Review
                  </label>
                  <textarea
                    name="review"
                    rows={4}
                    required
                    placeholder="Tell us about the menu, presentation, and overall service..."
                    className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors text-sm resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#d4af37] text-black font-bold text-sm uppercase tracking-wider py-3.5 rounded-lg hover:bg-[#b5952f] transition-colors duration-300 mt-2 disabled:opacity-75 cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
