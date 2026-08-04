"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { defaultMenu } from "@/data/defaultCatalogue";
import { useBooking, SelectedMenuItem } from "@/context/BookingContext";
import { Plus, Trash2, ArrowRight, Check, Sparkles, UtensilsCrossed } from "lucide-react";

type MenuItem = {
  id: string | number;
  title: string;
  category: string;
  subCourse?: string;
  imageUrl: string;
  price?: string;
  description?: string;
};

const LOGICAL_CATEGORIES = [
  "Beverages",
  "Starters",
  "Main Course",
  "Desserts",
  "Live Counters"
];

const MAIN_COURSE_SUBTABS = ["1st Course", "2nd Course"];

export default function MenuClient() {
  const [activeFilter, setActiveFilter] = useState("Beverages");
  const [activeSubCourse, setActiveSubCourse] = useState("1st Course");
  const [dbItems, setDbItems] = useState<MenuItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);

  const { selectedMenu, addToMenu, removeFromMenu, isDishSelected, perGuestTotal, cartTotal, eventDetails } = useBooking();
  const router = useRouter();

  useEffect(() => {
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

    return () => {
      unsubscribeMenu();
    };
  }, []);

  // Helper to convert price strings like "₹350 / portion" into pure integers for computation
  const parsePrice = (priceStr?: string | number): number => {
    if (typeof priceStr === "number") return priceStr;
    if (!priceStr) return 0;
    const digits = priceStr.toString().replace(/[^0-9]/g, "");
    return parseInt(digits, 10) || 0;
  };

  // Flexible category matcher to harmonize Admin inputs and default catalogue items
  const matchCategory = (itemCategory: string, targetCategory: string): boolean => {
    const ic = (itemCategory || "").trim().toLowerCase();
    const tc = targetCategory.trim().toLowerCase();
    if (ic === tc) return true;
    if (tc === "beverages" && (ic === "beverage" || ic === "drinks")) return true;
    if (tc === "starters" && (ic === "starter" || ic === "appetizer")) return true;
    if (tc === "desserts" && (ic === "dessert" || ic === "sweets" || ic === "pudding")) return true;
    if (tc === "live counters" && (ic === "live counter" || ic === "kerala traditional" || ic === "live stations" || ic === "action counter")) return true;
    if (tc === "main course" && (ic === "main course" || ic === "mains" || ic === "entree")) return true;
    return false;
  };

  const itemsToRender: MenuItem[] = dbItems.length > 0 
    ? dbItems 
    : defaultMenu.map((item, index) => ({ id: index, ...item }));

  // Filter items by main category and by sub-course if Main Course is active
  const filteredItems = itemsToRender.filter((item) => {
    const isCatMatch = matchCategory(item.category, activeFilter);
    if (!isCatMatch) return false;

    if (activeFilter === "Main Course") {
      const sub = (item.subCourse || "").trim().toLowerCase();
      if (sub && sub !== activeSubCourse.toLowerCase()) return false;
      // Map legacy/untagged main course items to 1st Course by default
      if (!sub && activeSubCourse !== "1st Course") return false;
    }
    return true;
  });

  return (
    <section className="py-24 bg-[#0f0f0f] text-white pb-44 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#D4AF37] tracking-[0.2em] text-xs md:text-sm font-extrabold uppercase block mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Interactive Culinary Cart</span>
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-5 tracking-tight">
            Curate Your <span className="text-[#D4AF37] italic font-serif">Feast.</span>
          </h1>
          <p className="text-[#a0a0a0] text-sm sm:text-base md:text-lg leading-relaxed">
            Select your preferred dishes across our multi-course repertoire. Your custom price per plate and total event investment will calculate dynamically as you build your menu.
          </p>
        </div>

        {!menuLoaded && dbItems.length === 0 && defaultMenu.length === 0 ? (
          <div className="space-y-16">
            <div className="flex justify-center flex-wrap gap-3">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="w-28 h-11 rounded-full animate-pulse bg-[#18181B] border border-white/5" />
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            
            {/* Primary Logical Category Pills */}
            <div className="flex overflow-x-auto whitespace-nowrap md:flex-wrap justify-start md:justify-center gap-2 sm:gap-3 mb-6 pb-2 md:pb-0 hide-scrollbar scrollbar-none">
              {LOGICAL_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveFilter(category);
                    if (category === "Main Course" && !activeSubCourse) {
                      setActiveSubCourse("1st Course");
                    }
                  }}
                  className={`px-5 py-2.5 md:px-8 md:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 uppercase cursor-pointer shrink-0 active:scale-95 ${
                    activeFilter.toLowerCase() === category.toLowerCase()
                      ? "bg-[#D4AF37] text-black font-extrabold shadow-[0_4px_25px_rgba(212,175,55,0.35)] border-2 border-[#D4AF37]"
                      : "bg-[#1a1a1a] text-white border border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Secondary Sub-category Navigation for Main Course */}
            {activeFilter === "Main Course" && (
              <div className="flex justify-center items-center gap-2 sm:gap-4 mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-[#151515] p-1.5 rounded-2xl border border-white/10 flex gap-2">
                  {MAIN_COURSE_SUBTABS.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubCourse(sub)}
                      className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                        activeSubCourse === sub
                          ? "bg-white/15 text-[#D4AF37] shadow-inner font-extrabold"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Graceful Empty State vs Interactive Menu Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-[#151515] rounded-3xl border border-white/10 max-w-2xl mx-auto p-8 shadow-2xl mt-8">
                <UtensilsCrossed className="w-12 h-12 text-[#D4AF37]/40 mx-auto mb-4" />
                <p className="text-xl sm:text-2xl font-bold text-white mb-2">No items listed under {activeFilter === "Main Course" ? `${activeFilter} (${activeSubCourse})` : activeFilter}.</p>
                <p className="text-xs sm:text-sm text-gray-400">
                  Our chefs are continuously curating exciting seasonal specialties for this tier. Explore our other course tabs to add items to your event repertoire!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-8">
                {filteredItems.map((item) => {
                  const selected = isDishSelected(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-2xl sm:rounded-[24px] overflow-hidden flex flex-col transition-all duration-300 group ${
                        selected
                          ? "bg-[#1c1a13] border-2 border-[#D4AF37] shadow-[0_12px_35px_rgba(212,175,55,0.25)] -translate-y-1"
                          : "bg-[#151515] border border-white/10 hover:border-[#D4AF37]/50 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(0,0,0,0.7)]"
                      }`}
                    >
                      {/* Top Image Banner */}
                      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#1f1f1f] shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-black/30 opacity-60" />

                        {/* Price Badge */}
                        {item.price && (
                          <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-black/85 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] sm:text-xs font-black z-10 shadow-md">
                            {item.price}
                          </div>
                        )}

                        {/* Selected Indicator Pill */}
                        {selected && (
                          <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 px-2.5 py-1 rounded-full bg-[#D4AF37] text-black text-[9px] sm:text-[11px] font-extrabold flex items-center gap-1 shadow-lg z-10 animate-in fade-in zoom-in">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>SELECTED</span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <span className="text-gray-400 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest block mb-1">
                            {item.category} {item.subCourse ? `• ${item.subCourse}` : ""}
                          </span>
                          <h3 className="text-white text-sm sm:text-base md:text-lg font-bold leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Action Toggle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selected) {
                              removeFromMenu(item.id);
                            } else {
                              const parsedPrice = parsePrice(item.price);
                              const selectedItem: SelectedMenuItem = {
                                id: item.id,
                                name: item.title,
                                price: parsedPrice,
                                category: item.category,
                                imageUrl: item.imageUrl,
                                description: item.description,
                                rawPrice: item.price,
                              };
                              addToMenu(selectedItem);
                            }
                          }}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.96] ${
                            selected
                              ? "bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white"
                              : "bg-[#D4AF37] text-black hover:bg-[#c49f2b] shadow-lg shadow-[#D4AF37]/15"
                          }`}
                        >
                          {selected ? (
                            <>
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 stroke-[3]" />
                              <span>Add to Menu</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Floating Live Cart Bar */}
        {selectedMenu.length > 0 && (
          <div className="fixed bottom-4 left-3 right-3 sm:left-6 sm:right-6 lg:left-1/2 lg:-translate-x-1/2 max-w-5xl w-auto z-50 animate-in slide-in-from-bottom-6 fade-in duration-300">
            <div className="bg-[#151515]/95 backdrop-blur-2xl border-2 border-[#D4AF37] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_20px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] flex flex-col items-center justify-center text-[#D4AF37] font-black text-base sm:text-lg shadow-inner shrink-0">
                  <span>{selectedMenu.length}</span>
                  <span className="text-[8px] uppercase tracking-tighter -mt-1 font-bold">Items</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white font-extrabold text-sm sm:text-lg tracking-tight">
                      {selectedMenu.length} {selectedMenu.length === 1 ? "Dish" : "Dishes"} Selected
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#D4AF37] text-[11px] sm:text-xs font-black tracking-wide border border-[#D4AF37]/20">
                      ₹{perGuestTotal.toLocaleString("en-IN")} / plate
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-300 font-bold text-xs sm:text-sm">
                      Estimated Total: <span className="text-[#D4AF37] font-extrabold">₹{cartTotal.toLocaleString("en-IN")}</span>
                    </span>
                    <span className="text-gray-500 text-[11px] font-semibold">
                      ({eventDetails.guestCount || 100} guests)
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full sm:w-auto bg-[#D4AF37] text-black hover:bg-[#b5952f] px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-xl shadow-[#D4AF37]/30 flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
              >
                <span>Finalize Booking</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
