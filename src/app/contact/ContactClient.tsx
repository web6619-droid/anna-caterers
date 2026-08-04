"use client";

import { useRef } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { companyInfo } from "@/data/config";
import { useGlobalSettings } from "@/lib/settings";

export default function ContactClient() {
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
    const formattedText = `New Enquiry:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`;
    const encodedText = encodeURIComponent(formattedText);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank");
    formRef.current?.reset();
  }

  return (
    <section className="py-24 bg-[#0f0f0f] text-white min-h-[calc(100vh-6rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Text & Contact Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-[1.1]">
              Let&apos;s Plan Your <br />
              <span className="text-gold italic font-serif">Signature Event.</span>
            </h1>
            <p className="text-[#a0a0a0] text-lg leading-relaxed mb-12 max-w-lg">
              From intimate dinners to grand wedding celebrations, our team is ready to bring your vision to life.
            </p>

            <div className="space-y-8">
              {/* Call Us */}
              <div className="flex items-start gap-6 w-fit">
                <div className="w-14 h-14 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center text-gold shrink-0 shadow-lg mt-1">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="block text-xs font-bold uppercase tracking-[0.15em] text-[#a0a0a0]">
                    Call Us
                  </span>
                  {isLoading || !settings ? (
                    <div className="space-y-2">
                      <div className="h-6 w-40 bg-[#18181B] animate-pulse rounded" />
                      <div className="h-5 w-36 bg-[#18181B] animate-pulse rounded" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 animate-in fade-in duration-500">
                      <a 
                        href={`tel:${settings.phoneNumber.replace(/\s+/g, "")}`}
                        className="text-xl font-semibold text-white transition-colors duration-300 hover:text-gold block"
                      >
                        {settings.phoneNumber} <span className="text-xs text-gray-500 font-normal ml-1">(Primary)</span>
                      </a>
                      {settings.secondaryPhone && (
                        <a 
                          href={`tel:${settings.secondaryPhone.replace(/\s+/g, "")}`}
                          className="text-lg font-medium text-gray-300 transition-colors duration-300 hover:text-gold block"
                        >
                          {settings.secondaryPhone} <span className="text-xs text-gray-500 font-normal ml-1">(Secondary)</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Us */}
              <div className="flex items-start gap-6 w-fit">
                <div className="w-14 h-14 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center text-gold shrink-0 shadow-lg mt-1">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1">
                    Email Us
                  </span>
                  {isLoading || !settings ? (
                    <div className="h-6 w-48 bg-[#18181B] animate-pulse rounded my-1" />
                  ) : (
                    <a 
                      href={`mailto:${settings.officialEmail || companyInfo.email}`}
                      className="text-xl font-semibold text-white transition-colors duration-300 hover:text-gold block animate-in fade-in duration-500"
                    >
                      {settings.officialEmail || companyInfo.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Visit Us - Dynamic Clickable Google Maps Redirection */}
              <a
                href={isLoading || !settings ? "#" : settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Click to view Anna Caterers on Google Maps"
                className="group flex items-center gap-6 cursor-pointer transition-all duration-300 hover:translate-x-1.5 w-fit"
              >
                <div className="w-14 h-14 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center text-gold shrink-0 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-black group-hover:border-gold group-hover:shadow-[0_4px_20px_rgba(212,175,55,0.35)]">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-[0.15em] text-[#a0a0a0] mb-1 flex items-center gap-1.5">
                    Visit Us
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[0.65rem] text-gold font-normal lowercase tracking-normal">
                      (open map ↗)
                    </span>
                  </span>
                  {isLoading || !settings ? (
                    <div className="h-6 w-56 bg-[#18181B] animate-pulse rounded my-1" />
                  ) : (
                    <span className="text-xl font-semibold text-white transition-colors duration-300 group-hover:text-gold group-hover:underline decoration-gold/50 underline-offset-4 block animate-in fade-in duration-500">
                      {settings.address}
                    </span>
                  )}
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: The Form Card */}
          <div className="bg-[#151515] rounded-[24px] p-8 sm:p-10 border border-white/5 shadow-2xl">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              
              {/* YOUR NAME */}
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-[#a0a0a0] uppercase tracking-[0.15em] mb-2.5">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  placeholder="John Doe"
                  className="w-full bg-[#0a0a0a] border border-transparent rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition-all duration-300 text-sm"
                />
              </div>

              {/* EMAIL ADDRESS and PHONE NUMBER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#a0a0a0] uppercase tracking-[0.15em] mb-2.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-[#0a0a0a] border border-transparent rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition-all duration-300 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-[#a0a0a0] uppercase tracking-[0.15em] mb-2.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    placeholder="+91 98475 98053"
                    className="w-full bg-[#0a0a0a] border border-transparent rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              {/* YOUR MESSAGE */}
              <div>
                <label htmlFor="message" className="block text-xs font-bold text-[#a0a0a0] uppercase tracking-[0.15em] mb-2.5">
                  Your Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={4}
                  placeholder="Tell us about your event, preferred dates, and guest count..."
                  className="w-full bg-[#0a0a0a] border border-transparent rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition-all duration-300 resize-none text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-btn"
                className="w-full font-bold py-4 px-6 rounded-xl bg-gold text-black hover:bg-[#b5952f] transition-all duration-300 flex items-center justify-center gap-3 text-base mt-2 cursor-pointer shadow-lg shadow-gold/10"
              >
                <span>Send Enquiry</span>
                <Send className="w-5 h-5" />
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
