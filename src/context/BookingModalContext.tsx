"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, MessageSquare } from "lucide-react";
import { defaultServicesList } from "@/data/services";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useGlobalSettings } from "@/lib/settings";

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
  const { settings } = useGlobalSettings();

  // Initialize and check Firestore for any newly added admin services dynamically
  useEffect(() => {
    queueMicrotask(() => setMounted(true));

    async function fetchServices() {
      try {
        const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const names = snapshot.docs.map((doc) => doc.data().title || "Custom Service");
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

  // WhatsApp Redirection Handler
  function handleBookSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const eventType = formData.get("eventType") as string;
    const guestCount = (formData.get("guestCount") as string)?.trim();
    const description = formData.get("description") as string;

    const whatsappNumber = (settings?.whatsappNumber || "919847598053").replace(/\D/g, "");
    let formattedText = `New Event Booking:\nName: ${name}\nPhone: ${phone}\nEvent Type: ${eventType}`;
    if (guestCount) {
      formattedText += `\n*Expected Guests:* ${guestCount}`;
    }
    formattedText += `\nDescription: ${description}`;
    const encodedText = encodeURIComponent(formattedText);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank");
    closeModal();
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          style={{ width: "100vw", height: "100vh", top: 0, left: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative bg-[#151515] border border-white/10 rounded-[24px] p-4 md:p-8 max-w-[480px] w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_65px_rgba(0,0,0,0.95)] text-left my-auto animate-fadeIn">
            
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 md:top-5 md:right-5 text-white/60 hover:text-[#d4af37] transition-colors p-1 z-10 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="mb-4 md:mb-5 pr-6">
              <span className="text-[#d4af37] tracking-[0.15em] text-[0.65rem] md:text-[0.7rem] font-bold uppercase block mb-1">
                Direct WhatsApp Booking
              </span>
              <h3 className="text-white font-bold text-xl sm:text-2xl md:text-3xl tracking-tight">
                Book Your Event
              </h3>
              <p className="text-[#a0a0a0] text-xs md:text-sm mt-0.5 md:mt-1">
                Fill out your details to chat instantly with our culinary team.
              </p>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-2.5 md:space-y-4">
              
              {/* Name Input */}
              <div>
                <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-2 md:py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98475 98053"
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-2 md:py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm"
                />
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
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-2 md:py-3 text-white outline-none transition-all duration-300 text-sm cursor-pointer"
                >
                  <option value="" disabled className="text-gray-500">
                    Select an Event...
                  </option>
                  
                  {/* Automatically render options from central array */}
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

              {/* Guest Count Input (Optional) */}
              <div>
                <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                  GUEST COUNT (OPTIONAL)
                </label>
                <input
                  type="text"
                  name="guestCount"
                  placeholder="e.g. 50 - 100 people"
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-2 md:py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm"
                />
              </div>

              {/* Describe Your Event Textarea */}
              <div>
                <label className="block text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                  Describe Your Event
                </label>
                <textarea
                  name="description"
                  rows={2}
                  required
                  placeholder="Preferred dates, timings, menu preferences, and dietary specifications..."
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37] rounded-xl px-4 py-2 md:py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 text-sm resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#d4af37] text-black font-bold text-sm md:text-base uppercase tracking-wider py-3 md:py-3.5 rounded-xl hover:bg-[#b5952f] transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#d4af37]/15 cursor-pointer"
              >
                <span>Book via WhatsApp</span>
                <MessageSquare className="w-5 h-5 fill-current" />
              </button>
            </form>

          </div>
        </div>,
        document.body
      )}
    </BookingModalContext.Provider>
  );
}
