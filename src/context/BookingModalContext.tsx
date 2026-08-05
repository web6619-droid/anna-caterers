"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, UtensilsCrossed, ArrowRight } from "lucide-react";
import { defaultServicesList } from "@/data/services";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useBooking } from "@/context/BookingContext";

interface BookingModalContextType {
  openModal: (serviceName?: string) => void;
  closeModal: () => void;
  isOpen: boolean;
}

const BookingModalContext = createContext<BookingModalContextType | undefined>(undefined);

export function useBookingModal() {
  const context = useContext(BookingModalContext);
  if (!context) {
    throw new Error("useBookingModal must be used within a BookingModalProvider");
  }
  return context;
}

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [dynamicServices, setDynamicServices] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Connect to global booking funnel state and Next.js router
  const { updateUserDetails, updateEventDetails, eventDetails } = useBooking();
  const router = useRouter();

  // Initialize and check Firestore for any newly added admin services dynamically
  useEffect(() => {
    queueMicrotask(() => setMounted(true));

    async function fetchServices() {
      try {
        const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((doc) => doc.data());
          docs.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
          });
          const names = docs.map((d) => d.title || "Custom Service");
          setDynamicServices(names);
          return;
        }
      } catch {
        // Fall back quietly to default list if offline or rules block
      }
      setDynamicServices(defaultServicesList.map((s) => s.title));
    }

    fetchServices();
  }, []);

  // Function to open modal, pre-selecting a specific service if provided
  const openModal = (serviceName?: string) => {
    if (serviceName) {
      setSelectedEvent(serviceName);
    } else {
      setSelectedEvent(""); // Reset to default "Select an Event..." placeholder
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Phase 2: Capture booking details into Global State & proceed to Menu selection
  function handleBookSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const eventType = (formData.get("eventType") as string) || selectedEvent || "Custom Event";
    const guestCountRaw = (formData.get("guestCount") as string)?.trim();
    const guestCount = parseInt(guestCountRaw, 10) || 100;
    const eventDate = (formData.get("eventDate") as string) || "";
    const mealType = (formData.get("mealType") as string) || "Lunch";
    const description = (formData.get("description") as string) || "";

    // 1. Update Global State via context updater functions
    updateUserDetails({ name, phone, notes: description });
    updateEventDetails({ eventType, guestCount, eventDate, mealType });

    // 2. Close modal and navigate directly to menu selection funnel
    closeModal();
    router.push("/menu");
  }

  // Combine default and DB service titles cleanly without duplicates
  const allAvailableServiceTitles = Array.from(
    new Set(
      dynamicServices.length > 0
        ? dynamicServices
        : defaultServicesList.map((s) => s.title)
    )
  );

  return (
    <BookingModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}

      {/* Global Book Event Modal Overlay using React Portal */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          style={{ width: "100vw", height: "100vh", top: 0, left: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative bg-[#151515] border border-white/10 rounded-[24px] p-4 sm:p-6 md:p-8 max-w-[520px] w-full max-h-[92vh] overflow-y-auto custom-scrollbar shadow-[0_25px_65px_rgba(0,0,0,0.95)] text-left my-auto animate-fadeIn">
            
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 md:top-5 md:right-5 text-white/60 hover:text-[#d4af37] transition-colors p-1 z-10 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="mb-4 pr-6">
              <span className="text-[#d4af37] tracking-[0.15em] text-[0.65rem] md:text-[0.7rem] font-extrabold uppercase block mb-1">
                Step 1 of 3: Event Customization
              </span>
              <h3 className="text-white font-bold text-xl sm:text-2xl md:text-3xl tracking-tight">
                Configure Your Event
              </h3>
              <p className="text-[#a0a0a0] text-xs md:text-sm mt-0.5 md:mt-1">
                Enter your occasion parameters to unlock our custom menu selector and pricing calculator.
              </p>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3 md:space-y-3.5">
              
              {/* Name & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                <div>
                  <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-3.5 py-2 sm:py-2.5 md:py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-xs md:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98475 98053"
                    className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-3.5 py-2 sm:py-2.5 md:py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-xs md:text-sm"
                  />
                </div>
              </div>

              {/* Dynamically Mapped Event Type Dropdown */}
              <div>
                <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                  Event Type
                </label>
                <select
                  name="eventType"
                  required
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-3.5 py-2 sm:py-2.5 md:py-3 text-white outline-none transition-all duration-300 text-xs md:text-sm cursor-pointer"
                >
                  <option value="" disabled className="text-gray-500">
                    Select an Event...
                  </option>
                  
                  {allAvailableServiceTitles.map((title, idx) => (
                    <option key={idx} value={title} className="bg-[#151515] text-white">
                      {title}
                    </option>
                  ))}
                  
                  <option value="Other / Custom Event" className="bg-[#151515] text-white">
                    Other / Custom Event
                  </option>
                </select>
              </div>

              {/* Event Date & Meal Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                {/* Event Date Field */}
                <div>
                  <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    required
                    className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-3.5 py-2 sm:py-2.5 md:py-3 text-white outline-none transition-all duration-300 text-xs md:text-sm cursor-pointer color-scheme-dark"
                  />
                </div>

                {/* Meal Type Dropdown */}
                <div>
                  <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                    Meal Type
                  </label>
                  <select
                    name="mealType"
                    required
                    defaultValue={eventDetails.mealType || "Lunch"}
                    className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-3.5 py-2 sm:py-2.5 md:py-3 text-white outline-none transition-all duration-300 text-xs md:text-sm cursor-pointer"
                  >
                    <option value="Breakfast" className="bg-[#151515] text-white">Breakfast</option>
                    <option value="Lunch" className="bg-[#151515] text-white">Lunch</option>
                    <option value="Dinner" className="bg-[#151515] text-white">Dinner</option>
                  </select>
                </div>
              </div>

              {/* Guest Count Input */}
              <div>
                <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                  Expected Guest Count
                </label>
                <input
                  type="number"
                  name="guestCount"
                  min="1"
                  required
                  defaultValue={eventDetails.guestCount || 100}
                  placeholder="e.g. 100"
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-3.5 py-2 sm:py-2.5 md:py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-xs md:text-sm"
                />
              </div>

              {/* Describe Your Event Textarea */}
              <div>
                <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Dietary requirements, location specifics, or culinary preferences..."
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-3.5 py-2 md:py-2.5 text-white placeholder-gray-600 outline-none transition-all duration-300 text-xs md:text-sm resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#d4af37] text-black font-extrabold text-xs sm:text-sm md:text-base uppercase tracking-wider py-3 md:py-3.5 rounded-xl hover:bg-[#b5952f] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-xl shadow-[#d4af37]/20 cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4 md:w-5 md:h-5 text-black stroke-[2.5]" />
                <span>PROCEED TO MENU</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-black stroke-[2.5]" />
              </button>
            </form>

          </div>
        </div>,
        document.body
      )}
    </BookingModalContext.Provider>
  );
}
