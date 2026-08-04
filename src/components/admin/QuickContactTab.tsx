"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { GlobalSettings } from "@/types/admin";
import { Phone, MessageSquare, Share2, MapPin, Save, Loader2, Globe, Sparkles, ShieldAlert, Copy, Check } from "lucide-react";

interface QuickContactTabProps {
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export default function QuickContactTab({ showToast }: QuickContactTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  
  const [formState, setFormState] = useState<GlobalSettings>({
    phoneNumber: "+91 98475 98053",
    whatsappNumber: "919847598053",
    instagramUrl: "https://www.instagram.com/_anna_caters_events?igsh=MTFvcjJsNmRzNmpwaA==",
    googleMapsUrl: "https://www.google.com/maps/search/Anna+Caterers+Thiruvaniyoor+Kochi+Kerala",
    address: "Thiruvaniyoor, Kochi, Kerala",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, "settings", "global");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<GlobalSettings>;
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
          setPermissionBlocked(true);
        }
        console.warn("Error loading global settings (falling back to existing storefront defaults):", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setPermissionBlocked(false);
    try {
      const docRef = doc(db, "settings", "global");
      await setDoc(docRef, {
        ...formState,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      showToast("success", "Global Contact & Links settings saved and synchronized across the entire website!");
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission") || err?.message?.includes("insufficient")) {
        setPermissionBlocked(true);
        showToast("error", "Firestore Security Rules are currently blocking database writes.");
      } else {
        showToast("error", "Failed to save settings to Firestore. Please check your network connection.");
      }
    } finally {
      setSaving(false);
    }
  };

  const firestoreRulesText = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n  }\n}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(firestoreRulesText);
    setCopiedRules(true);
    showToast("info", "Firestore security rules copied to clipboard!");
    setTimeout(() => setCopiedRules(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-3" />
        <span className="text-sm font-semibold tracking-wide">Synchronizing configuration from Firestore...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fadeIn max-h-[calc(100vh-150px)] overflow-y-auto pb-24 pr-4 custom-scrollbar">
      {/* Module Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-[0.2em] mb-2">
          <Globe className="w-4 h-4" /> Global Master Settings
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Quick Contact & <span className="text-[#D4AF37] font-serif italic">Social Links</span>.
        </h2>
        <p className="text-gray-400 text-sm mt-1.5">
          Modifications here dynamically overwrite hardcoded phone protocols, floating WhatsApp actions, Instagram banners, and Google Maps redirections across the website.
        </p>
      </div>

      {/* Permission Blocked Alert Guidance */}
      {permissionBlocked && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-3xl p-6 shadow-2xl animate-pulse flex flex-col space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-200">Firestore Database Permissions Locked</h3>
              <p className="text-sm text-red-300/80 leading-relaxed mt-1">
                Your Firebase Console has default security rules blocking authenticated admin writes. To instantly unlock full CRUD capabilities for your Admin Suite, follow these 3 quick steps:
              </p>
            </div>
          </div>

          <div className="bg-black/60 p-4 rounded-2xl border border-red-500/20 space-y-3">
            <p className="text-xs text-gray-300 font-medium">
              1. Open your <a href="https://console.firebase.google.com/project/anna-caterer-2c82a/firestore/rules" target="_blank" rel="noreferrer" className="text-[#D4AF37] underline font-bold">Firebase Console &gt; Firestore Database &gt; Rules</a>.<br />
              2. Replace the existing text with these exact rules and click <strong className="text-white">Publish</strong>:
            </p>

            <div className="relative font-mono text-xs bg-[#0D0D0D] p-4 rounded-xl text-green-300 border border-white/10 overflow-x-auto">
              <button
                type="button"
                onClick={copyToClipboard}
                className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black font-bold text-[11px] flex items-center gap-1 hover:bg-[#b5952f] transition-all cursor-pointer shadow-md"
              >
                {copiedRules ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRules ? "Copied!" : "Copy Rules"}</span>
              </button>
              <pre>{firestoreRulesText}</pre>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-[#18181B] border border-white/5 rounded-3xl p-8 shadow-xl space-y-6">
          
          {/* Phone Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              <Phone className="w-4 h-4" /> Master Phone Number (tel: Protocol)
            </label>
            <p className="text-xs text-gray-400">Displayed in footer and sticky sidebar. Wrapped automatically in clickable tel: links.</p>
            <input
              type="text"
              name="phoneNumber"
              value={formState.phoneNumber}
              onChange={handleChange}
              required
              placeholder="+91 98475 98053"
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors font-mono text-sm shadow-inner"
            />
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              <MessageSquare className="w-4 h-4" /> WhatsApp Enquiry Number (wa.me)
            </label>
            <p className="text-xs text-gray-400">Used for Book Event form submittals and footer enquiry triggers. Include country code without symbols or spaces if desired.</p>
            <input
              type="text"
              name="whatsappNumber"
              value={formState.whatsappNumber}
              onChange={handleChange}
              required
              placeholder="+91 98475 98053 or 919847598053"
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors font-mono text-sm shadow-inner"
            />
          </div>

          {/* Instagram URL */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              <Share2 className="w-4 h-4" /> Official Instagram URL
            </label>
            <p className="text-xs text-gray-400">Destination for floating Instagram badge and contact section.</p>
            <input
              type="url"
              name="instagramUrl"
              value={formState.instagramUrl}
              onChange={handleChange}
              required
              placeholder="https://www.instagram.com/_anna_caters_events?..."
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors font-mono text-sm shadow-inner"
            />
          </div>

          {/* Google Maps URL */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              <MapPin className="w-4 h-4" /> Google Maps Exact Location Link
            </label>
            <p className="text-xs text-gray-400">Clickable target for &apos;Visit Us&apos; pin and Kochi location text.</p>
            <input
              type="url"
              name="googleMapsUrl"
              value={formState.googleMapsUrl}
              onChange={handleChange}
              required
              placeholder="https://maps.app.goo.gl/..."
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors font-mono text-sm shadow-inner"
            />
          </div>

          {/* Office Address */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              <MapPin className="w-4 h-4" /> Display Address Title
            </label>
            <input
              type="text"
              name="address"
              value={formState.address}
              onChange={handleChange}
              required
              placeholder="Thiruvaniyoor, Kochi, Kerala"
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors text-sm shadow-inner"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-full bg-[#D4AF37] text-black font-extrabold text-sm uppercase tracking-wider hover:bg-[#b5952f] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5 fill-current" />
                <span>Save Master Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
