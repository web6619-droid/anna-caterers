"use client";

import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { GalleryItem } from "@/types/admin";
import { defaultGallery } from "@/data/defaultCatalogue";
import { Trash2, Image as ImageIcon, Loader2, Plus, ShieldAlert, Film, Copy, Check, X, Tag as TagIcon } from "lucide-react";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";

interface GalleryManagerTabProps {
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

type GalleryCategory = {
  id: string;
  name: string;
  isDefault?: boolean;
};

const DEFAULT_GALLERY_TAGS = ["Weddings", "Corporate", "Celebrations", "Private Dining", "Cultural Feasts"];

export default function GalleryManagerTab({ showToast }: GalleryManagerTabProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>(
    DEFAULT_GALLERY_TAGS.map((t, idx) => ({ id: `default-${idx}`, name: t, isDefault: true }))
  );
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState("All");
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Upload Form State
  const [defaultTitle, setDefaultTitle] = useState("Royal Banquet Showcase");
  const [selectedTag, setSelectedTag] = useState("Weddings");
  const [defaultIsVideo, setDefaultIsVideo] = useState(false);

  // Refs to guarantee completely fresh state inside asynchronous Cloudinary callbacks (preventing stale closures)
  const selectedTagRef = useRef(selectedTag);
  const defaultTitleRef = useRef(defaultTitle);
  const defaultIsVideoRef = useRef(defaultIsVideo);

  useEffect(() => { selectedTagRef.current = selectedTag; }, [selectedTag]);
  useEffect(() => { defaultTitleRef.current = defaultTitle; }, [defaultTitle]);
  useEffect(() => { defaultIsVideoRef.current = defaultIsVideo; }, [defaultIsVideo]);

  // Dedicated Tag Management Modal State
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagSaving, setTagSaving] = useState(false);

  const firestoreRulesText = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /reviews/{review} {\n      allow read, create: if true;\n      allow update, delete: if request.auth != null;\n    }\n    match /{document=**} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n  }\n}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(firestoreRulesText);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  useEffect(() => {
    // 1. Subscribe to gallery items in real time
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribeGallery = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as GalleryItem[];
      setItems(docs);
      setLoading(false);
    }, (err: any) => {
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
      }
      console.warn("Error fetching gallery items (falling back to defaults):", err);
      setLoading(false);
    });

    // 2. Subscribe to dedicated gallery_categories collection
    const qCat = query(collection(db, "gallery_categories"), orderBy("name", "asc"));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const cats = snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name || d.id,
        })) as GalleryCategory[];
        setCategories(cats);
        
        // Ensure selectedTag remains valid against existing categories
        setSelectedTag((prev) => {
          return cats.some((c) => c.name === prev) ? prev : cats[0].name;
        });
      } else {
        const defaults = DEFAULT_GALLERY_TAGS.map((t, idx) => ({ id: `default-${idx}`, name: t, isDefault: true }));
        setCategories(defaults);
        setSelectedTag((prev) => (defaults.some((c) => c.name === prev) ? prev : defaults[0].name));
      }
    }, (err) => {
      console.warn("Error fetching gallery_categories, utilizing defaults:", err);
    });

    return () => {
      unsubscribeGallery();
      unsubscribeCat();
    };
  }, []);

  // Tag Management Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTagName.trim();
    if (!cleanName) return;

    if (categories.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      showToast("error", `Tag "${cleanName}" already exists!`);
      return;
    }

    setTagSaving(true);
    try {
      await addDoc(collection(db, "gallery_categories"), {
        name: cleanName,
        createdAt: serverTimestamp(),
      });
      showToast("success", `Created new event tag: "${cleanName}"`);
      setNewTagName("");
      setSelectedTag(cleanName); // Instantly select newly created tag in upload form!
    } catch (err: any) {
      console.error("Failed to add category:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
      }
      showToast("error", "Failed to save tag to Firestore.");
    } finally {
      setTagSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: GalleryCategory) => {
    if (cat.isDefault) {
      showToast("info", "Default fallback tags cannot be deleted directly. Add your custom tags to override defaults!");
      return;
    }
    if (!confirm(`Delete event tag "${cat.name}"? Existing media already uploaded with this tag will stay unaffected, but it will be removed from future choices.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, "gallery_categories", cat.id));
      showToast("info", `Removed event tag "${cat.name}".`);
      if (selectedTag === cat.name && categories.length > 1) {
        const remaining = categories.filter((c) => c.id !== cat.id);
        if (remaining.length > 0) setSelectedTag(remaining[0].name);
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      showToast("error", "Failed to remove tag from database.");
    }
  };

  const handleUploadSuccess = async (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === "object") {
      const info: any = result.info;
      const secureUrl = info.secure_url;
      const publicId = info.public_id;
      
      // Use refs to bypass stale React state closures in async callback
      const currentTag = selectedTagRef.current || "Weddings";
      const currentTitle = defaultTitleRef.current || "Event Moment";
      const isResourceVideo = info.resource_type === "video" || defaultIsVideoRef.current;
      const resourceType = isResourceVideo ? "video" : "image";
      
      setPermissionBlocked(false);
      
      try {
        await addDoc(collection(db, "gallery"), {
          title: currentTitle,
          caption: currentTitle,
          tag: currentTag,
          eventTag: currentTag,
          category: currentTag,
          isVideo: isResourceVideo,
          type: resourceType,
          resource_type: resourceType,
          imageUrl: secureUrl,
          secure_url: secureUrl,
          imagePublicId: publicId,
          public_id: publicId,
          createdAt: serverTimestamp(),
        });
        showToast("success", `${isResourceVideo ? "Video reel" : "Photo asset"} uploaded and tagged with "${currentTag}"!`);
      } catch (err: any) {
        console.error("Error saving gallery metadata:", err);
        if (err?.code === "permission-denied" || err?.message?.includes("permission") || err?.message?.includes("insufficient")) {
          setPermissionBlocked(true);
          showToast("error", "Uploaded to Cloudinary, but Firestore Security Rules blocked database write!");
        } else {
          showToast("error", "Uploaded to Cloudinary, but failed to record in Firestore database.");
        }
      }
    }
  };

  const handleDeleteImage = async (item: any) => {
    if (item.isDefault) {
      showToast("info", "This is a default storefront sample photo. Upload your own custom event photography or video reels above to replace default placeholders!");
      return;
    }

    if (!confirm(`Permanently destroy asset "${item.title || item.id}"? This will delete both the database record and wipe the image/video from Cloudinary edge servers.`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      if (item.imagePublicId || item.public_id) {
        const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : "";
        const cldRes = await fetch("/api/delete-image", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": idToken ? `Bearer ${idToken}` : ""
          },
          body: JSON.stringify({ 
            public_id: item.imagePublicId || item.public_id,
            publicId: item.imagePublicId || item.public_id,
            resource_type: item.resource_type || item.type || (item.isVideo ? "video" : "image")
          }),
        });
        if (!cldRes.ok) {
          const errData = await cldRes.json().catch(() => ({}));
          console.warn("Cloudinary remote destruction status:", errData);
        }
      }

      await deleteDoc(doc(db, "gallery", item.id));
      showToast("info", "Asset permanently wiped from Cloudinary CDN and Firestore.");
    } catch (err: any) {
      console.error("Failed to delete media asset:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission") || err?.message?.includes("insufficient")) {
        setPermissionBlocked(true);
      }
      showToast("error", "Failed to fully delete asset.");
    } finally {
      setDeletingId(null);
    }
  };

  const displayItems = items.length > 0 ? items : defaultGallery.map((g, idx) => ({ ...g, id: `default-gallery-${idx}`, isDefault: true }));
  const tagNames = categories.map((c) => c.name);

  const filteredItems = selectedTagFilter === "All"
    ? displayItems
    : displayItems.filter((i: any) => (i.eventTag || i.tag || i.category) === selectedTagFilter);

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Pinned Module Header & Upload Control Board */}
      <div className="bg-[#18181B] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-widest mb-2">
              <ImageIcon className="w-4 h-4" /> Server-Signed CDN Vault
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
              Gallery & <span className="text-[#D4AF37] font-serif italic">Media Engine</span>.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              All image and video streams are cryptographically locked to the <code className="text-[#D4AF37] font-mono bg-black/40 px-2 py-0.5 rounded">annacaterers</code> namespace. Supports high-definition photography and up to 100MB video reels.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl w-fit">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Asset destruction calls strictly enforced by backend Admin authorization.</span>
            </div>
          </div>

          <div className="bg-[#0D0D0D] p-6 rounded-2xl border border-white/10 space-y-4 shadow-inner">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300">Upload Tagging & Media Configuration</h4>
              <button
                type="button"
                onClick={() => setShowTagModal(true)}
                className="text-[#D4AF37] hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <TagIcon className="w-3 h-3" />
                <span>+ Manage Tags</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">Display Caption / Title</label>
                <input
                  type="text"
                  value={defaultTitle}
                  onChange={(e) => setDefaultTitle(e.target.value)}
                  placeholder="e.g. Grand Banquet Setup"
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">EVENT TAG</label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-[#D4AF37] cursor-pointer font-medium"
                >
                  {categories.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none font-semibold">
                <input
                  type="checkbox"
                  checked={defaultIsVideo}
                  onChange={(e) => setDefaultIsVideo(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-[#D4AF37] focus:ring-0 accent-[#D4AF37]"
                />
                <Film className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Mark as Video Reel Asset</span>
              </label>

              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "anna_caterers"}
                options={{
                  folder: "annacaterers",
                  resourceType: "auto",
                  clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "mp4", "mov", "webm"],
                  maxFileSize: 100000000,
                }}
                onSuccess={handleUploadSuccess}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="px-6 py-3 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#b5952f] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/25"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Launch CDN Uploader</span>
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
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

      {items.length === 0 && !loading && (
        <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium">
          💡 Currently displaying main website default gallery media. Any image or video reel you upload will appear live on the site immediately.
        </div>
      )}

      {/* Gallery Grid & Tag Filter Bars */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-2xl font-bold text-white tracking-tight">Hosted Portfolio Assets ({displayItems.length})</h3>
            <button
              type="button"
              onClick={() => setShowTagModal(true)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Manage Tags</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {["All", ...tagNames].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedTagFilter === tag
                    ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
                    : "bg-[#18181B] text-gray-400 hover:text-[#D4AF37] border border-white/10"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable grid container keeping upload header pinned above */}
        <div className="max-h-[calc(100vh-240px)] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-3" />
              <span className="text-xs uppercase font-bold tracking-widest">Synchronizing CDN media vault...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
              {filteredItems.map((item: any) => {
                const assetUrl = item.imageUrl || item.secure_url || "";
                const itemTitle = item.title || item.caption || "Event Asset";
                const itemTag = item.eventTag || item.tag || item.category || "Weddings";
                const isAssetVideo = item.isVideo || item.type === "video" || item.resource_type === "video" || assetUrl.match(/\.(mp4|mov|webm)($|\?)/i);

                return (
                  <div
                    key={item.id}
                    className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#18181B] border border-white/5 group shadow-lg hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-end"
                  >
                    {isAssetVideo ? (
                      <video
                        src={assetUrl}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    ) : (
                      <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url(${assetUrl})` }}
                      />
                    )}

                    {isAssetVideo && (
                      <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md text-[#D4AF37] text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full border border-[#D4AF37]/40 flex items-center gap-1.5 z-20 shadow-md">
                        <span className="animate-pulse text-xs">▷</span>
                        <span>VIDEO</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 z-10">
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-wider block mb-0.5 truncate">
                            {itemTag}
                          </span>
                          <h4 className="text-white text-sm font-bold truncate">{itemTitle}</h4>
                        </div>

                        {!item.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(item)}
                            disabled={deletingId === item.id}
                            title={`Permanently Delete ${isAssetVideo ? "Video" : "Image"}`}
                            className="p-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0 shadow-lg cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Tag Manager Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#18181B] border border-white/15 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              type="button"
              onClick={() => setShowTagModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs uppercase tracking-widest mb-1">
                <TagIcon className="w-4 h-4" /> Category Taxonomy
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Event Tag Manager</h3>
              <p className="text-xs text-gray-400 mt-1">
                Add custom event tags to categorize photos and video reels. Changes synchronize instantly across your dashboard and live customer gallery.
              </p>
            </div>

            {/* Add New Tag Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., Birthday, Housewarming..."
                className="flex-1 bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#D4AF37] placeholder:text-gray-600"
              />
              <button
                type="submit"
                disabled={tagSaving || !newTagName.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#b5952f] transition-all disabled:opacity-50 flex items-center gap-1.5 shadow cursor-pointer"
              >
                {tagSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                <span>Add</span>
              </button>
            </form>

            {/* Current Tags List */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Event Tags ({categories.length})</h4>
              <div className="max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0D0D0D] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                      <span className="text-sm font-semibold text-white">{cat.name}</span>
                      {cat.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400">Default</span>
                      )}
                    </div>

                    {!cat.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        title="Delete category tag"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTagModal(false)}
                className="px-6 py-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
