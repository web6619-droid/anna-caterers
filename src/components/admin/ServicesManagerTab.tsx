"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Service } from "@/types/admin";
import { defaultServices } from "@/data/defaultCatalogue";
import { Plus, Trash2, Edit3, Save, X, Sparkles, Loader2, DollarSign, FileText, Type, Smile, ShieldAlert, Copy, Check, Image as ImageIcon } from "lucide-react";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";

interface ServicesManagerTabProps {
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

export default function ServicesManagerTab({ showToast }: ServicesManagerTabProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("Starting at ₹50,000");
  const [emoji, setEmoji] = useState(""); // Optional emoji field, no defaults forced
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Service>>({});

  const firestoreRulesText = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /reviews/{review} {\n      allow read, create: if true;\n      allow update, delete: if request.auth != null;\n    }\n    match /{document=**} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n  }\n}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(firestoreRulesText);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        emoji: doc.data().emoji || doc.data().icon || "", // Support both new emoji and legacy icon
      })) as Service[];
      setServices(items);
      setLoading(false);
    }, (err: any) => {
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
      }
      console.warn("Error fetching services (falling back to storefront defaults):", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim() || !description.trim()) {
      showToast("error", "Please fill in all mandatory fields (Title, Description, Price).");
      return;
    }
    setSaving(true);
    setPermissionBlocked(false);
    try {
      await addDoc(collection(db, "services"), {
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        emoji: emoji ? emoji.trim() : "",
        imageUrl: imageUrl || "",
        imagePublicId: imagePublicId || "",
        createdAt: serverTimestamp(),
      });
      showToast("success", `Service "${title}" published successfully to frontend booking system!`);
      setTitle("");
      setDescription("");
      setPrice("Starting at ₹25,000");
      setEmoji("");
      setImageUrl("");
      setImagePublicId("");
    } catch (err: any) {
      console.error(err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission") || err?.message?.includes("insufficient")) {
        setPermissionBlocked(true);
        showToast("error", "Firestore Security Rules are blocking writes!");
      } else {
        showToast("error", "Failed to create service in Firestore.");
      }
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditForm({ ...service, emoji: service.emoji || service.icon || "" });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.title || !editForm.price) return;
    setSaving(true);
    setPermissionBlocked(false);
    try {
      const docRef = doc(db, "services", id);
      await updateDoc(docRef, {
        title: editForm.title.trim(),
        description: editForm.description ? editForm.description.trim() : "",
        price: editForm.price.trim(),
        emoji: editForm.emoji ? editForm.emoji.trim() : "",
      });
      showToast("success", "Service updated successfully!");
      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission") || err?.message?.includes("insufficient")) {
        setPermissionBlocked(true);
      }
      showToast("error", "Failed to update service.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, serviceTitle: string) => {
    if (!confirm(`Permanently remove service "${serviceTitle}" from bookings and catalogue?`)) return;
    try {
      await deleteDoc(doc(db, "services", id));
      showToast("info", `Removed service "${serviceTitle}".`);
    } catch (err: any) {
      console.error(err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission") || err?.message?.includes("insufficient")) {
        setPermissionBlocked(true);
      }
      showToast("error", "Failed to delete service.");
    }
  };

  // Seamless fallback to storefront default catalogue when Firestore collection is fresh/empty
  const displayServices: any[] = services.length > 0 
    ? services 
    : defaultServices.map((s, idx) => ({ ...s, id: `default-${idx}`, isDefault: true, emoji: s.icon || "" }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fadeIn items-start">
      {/* Pinned / Sticky Add New Service Form */}
      <div className="lg:col-span-1 bg-[#18181B] border border-white/5 p-8 rounded-3xl h-fit shadow-2xl sticky top-28 custom-scrollbar">
        <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-widest mb-2">
          <Sparkles className="w-4 h-4" /> Package Configuration
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight mb-6">Add Event Service</h3>
        
        <form onSubmit={handleAddService} className="space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              <Type className="w-3.5 h-3.5 text-[#D4AF37]" /> Service Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Corporate Galas"
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] text-sm transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Package Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of dining setup and menu versatility..."
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] text-sm transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" /> Price Display
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹50,000 / Custom"
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] text-sm transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                <Smile className="w-3.5 h-3.5 text-[#D4AF37]" /> EMOJI ICON (OPTIONAL)
              </label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="e.g. 💍 or leave empty"
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] text-sm transition-colors"
              />
            </div>
          </div>

          {/* Cloudinary CDN Image Upload Widget */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Cover Photography (Cloudinary Vault)
            </label>
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden h-32 w-full border border-[#D4AF37]/50 mb-3 group">
                <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => { setImageUrl(""); setImagePublicId(""); }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
                  >
                    Remove & Reupload
                  </button>
                </div>
              </div>
            ) : (
              <CldUploadWidget
                signatureEndpoint="/api/sign-cloudinary-params"
                options={{
                  folder: "annacaterers",
                  maxFiles: 1,
                  resourceType: "image",
                  clientAllowedFormats: ["webp", "png", "jpg", "jpeg"],
                }}
                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                  if (result.info && typeof result.info === "object") {
                    if (result.info.secure_url) setImageUrl(result.info.secure_url);
                    if (result.info.public_id) setImagePublicId(result.info.public_id);
                    showToast("info", "Image uploaded securely to Cloudinary CDN.");
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full py-3 px-4 bg-[#0D0D0D] border border-dashed border-[#D4AF37]/60 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Upload High-Res Cover Image →</span>
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-full bg-[#D4AF37] text-black font-extrabold text-sm uppercase tracking-wider hover:bg-[#b5952f] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/15 disabled:opacity-50 mt-4"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
            <span>Publish Service Package</span>
          </button>
        </form>
      </div>

      {/* Right Column: Active Service Packages with Independent Scrolling */}
      <div className="lg:col-span-2 space-y-4">
        <div className="border-b border-white/10 pb-4 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Active Service Packages ({displayServices.length})</h3>
            <p className="text-gray-400 text-sm">These offerings directly hydrate the Book Event modal and public service catalogue.</p>
          </div>
        </div>

        {permissionBlocked && (
          <div className="p-6 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span>Firestore Database Security Rules are blocking write actions!</span>
            </div>
            <p className="text-xs text-gray-300">
              Open <a href="https://console.firebase.google.com/project/anna-caterer-2c82a/firestore/rules" target="_blank" rel="noreferrer" className="text-[#D4AF37] underline font-bold">Firebase Console &gt; Firestore Database &gt; Rules</a> and publish this exact configuration:
            </p>
            <div className="relative font-mono text-[11px] bg-[#0D0D0D] p-3 rounded-xl text-green-300 border border-white/10">
              <button
                type="button"
                onClick={copyToClipboard}
                className="absolute top-2 right-2 px-2 py-1 rounded bg-[#D4AF37] text-black font-bold text-[10px] flex items-center gap-1"
              >
                {copiedRules ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRules ? "Copied!" : "Copy Rules"}</span>
              </button>
              <pre>{firestoreRulesText}</pre>
            </div>
          </div>
        )}

        {services.length === 0 && !loading && (
          <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium">
            💡 Currently displaying public website default packages. Any new service you add will synchronize automatically, or click &quot;⚡ Sync Storefront Defaults&quot; on the Overview tab to turn all defaults into editable database items!
          </div>
        )}

        {/* Independent Scroll Container for Service Cards */}
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Synchronizing real-time stream...</span>
            </div>
          ) : (
            displayServices.map((service: any) => (
              <div
                key={service.id}
                className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-all duration-300 relative group shadow-lg"
              >
                {editingId === service.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex flex-col gap-1 w-24">
                        <label className="text-[10px] uppercase text-gray-400 font-bold">Emoji</label>
                        <input
                          type="text"
                          value={editForm.emoji || ""}
                          onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                          placeholder="(Opt)"
                          className="bg-[#0D0D0D] border border-white/10 rounded-xl p-2 text-center text-xl focus:border-[#D4AF37]"
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                        <label className="text-[10px] uppercase text-gray-400 font-bold">Service Title</label>
                        <input
                          type="text"
                          value={editForm.title || ""}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2 text-white font-bold focus:border-[#D4AF37]"
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-44">
                        <label className="text-[10px] uppercase text-gray-400 font-bold">Price Display</label>
                        <input
                          type="text"
                          value={editForm.price || ""}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2 text-[#D4AF37] font-semibold text-sm focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:border-[#D4AF37] resize-none"
                    />
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(service.id)}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#b5952f]"
                      >
                        <Save className="w-4 h-4" /> Save Updates
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {service.imageUrl ? (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10 relative bg-[#0D0D0D]">
                        <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      /* Clean fallback thumbnail when no image is uploaded */
                      <div className="w-24 h-24 rounded-2xl bg-[#0D0D0D] flex items-center justify-center shrink-0 border border-white/10">
                        {service.emoji ? (
                          <span className="text-4xl">{service.emoji}</span>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-[#D4AF37]/40" />
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap mb-1.5">
                        {service.emoji ? <span className="mr-2 text-xl">{service.emoji}</span> : null}
                        <h4 className="text-xl font-bold text-white truncate mr-4">{service.title}</h4>
                        <span className="ml-auto px-3.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-extrabold tracking-wide border border-[#D4AF37]/30 shrink-0 mt-1 sm:mt-0">
                          {service.price}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{service.description}</p>
                    </div>

                    {/* Controls */}
                    {!service.isDefault && (
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => startEdit(service)}
                          title="Edit Service"
                          className="p-2.5 rounded-xl bg-white/5 text-gray-300 hover:text-[#D4AF37] hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id, service.title)}
                          title="Delete Service"
                          className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
