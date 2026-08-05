"use client";

import { useRef } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { companyInfo } from "@/data/config";
import { useGlobalSettings } from "@/lib/settings";

export default function Footer() {
  const formRef = useRef<HTMLFormElement>(null);
  const { settings, isLoading } = useGlobalSettings();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;

    const whatsappNumber = (settings?.whatsappNumber || "919847598053").replace(/\D/g, "");
    const formattedText = `New Enquiry (From Footer):\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`;
    const encodedText = encodeURIComponent(formattedText);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank");
    formRef.current?.reset();
  }

  return (
    <footer id="contact" className="pt-12 sm:pt-24 pb-36 md:pb-24 bg-[#111111] text-white border-t border-white/5 relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
          
          {/* Left Side Info */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-5 sm:mb-6 tracking-tight leading-[1.15]">
              Design Your Perfect<br/>
              <span className="text-gold italic font-serif">Occasion.</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-lg mb-8 sm:mb-12 max-w-md leading-relaxed">
              Whether hosting a cozy get-together or a majestic wedding, our dedicated event specialists are here to make it spectacular.
            </p>

            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start gap-4 sm:gap-6 w-fit">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold transition-all duration-300 shrink-0 shadow-lg mt-1">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs tracking-widest text-gray-500 uppercase font-semibold mb-1">Call Us</p>
                  {isLoading || !settings ? (
                    <div className="space-y-1">
                      <div className="h-6 w-36 bg-[#18181B] animate-pulse rounded" />
                      <div className="h-5 w-32 bg-[#18181B] animate-pulse rounded" />
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-1 animate-in fade-in duration-500">
                      <a 
                        href={`tel:${settings.phoneNumber.replace(/\s+/g, "")}`}
                        className="text-base sm:text-xl font-medium text-white transition-colors duration-300 hover:text-gold block"
                      >
                        {settings.phoneNumber}
                      </a>
                      {settings.secondaryPhone && (
                        <a 
                          href={`tel:${settings.secondaryPhone.replace(/\s+/g, "")}`}
                          className="text-sm sm:text-lg font-medium text-gray-300 transition-colors duration-300 hover:text-gold block"
                        >
                          {settings.secondaryPhone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 sm:gap-6 w-fit">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold transition-all duration-300 shrink-0 shadow-lg mt-1">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs tracking-widest text-gray-500 uppercase font-semibold mb-1">Email Us</p>
                  {isLoading || !settings ? (
                    <div className="h-6 w-44 bg-[#18181B] animate-pulse rounded" />
                  ) : (
                    <a 
                      href={`mailto:${settings.officialEmail || companyInfo.email}`}
                      className="text-base sm:text-xl font-medium text-white transition-colors duration-300 hover:text-gold block animate-in fade-in duration-500 break-all"
                    >
                      {settings.officialEmail || companyInfo.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Dynamic Clickable Visit Us - Google Maps */}
              <a 
                href={isLoading || !settings ? "#" : settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Anna Caterers on Google Maps"
                className="group flex items-start gap-4 sm:gap-6 transition-all duration-300 hover:translate-x-1.5 w-fit cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gold transition-all duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-black group-hover:border-gold group-hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)] shrink-0 mt-1">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs tracking-widest text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1.5">
                    Visit Us
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[0.65rem] text-gold font-normal lowercase tracking-normal">
                      (open map ↗)
                    </span>
                  </p>
                  {isLoading || !settings ? (
                    <div className="h-6 w-52 bg-[#18181B] animate-pulse rounded my-1" />
                  ) : (
                    <p className="text-base sm:text-xl font-medium text-white transition-colors duration-300 group-hover:text-gold group-hover:underline decoration-gold/50 underline-offset-4 animate-in fade-in duration-500 leading-snug">
                      {settings.address}
                    </p>
                  )}
                </div>
              </a>
            </div>
          </div>

          {/* Right Side Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-6 sm:px-8 sm:py-12 rounded-2xl sm:rounded-3xl shadow-2xl">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Your Name</label>
                <input 
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full min-h-[44px] bg-[#0a0a0a] border border-white/10 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Email Address</label>
                  <input 
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className="w-full min-h-[44px] bg-[#0a0a0a] border border-white/10 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Phone Number</label>
                  <input 
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98475 98053"
                    className="w-full min-h-[44px] bg-[#0a0a0a] border border-white/10 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Your Message</label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us about your event..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition-colors resize-none text-sm"
                />
              </div>

              <button 
                type="submit"
                className="w-full min-h-[48px] bg-gold text-black font-extrabold text-base sm:text-lg py-4 rounded-xl hover:bg-[#b5952f] transition-all flex items-center justify-center gap-3 mt-4 cursor-pointer shadow-lg shadow-gold/10 active:scale-[0.98]"
              >
                <span>Send Enquiry</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
