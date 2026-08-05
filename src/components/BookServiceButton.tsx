"use client";

import { useBookingModal } from "@/context/BookingModalContext";

export default function BookServiceButton({ serviceTitle }: { serviceTitle: string }) {
  const { openModal } = useBookingModal();

  return (
    <button
      type="button"
      onClick={() => openModal(serviceTitle)}
      className="w-full text-center bg-gold text-black font-extrabold text-[11px] sm:text-xs md:text-[0.95rem] py-2 sm:py-2.5 md:py-3 min-h-[38px] sm:min-h-[42px] flex items-center justify-center rounded-lg hover:bg-[#b5952f] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-md hover:shadow-[0_4px_18px_rgba(212,175,55,0.4)] cursor-pointer"
    >
      Book Now
    </button>
  );
}
