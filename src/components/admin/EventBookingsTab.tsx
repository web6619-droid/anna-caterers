"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { EventBooking } from "@/types/admin";
import { 
  ClipboardList, 
  Calendar, 
  Users, 
  UtensilsCrossed, 
  PhoneCall, 
  MessageSquare, 
  Trash2, 
  Eye, 
  X, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  User as UserIcon,
  Search,
  ExternalLink
} from "lucide-react";

interface EventBookingsTabProps {
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export default function EventBookingsTab({ showToast }: EventBookingsTabProps) {
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<EventBooking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const q = query(collection(db, "event_bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as EventBooking[];
      setBookings(fetched);
      setLoading(false);
    }, (error) => {
      console.warn("Error subscribing to event_bookings collection:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteBooking = async (id: string, name?: string) => {
    if (!confirm(`Are you certain you want to remove the booking inquiry from ${name || "this client"}?`)) return;
    try {
      await deleteDoc(doc(db, "event_bookings", id));
      showToast("info", "Booking record successfully removed from portal.");
      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      showToast("error", "Could not delete order record.");
    }
  };

  const handleToggleStatus = async (booking: EventBooking) => {
    const nextStatus = booking.status === "confirmed" ? "pending" : "confirmed";
    try {
      await updateDoc(doc(db, "event_bookings", booking.id), { status: nextStatus });
      showToast("success", `Order status updated to ${nextStatus.toUpperCase()}.`);
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("error", "Failed to update booking status.");
    }
  };

  const formatTimestamp = (ts?: any) => {
    if (!ts) return "Recent Inquiry";
    try {
      if (ts.toDate) {
        return ts.toDate().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (e) {
      console.warn(e);
    }
    return String(ts);
  };

  const filteredBookings = bookings.filter((b) => {
    const name = (b.userDetails?.name || "").toLowerCase();
    const phone = (b.userDetails?.phone || "").toLowerCase();
    const occasion = (b.eventDetails?.eventType || "").toLowerCase();
    const queryStr = searchQuery.toLowerCase();

    const matchesQuery = name.includes(queryStr) || phone.includes(queryStr) || occasion.includes(queryStr);
    if (!matchesQuery) return false;

    if (statusFilter !== "all") {
      const currentStatus = (b.status || "pending").toLowerCase();
      if (currentStatus !== statusFilter) return false;
    }

    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Top Section / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <span className="text-[#D4AF37] tracking-[0.2em] text-xs font-extrabold uppercase mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Client Lead Automation
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Custom Event <span className="text-[#D4AF37] italic font-serif">Bookings</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Review live catering leads and bespoke menus constructed by customers in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#18181B] px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
            <div>
              <span className="text-gray-500 text-[10px] font-extrabold uppercase tracking-widest block">Total Inquiries</span>
              <span className="text-2xl font-black text-[#D4AF37]">{bookings.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#18181B] p-4 sm:p-5 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client name or phone..."
            className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "pending", "confirmed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                statusFilter === tab
                  ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
                  : "bg-[#121214] text-gray-400 border border-white/10 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-[#18181B] h-64 rounded-3xl border border-white/5 p-6 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-1/3 h-4 bg-white/10 rounded-full" />
                <div className="w-3/4 h-6 bg-white/20 rounded-xl" />
                <div className="w-1/2 h-4 bg-white/10 rounded-lg" />
              </div>
              <div className="w-full h-11 bg-white/10 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty State */
        <div className="text-center py-24 bg-[#18181B] rounded-3xl border border-white/5 max-w-2xl mx-auto p-8 shadow-2xl">
          <ClipboardList className="w-16 h-16 text-[#D4AF37]/40 mx-auto mb-5" />
          <h3 className="text-2xl font-bold text-white mb-2">No Custom Orders Listed</h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
            {searchQuery
              ? "No booking inquiries matched your current search parameter or filter tab."
              : "Whenever customers build custom feast packages on your public menu storefront and finalize their inquiry, all order details will appear here instantly."}
          </p>
        </div>
      ) : (
        /* Bookings Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => {
            const isConfirmed = booking.status === "confirmed";
            const clientName = booking.userDetails?.name || "Guest Client";
            const phone = booking.userDetails?.phone || "N/A";
            const eventType = booking.eventDetails?.eventType || "Custom Event";
            const dateStr = booking.eventDetails?.eventDate ? String(booking.eventDetails.eventDate) : "TBD";
            const guestCount = booking.eventDetails?.guestCount || 0;
            const mealType = booking.eventDetails?.mealType || "Standard Meal";
            const total = booking.cartTotal || 0;
            const dishCount = booking.selectedMenu?.length || 0;

            return (
              <div 
                key={booking.id}
                className="bg-[#18181B] rounded-3xl border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-300 p-6 flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 inset-x-0 h-1.5 ${isConfirmed ? "bg-green-500" : "bg-[#D4AF37]"}`} />

                <div>
                  {/* Top Row: Occasion Tag & Status Toggle */}
                  <div className="flex items-center justify-between mb-4 pt-1">
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-extrabold text-[11px] tracking-wide truncate max-w-[65%]">
                      {eventType}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(booking);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                        isConfirmed 
                          ? "bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500 hover:text-black"
                          : "bg-white/10 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black"
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                          <span>Confirmed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 stroke-[2.5]" />
                          <span>Pending</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Customer Information */}
                  <div className="mb-5">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{clientName}</span>
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {phone}
                      </span>
                      {phone && phone !== "N/A" && (
                        <a
                          href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-green-400 font-bold hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Event Specifics Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#121214] border border-white/5 mb-5 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-500 block">Event Date</span>
                        <span className="font-extrabold text-white">{dateStr}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/10 pl-2">
                      <Users className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-500 block">Capacity</span>
                        <span className="font-extrabold text-white">{guestCount} Guests</span>
                      </div>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {mealType} ({dishCount} dishes)
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {formatTimestamp(booking.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Investment Total and Action Controls */}
                <div>
                  <div className="flex items-baseline justify-between mb-4 px-1">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Estimated Quote</span>
                    <span className="text-xl sm:text-2xl font-black text-[#D4AF37] tracking-tight">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(booking)}
                      className="flex-1 py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#b5952f] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                      <span>View Menu ({dishCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBooking(booking.id, clientName);
                      }}
                      className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 shrink-0 cursor-pointer"
                      title="Remove Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Menu & Details Overlay Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181B] border-2 border-[#D4AF37]/70 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.2)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#121214] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                  {selectedOrder.eventDetails?.eventType} • {selectedOrder.eventDetails?.mealType} Service
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {selectedOrder.userDetails?.name || "Guest Client"}&apos;s Curated Menu
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2.5 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              
              {/* Customer Quick Brief Card */}
              <div className="p-4 rounded-2xl bg-[#121214] border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-500 text-[10px] font-extrabold uppercase block">Contact Phone</span>
                  <span className="text-white font-bold">{selectedOrder.userDetails?.phone || "Unlisted"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] font-extrabold uppercase block">Date Requested</span>
                  <span className="text-white font-bold">{selectedOrder.eventDetails?.eventDate ? String(selectedOrder.eventDetails?.eventDate) : "TBD"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] font-extrabold uppercase block">Expected Guests</span>
                  <span className="text-[#D4AF37] font-extrabold">{selectedOrder.eventDetails?.guestCount || 0} People</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] font-extrabold uppercase block">Per Plate Investment</span>
                  <span className="text-white font-black">₹{selectedOrder.perGuestTotal?.toLocaleString("en-IN") || 0}</span>
                </div>
              </div>

              {selectedOrder.userDetails?.notes && (
                <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <span className="text-[#D4AF37] text-[11px] font-black uppercase tracking-wider block mb-1">Special Dietary / Event Notes:</span>
                  <p className="text-white font-medium leading-relaxed">{selectedOrder.userDetails.notes}</p>
                </div>
              )}

              {/* Selected Dishes Roster */}
              <div>
                <h4 className="font-black uppercase text-xs tracking-wider text-[#D4AF37] mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Selected Dish Items ({selectedOrder.selectedMenu?.length || 0})</span>
                </h4>
                
                <div className="space-y-2">
                  {(selectedOrder.selectedMenu || []).map((dish, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#151518] border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-black text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">{dish.name}</p>
                          <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-widest">{dish.category}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-[#D4AF37] text-xs sm:text-sm shrink-0">
                        {dish.rawPrice || `₹${dish.price}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1b1912] via-[#242116] to-[#1b1912] border-2 border-[#D4AF37] flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[11px] uppercase font-bold text-gray-400 block">Total Package Quote</span>
                  <span className="text-xs text-[#D4AF37] font-extrabold">
                    ({selectedOrder.eventDetails?.guestCount || 0} guests × ₹{selectedOrder.perGuestTotal || 0} / plate)
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#D4AF37] tracking-tight">
                  ₹{selectedOrder.cartTotal?.toLocaleString("en-IN") || 0}
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 bg-[#121214] border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
              {selectedOrder.userDetails?.phone && (
                <a
                  href={`https://wa.me/${selectedOrder.userDetails.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Reply via WhatsApp</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer active:scale-95"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
