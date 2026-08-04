"use client";

import { useBookingModal } from "@/context/BookingModalContext";

export default function BookServiceButton({ serviceTitle }: { serviceTitle: string }) {
  const { openModal } = useBookingModal();

  return (
    <button
      type="button"
      onClick={() => openModal(serviceTitle)}
      className="block w-full text-center bg-gold text-black font-bold text-xs md:text-[0.95rem] py-2.5 md:py-3 rounded-md md:rounded-lg hover:bg-[#b5952f] transition-all duration-300 shadow-md hover:shadow-gold/20 cursor-pointer"
    >
      Book Now
    </button>
  );
}
