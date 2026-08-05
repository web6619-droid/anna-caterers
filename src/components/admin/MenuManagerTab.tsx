/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { MenuItem, Category } from "@/types/admin";
import { defaultMenu } from "@/data/defaultCatalogue";
import { Plus, Trash2, Edit3, X, Utensils, Loader2, DollarSign, FileText, Tag, Filter, ShieldAlert, Copy, Check, Layers } from "lucide-react";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";

interface MenuManagerTabProps {
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

const DEFAULT_CATEGORIES = [
  "Starter",
  "Main Course",
  "Dessert",
  "Kerala Traditional",
  "Beverage",
  "Live Station",
  "Live Counters",
  "Kerala Sadyas"
];

export default function MenuManagerTab({ showToast }: MenuManagerTabProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Category Management Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  // Form states for creating a dish
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Main Course");
  const [price, setPrice] = useState("₹250 / plate");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [suitableMeals, setSuitableMeals] = useState<string[]>(["Breakfast", "Lunch", "Dinner"]);

  const toggleSuitableMeal = (meal: string) => {
    setSuitableMeals((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
    );
  };

  // Edit form state for dishes
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});

  const firestoreRulesText = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /reviews/{review} {\n      allow read, create: if true;\n      allow update, delete: if request.auth != null;\n    }\n    match /{document=**} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n  }\n}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(firestoreRulesText);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  // 1. Subscribe to dynamically managed Categories collection
  useEffect(() => {
    const qCat = query(collection(db, "categories"), orderBy("createdAt", "asc"));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      const catDocs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Category[];
      setCategories(catDocs);
      setCatLoading(false);
      
      // Auto-select first category if form category isn't set yet
      if (catDocs.length > 0 && !catDocs.some(c => c.name === category)) {
        setCategory(catDocs[0].name);
      }
    }, (err: any) => {
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
      }
      console.warn("Error fetching categories:", err);
      setCatLoading(false);
    });

    return () => unsubscribeCat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Subscribe to menu_items collection (with backward compat read/sync)
  useEffect(() => {
    const qMenu = query(collection(db, "menu_items"), orderBy("createdAt", "desc"));
    const unsubscribeMenu = onSnapshot(qMenu, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as MenuItem[];
      setItems(docs);
      setLoading(false);
    }, (err: any) => {
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
      }
      console.warn("Error fetching menu items:", err);
      setLoading(false);
    });

    return () => unsubscribeMenu();
  }, []);

  // Compute active category list (with fallback to default list if Firestore collection is empty)
  const availableCategories: string[] = categories.length > 0 
    ? categories.map(c => c.name) 
    : DEFAULT_CATEGORIES;

  // Handle Menu Dish Creation
  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim() || !description.trim()) {
      showToast("error", "Please complete all dish details before saving.");
      return;
    }
    setSaving(true);
    setPermissionBlocked(false);
    try {
      await addDoc(collection(db, "menu_items"), {
        title: title.trim(),
        category: category || availableCategories[0] || "Main Course",
        price: price.trim(),
        description: description.trim(),
        imageUrl: imageUrl || "https://res.cloudinary.com/pzynujc5/image/upload/f_auto,q_auto/annacaterers/signature-weddings.jpg",
        imagePublicId: imagePublicId || "",
        suitableMeals: suitableMeals || ["Breakfast", "Lunch", "Dinner"],
        createdAt: serverTimestamp(),
      });
      showToast("success", `Dish "${title}" added to the ${category} menu catalogue!`);
      setTitle("");
      setDescription("");
      setPrice("₹250 / plate");
      setImageUrl("");
      setImagePublicId("");
      setSuitableMeals(["Breakfast", "Lunch", "Dinner"]);
    } catch (err: any) {
      console.error(err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission") || err?.message?.includes("insufficient")) {
        setPermissionBlocked(true);
        showToast("error", "Firestore Security Rules are blocking writes!");
      } else {
        showToast("error", "Failed to add menu dish to Firestore.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Dish Editing & Deletion
  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({ ...item, suitableMeals: item.suitableMeals || ["Breakfast", "Lunch", "Dinner"] });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.title || !editForm.price) return;
    setSaving(true);
    setPermissionBlocked(false);
    try {
      const docRef = doc(db, "menu_items", id);
      await updateDoc(docRef, {
        title: editForm.title.trim(),
        category: editForm.category || availableCategories[0] || "Main Course",
        price: editForm.price.trim(),
        description: editForm.description ? editForm.description.trim() : "",
        suitableMeals: editForm.suitableMeals || ["Breakfast", "Lunch", "Dinner"],
      });
      showToast("success", "Dish updated successfully!");
      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
      }
      showToast("error", "Failed to update dish.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, dishTitle: string) => {
    if (!confirm(`Delete dish "${dishTitle}" from the active menu?`)) return;
    try {
      await deleteDoc(doc(db, "menu_items", id));
      showToast("info", `Deleted dish "${dishTitle}".`);
    } catch (err: any) {
      console.error(err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
      }
      showToast("error", "Failed to delete dish.");
    }
  };

  // Category CRUD Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (availableCategories.includes(newCatName.trim())) {
      showToast("error", "Category already exists!");
      return;
    }
    setCatSaving(true);
    setPermissionBlocked(false);
    try {
      await addDoc(collection(db, "categories"), {
        name: newCatName.trim(),
        createdAt: serverTimestamp(),
      });
      showToast("success", `Created new menu category: "${newCatName.trim()}"`);
      setNewCatName("");
    } catch (err: any) {
      console.error(err);
      if (err?.code === "permission-denied" || err?.message?.includes("permission")) {
        setPermissionBlocked(true);
        showToast("error", "Firestore Security Rules blocked saving category!");
      } else {
        showToast("error", "Failed to save category.");
      }
    } finally {
      setCatSaving(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCatName.trim()) return;
    setCatSaving(true);
    try {
      await updateDoc(doc(db, "categories", id), {
        name: editingCatName.trim(),
      });
      showToast("success", "Category renamed successfully!");
      setEditingCatId(null);
      setEditingCatName("");
    } catch (err: any) {
      console.error(err);
      showToast("error", "Failed to rename category.");
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Permanently delete category "${catName}"? Dishes inside this category will remain, but their category tag may need reassigning.`)) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      showToast("info", `Removed category "${catName}".`);
      if (selectedCategoryFilter === catName) setSelectedCategoryFilter("All");
    } catch (err: any) {
      console.error(err);
      showToast("error", "Failed to delete category.");
    }
  };

  const handleSeedDefaultCategories = async () => {
    setCatSaving(true);
    try {
      for (const cat of DEFAULT_CATEGORIES) {
        await addDoc(collection(db, "categories"), {
          name: cat,
          createdAt: serverTimestamp(),
        });
      }
      showToast("success", "Default culinary categories seeded into Firestore!");
    } catch (err: any) {
      console.error(err);
      showToast("error", "Failed to seed categories due to permissions or network.");
    } finally {
      setCatSaving(false);
    }
  };

  const displayItems: any[] = items.length > 0 
    ? items 
    : defaultMenu.map((m, idx) => ({ ...m, id: `default-menu-${idx}`, isDefault: true }));

  const filteredItems = selectedCategoryFilter === "All"
    ? displayItems
    : displayItems.filter((i) => i.category === selectedCategoryFilter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fadeIn items-start">
      
      {/* Category Management Modal Overlay */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#18181B] border border-[#D4AF37]/40 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-xl font-bold text-white">Dynamic Category Engine</h3>
              </div>
              <button
                onClick={() => setShowCatModal(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Manage your dynamic Firestore categories here. These categories directly power your dish configuration dropdown and storefront filtering chips.
            </p>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New Category Name (e.g. Live Counters, Beverages)"
                className="flex-1 bg-[#0D0D0D] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              />
              <button
                type="submit"
                disabled={catSaving}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#b5952f] transition-all shrink-0 disabled:opacity-50"
              >
                {catSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add +"}
              </button>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Active Firestore Categories ({categories.length})</h4>
              
              {catLoading ? (
                <div className="py-8 flex justify-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                </div>
              ) : categories.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-white/10 text-center space-y-3">
                  <p className="text-xs text-gray-400">No categories found in Firestore database yet. Currently using fallback list.</p>
                  <button
                    type="button"
                    onClick={handleSeedDefaultCategories}
                    disabled={catSaving}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-xs hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer"
                  >
                    ⚡ Seed 8 Default Categories to Database
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id} className="py-2.5 flex items-center justify-between gap-3 group">
                      {editingCatId === cat.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="bg-[#0D0D0D] border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white font-bold flex-1"
                          />
                          <button
                            onClick={() => handleUpdateCategory(cat.id)}
                            className="p-1.5 rounded-lg bg-[#D4AF37] text-black hover:bg-[#b5952f]"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="p-1.5 rounded-lg bg-white/10 text-gray-400 hover:text-white"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors">{cat.name}</span>
                          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                              title="Edit Category Name"
                              className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-[#D4AF37] hover:bg-white/10 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              title="Delete Category"
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="px-6 py-2.5 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A. Form Scroll & Save Button Visibility Fix: Left Column wrapped in max-h and custom-scrollbar */}
      <div className="lg:col-span-1 bg-[#18181B] border border-white/5 w-full max-w-full overflow-hidden p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl lg:sticky lg:top-28 max-h-[85vh] lg:max-h-[calc(100vh-180px)] overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-widest">
            <Utensils className="w-4 h-4" /> Culinary Catalogue
          </div>
          <button
            type="button"
            onClick={() => setShowCatModal(true)}
            title="Configure Categories"
            className="text-[11px] font-extrabold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+ Manage Categories</span>
          </button>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-4 md:mb-6">Create Menu Dish</h3>
        
        <form onSubmit={handleAddDish} className="space-y-3.5 md:space-y-5 w-full max-w-full">
          <div className="w-full">
            <label className="flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 md:mb-2">
              Dish Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Malabar Fish Curry & Appam"
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-3.5 py-2.5 md:px-4 md:py-3 text-white focus:outline-none focus:border-[#D4AF37] text-xs md:text-sm transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4 w-full">
            <div className="w-full">
              <label className="flex items-center justify-between gap-1 text-[11px] md:text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 md:mb-2">
                <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-[#D4AF37]" /> Category</span>
              </label>
              {/* Dynamic Category <select> integration */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-2.5 md:py-3 text-white focus:outline-none focus:border-[#D4AF37] text-xs md:text-sm transition-colors cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className="flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 md:mb-2">
                <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" /> Price / Unit
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹350 / head"
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-3.5 py-2.5 md:px-3 md:py-3 text-white focus:outline-none focus:border-[#D4AF37] text-xs md:text-sm transition-colors"
              />
            </div>
          </div>

          <div className="w-full">
            <label className="flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 md:mb-2">
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Tasting Notes / Ingredients
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh sear fish simmered in rich coconut milk with heirloom Kerala spices..."
              className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-3.5 py-2.5 md:px-4 md:py-3 text-white focus:outline-none focus:border-[#D4AF37] text-xs md:text-sm transition-colors resize-none"
            />
          </div>

          {/* Suitable For (Meal Types) Checkboxes */}
          <div className="w-full">
            <label className="flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              <Utensils className="w-3.5 h-3.5 text-[#D4AF37]" /> Suitable For (Meal Types)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                const isSelected = suitableMeals.includes(meal);
                return (
                  <div
                    key={meal}
                    onClick={() => toggleSuitableMeal(meal)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                        : "bg-[#0D0D0D] border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <span>{meal}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 accent-[#D4AF37] rounded cursor-pointer pointer-events-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cloudinary CDN Image Upload Widget */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Dish Photography (annacaterers Vault)
            </label>
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden h-36 w-full border border-[#D4AF37]/50 mb-3 group">
                <img src={imageUrl} alt="Dish preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => { setImageUrl(""); setImagePublicId(""); }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "anna_caterers"}
                options={{
                  folder: "annacaterers",
                  maxFiles: 1,
                  resourceType: "image",
                }}
                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                  if (result.info && typeof result.info === "object" && result.info.secure_url) {
                    setImageUrl(result.info.secure_url);
                    if (result.info.public_id) setImagePublicId(result.info.public_id);
                    showToast("info", "Dish photograph uploaded directly to Cloudinary CDN.");
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full py-3.5 px-4 bg-[#0D0D0D] border border-dashed border-[#D4AF37]/60 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Upload Dish Photography →</span>
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
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
            <span>+ Save to Menu Catalogue</span>
          </button>
        </form>
      </div>

      {/* Right Column: Active Menu Catalogue with Fixed Header/Filters and Independent Scrolling */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Fixed Header & Dynamic Filter Chips */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Active Menu Catalogue ({displayItems.length})</h3>
            <p className="text-gray-400 text-sm">Organized across traditional Kerala feasts, interactive live booths, and international galas.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto pb-1 max-w-full">
            <Filter className="w-4 h-4 text-[#D4AF37] shrink-0 ml-1" />
            {["All", ...availableCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? "bg-[#D4AF37] text-black shadow-md"
                    : "bg-[#18181B] text-gray-300 hover:text-[#D4AF37] border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowCatModal(true)}
              title="Add or edit category names"
              className="px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide bg-[#0D0D0D] text-[#D4AF37] border border-[#D4AF37]/50 hover:bg-[#D4AF37] hover:text-black transition-all shrink-0 cursor-pointer ml-2 flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>+ Manage Categories</span>
            </button>
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

        {items.length === 0 && !loading && (
          <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium">
            💡 Currently displaying main website default sample dishes. Add your first custom dish on the left to start curating your online culinary menu!
          </div>
        )}

        {/* B. Independent Scrolling for Right Column: Dish grid wrapped in fixed max height container */}
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold">Synchronizing dishes...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-[#18181B] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4AF37]/40 transition-all duration-300 flex flex-col group shadow-xl"
                >
                  {item.imageUrl && (
                    <div className="h-44 w-full relative overflow-hidden bg-[#0D0D0D]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[#D4AF37] text-[10px] font-extrabold tracking-wider border border-[#D4AF37]/30 uppercase">
                        {item.category}
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.title || ""}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-[#D4AF37]"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editForm.category || availableCategories[0]}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="bg-[#0D0D0D] border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                          >
                            {availableCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
                          </select>
                          <input
                            type="text"
                            value={editForm.price || ""}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            className="bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#D4AF37] font-semibold"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl p-2 text-xs text-gray-300 resize-none"
                        />
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Suitable For (Meal Types)</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                              const isSelected = (editForm.suitableMeals || ["Breakfast", "Lunch", "Dinner"]).includes(meal);
                              return (
                                <div
                                  key={meal}
                                  onClick={() => {
                                    const prev = editForm.suitableMeals || ["Breakfast", "Lunch", "Dinner"];
                                    const updated = prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal];
                                    setEditForm({ ...editForm, suitableMeals: updated });
                                  }}
                                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-between cursor-pointer transition-all ${
                                    isSelected
                                      ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]"
                                      : "bg-[#0D0D0D] border-white/10 text-gray-400"
                                  }`}
                                >
                                  <span>{meal}</span>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-3 h-3 accent-[#D4AF37] rounded pointer-events-none"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(item.id)}
                            disabled={saving}
                            className="px-4 py-1.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            <span className="text-sm font-extrabold text-[#D4AF37] shrink-0">
                              {item.price}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-3">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(item.suitableMeals || ["Breakfast", "Lunch", "Dinner"]).map((meal: string) => (
                              <span key={meal} className="px-2 py-0.5 rounded-md bg-[#0D0D0D] border border-white/10 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                {meal}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                            ID: {item.isDefault ? "DEFAULT" : item.id.slice(0, 8)}
                          </span>
                          {!item.isDefault && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => startEdit(item)}
                                title="Edit Dish"
                                className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-[#D4AF37] hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.title)}
                                title="Delete Dish"
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
