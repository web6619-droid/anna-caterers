/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { MenuItem, Category } from "@/types/admin";
import { defaultMenu } from "@/data/defaultCatalogue";
import { Plus, Trash2, Edit3, X, Utensils, Loader2, DollarSign, FileText, Tag, Filter, ShieldAlert, Copy, Check, Layers } from "lucide-react";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";

function extractCloudinaryPublicId(url?: string, existingId?: string): string | null {
  if (existingId) return existingId;
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const path = parts[1];
    const segments = path.split("/");
    const folderIdx = segments.findIndex((seg) => seg.startsWith("anna"));
    if (folderIdx !== -1) {
      const pubIdWithExt = segments.slice(folderIdx).join("/");
      const dotIdx = pubIdWithExt.lastIndexOf(".");
      return dotIdx !== -1 ? pubIdWithExt.substring(0, dotIdx) : pubIdWithExt;
    }
    return null;
  } catch {
    return null;
  }
}

interface MenuManagerTabProps {
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

const DEFAULT_CATEGORIES = [
  "Starter",
  "Main Course",
  "Dessert",
  "Kerala Traditional",
  "Beverages",
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
  const [isUploading, setIsUploading] = useState(false);
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
  const [subCategory, setSubCategory] = useState<string>("1st Course");
  const [suitableMeals, setSuitableMeals] = useState<string[]>(["Breakfast", "Lunch", "Dinner"]);
  const [isCombo, setIsCombo] = useState<boolean>(false);
  const [includedItems, setIncludedItems] = useState<string[]>([]);

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

  // 2. Subscribe to menu_items collection (with backward compat read/sync and unconstrained query)
  useEffect(() => {
    const qMenu = query(collection(db, "menu_items"));
    const unsubscribeMenu = onSnapshot(qMenu, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as MenuItem[];
      docs.sort((a: any, b: any) => {
        const timeB = b?.createdAt?.toMillis?.() || b?.createdAt?.seconds * 1000 || 0;
        const timeA = a?.createdAt?.toMillis?.() || a?.createdAt?.seconds * 1000 || 0;
        return timeB - timeA;
      });
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
      const finalSubCategory = category === "Main Course" ? subCategory : "";
      const cleanPrice = price.trim();
      const finalPrice = isNaN(Number(cleanPrice)) ? cleanPrice : Number(cleanPrice);
      await addDoc(collection(db, "menu_items"), {
        title: title.trim(),
        category: category || availableCategories[0] || "Main Course",
        subCategory: finalSubCategory,
        subCourse: finalSubCategory,
        price: finalPrice,
        description: description.trim(),
        imageUrl: imageUrl || "https://res.cloudinary.com/pzynujc5/image/upload/f_auto,q_auto/annacaterers/signature-weddings.jpg",
        imagePublicId: imagePublicId || "",
        suitableMeals: suitableMeals || ["Breakfast", "Lunch", "Dinner"],
        isCombo: isCombo,
        includedItems: isCombo ? includedItems : [],
        createdAt: serverTimestamp(),
      });
      showToast("success", `Dish "${title}" added to the ${category} menu catalogue!`);
      setTitle("");
      setDescription("");
      setPrice("₹250 / plate");
      setImageUrl("");
      setImagePublicId("");
      setSubCategory("1st Course");
      setSuitableMeals(["Breakfast", "Lunch", "Dinner"]);
      setIsCombo(false);
      setIncludedItems([]);
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
    setEditForm({
      ...item,
      imageUrl: item.imageUrl || "",
      imagePublicId: item.imagePublicId || "",
      suitableMeals: item.suitableMeals || ["Breakfast", "Lunch", "Dinner"],
      subCategory: item.subCategory || item.subCourse || "1st Course",
      subCourse: item.subCategory || item.subCourse || "1st Course",
      isCombo: item.isCombo || false,
      includedItems: item.includedItems || [],
    });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.title || editForm.price === undefined || editForm.price === null || editForm.price === "") return;
    setSaving(true);
    setPermissionBlocked(false);
    try {
      const currentItem = items.find((i) => i.id === id);
      const docRef = doc(db, "menu_items", id);
      const finalSubCategory = editForm.category === "Main Course" ? (editForm.subCategory || editForm.subCourse || "1st Course") : "";
      
      // Cleanup bonus: If image was replaced, remove old asset from Cloudinary edge storage
      if (currentItem && currentItem.imageUrl && editForm.imageUrl && editForm.imageUrl !== currentItem.imageUrl) {
        const oldPublicId = extractCloudinaryPublicId(currentItem.imageUrl, currentItem.imagePublicId || (currentItem as any).public_id);
        if (oldPublicId) {
          try {
            const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : "";
            fetch("/api/delete-image", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": idToken ? `Bearer ${idToken}` : ""
              },
              body: JSON.stringify({ 
                public_id: oldPublicId,
                publicId: oldPublicId,
                resource_type: "image"
              }),
            }).then(async (cldRes) => {
              if (cldRes.ok) {
                console.log(`Cleaned up replaced Cloudinary asset: ${oldPublicId}`);
              } else {
                console.warn("Could not destroy previous asset on Cloudinary:", await cldRes.json().catch(() => ({})));
              }
            }).catch((err) => console.warn("Background deletion call failed:", err));
          } catch (delErr) {
            console.warn("Error initiating image cleanup:", delErr);
          }
        }
      }

      const cleanTitle = String(editForm.title || "").trim();
      const cleanPriceStr = String(editForm.price).trim();
      const finalPrice = isNaN(Number(cleanPriceStr)) ? cleanPriceStr : Number(cleanPriceStr);

      await updateDoc(docRef, {
        title: cleanTitle,
        category: editForm.category || availableCategories[0] || "Main Course",
        subCategory: finalSubCategory,
        subCourse: finalSubCategory,
        price: finalPrice,
        description: editForm.description ? String(editForm.description).trim() : "",
        suitableMeals: editForm.suitableMeals || ["Breakfast", "Lunch", "Dinner"],
        imageUrl: editForm.imageUrl || "",
        imagePublicId: editForm.imagePublicId || "",
        isCombo: editForm.isCombo || false,
        includedItems: editForm.isCombo ? (editForm.includedItems || []) : [],
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
      const itemToDelete = items.find((i) => i.id === id);
      if (itemToDelete && itemToDelete.imageUrl) {
        const oldPublicId = extractCloudinaryPublicId(itemToDelete.imageUrl, itemToDelete.imagePublicId || (itemToDelete as any).public_id);
        if (oldPublicId) {
          const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : "";
          fetch("/api/delete-image", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": idToken ? `Bearer ${idToken}` : ""
            },
            body: JSON.stringify({ public_id: oldPublicId, publicId: oldPublicId, resource_type: "image" }),
          }).catch((err) => console.warn("Background asset destruction failed:", err));
        }
      }
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

      {/* Compact Form Container: Overhauled layout with CSS Grid to eliminate vertical scrolling on laptop screens */}
      <div className="lg:col-span-1 bg-[#18181B] border border-white/10 w-full max-w-full overflow-hidden p-4 rounded-2xl shadow-2xl lg:sticky lg:top-24 max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-[11px] uppercase tracking-widest">
            <Utensils className="w-3.5 h-3.5" /> Culinary Catalogue
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

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Create Menu Dish</h3>
          <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <input 
              type="checkbox" 
              checked={isCombo} 
              onChange={(e) => {
                setIsCombo(e.target.checked);
                if (!e.target.checked) setIncludedItems([]);
              }}
              className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
            />
            <span className="text-[#D4AF37] font-bold text-xs uppercase tracking-wider">Create as Combo Bundle</span>
          </label>
        </div>
        
        <form onSubmit={handleAddDish} className="space-y-3.5 w-full max-w-full text-xs">
          {/* Item Name */}
          <div className="w-full">
            <label className="flex items-center gap-1 font-semibold text-gray-300 uppercase tracking-wider mb-1 text-[11px]">
              Item Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Malabar Fish Curry"
              className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs md:text-sm transition-colors font-semibold"
            />
          </div>

          {/* Category/Price row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full items-start">
            <div>
              <label className="flex items-center gap-1 font-semibold text-gray-300 uppercase tracking-wider mb-1 text-[11px]">
                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs md:text-sm transition-colors cursor-pointer font-semibold"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 font-semibold text-gray-300 uppercase tracking-wider mb-1 text-[11px]">
                <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" /> Price / Unit
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹250 / plate"
                className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs md:text-sm transition-colors font-semibold"
              />
            </div>
          </div>

          {/* SUB-CATEGORY DROPDOWN (ONLY SHOWS IF MAIN COURSE) */}
          {category === 'Main Course' && (
            <div className="mt-4">
              <label className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 block">Course Type</label>
              <select 
                value={subCategory} 
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 rounded-md focus:border-yellow-500 outline-none"
              >
                <option value="">Select Course...</option>
                <option value="1st Course">1st Course</option>
                <option value="2nd Course">2nd Course</option>
              </select>
            </div>
          )}

          {/* MEAL TYPES CHECKBOXES */}
          <div className="mt-4">
            <label className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 block">Suitable For (Meal Types)</label>
            <div className="flex space-x-4">
              {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                <label key={meal} className="flex items-center space-x-2 text-white text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={suitableMeals.includes(meal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSuitableMeals([...suitableMeals, meal]);
                      } else {
                        setSuitableMeals(suitableMeals.filter(m => m !== meal));
                      }
                    }}
                    className="accent-yellow-500 w-4 h-4"
                  />
                  <span>{meal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* COMBO BUNDLE MULTI-SELECT */}
          {isCombo && (
            <div className="mt-4">
              <label className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 block">Included Items in Bundle</label>
              <div className="bg-[#0D0D0D] border border-white/15 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                {items
                  .filter((i) => i.category === category && !i.isCombo)
                  .map((item) => (
                    <label key={item.id} className="flex items-center space-x-2 text-white text-xs cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includedItems.includes(item.title)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIncludedItems([...includedItems, item.title]);
                          } else {
                            setIncludedItems(includedItems.filter(i => i !== item.title));
                          }
                        }}
                        className="accent-[#D4AF37] w-3.5 h-3.5"
                      />
                      <span>{item.title}</span>
                    </label>
                  ))}
                {items.filter((i) => i.category === category && !i.isCombo).length === 0 && (
                  <span className="text-gray-500 italic text-xs">No regular dishes available in {category}.</span>
                )}
              </div>
            </div>
          )}

          {/* Row 3: Tasting Notes / Description textarea in 2 rows */}
          <div className="w-full">
            <label className="flex items-center gap-1 font-semibold text-gray-300 uppercase tracking-wider mb-1 text-[11px]">
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Tasting Notes / Description
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh sear fish simmered in coconut milk with heirloom Kerala spices..."
              className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37] text-xs transition-colors resize-none"
            />
          </div>

          {/* Row 4: Compact Cloudinary Image Upload */}
          <div className="pt-1">
            <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Dish Photography (Vault)
            </label>
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden h-24 w-full border border-[#D4AF37]/50 mb-2 group">
                <img src={imageUrl} alt="Dish preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => { setImageUrl(""); setImagePublicId(""); }}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer"
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
                onUploadAdded={() => setIsUploading(true)}
                onClose={() => setIsUploading(false)}
                onError={() => {
                  setIsUploading(false);
                  showToast("error", "Failed to upload image to Cloudinary.");
                }}
                onSuccess={(result: CloudinaryUploadWidgetResults) => {
                  setIsUploading(false);
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
                    className="w-full py-2.5 px-3 bg-[#0D0D0D] border border-dashed border-[#D4AF37]/60 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Upload Dish Photography →</span>
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || isUploading}
            className="w-full py-3 rounded-full bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#b5952f] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#D4AF37]/15 disabled:opacity-50 mt-2"
          >
            {saving || isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
            <span>{isUploading ? "Uploading Photo..." : (saving ? "Saving Dish..." : "+ Save to Menu Catalogue")}</span>
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
                        {item.category} {(item.subCategory || item.subCourse) ? `• ${item.subCategory || item.subCourse}` : ""}
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={editForm.title || ""}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="flex-1 bg-[#0D0D0D] border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-[#D4AF37] mr-3"
                          />
                          <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors shrink-0">
                            <input 
                              type="checkbox" 
                              checked={editForm.isCombo || false} 
                              onChange={(e) => {
                                setEditForm({
                                  ...editForm,
                                  isCombo: e.target.checked,
                                  includedItems: e.target.checked ? editForm.includedItems : []
                                });
                              }}
                              className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                            />
                            <span className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-wider">Combo Bundle</span>
                          </label>
                        </div>
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
                        {/* SUB-CATEGORY DROPDOWN (ONLY SHOWS IF MAIN COURSE) */}
                        {editForm.category === 'Main Course' && (
                          <div className="mt-4">
                            <label className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 block">Course Type</label>
                            <select 
                              value={editForm.subCategory || editForm.subCourse || ""} 
                              onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value, subCourse: e.target.value })}
                              className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 rounded-md focus:border-yellow-500 outline-none text-xs"
                            >
                              <option value="">Select Course...</option>
                              <option value="1st Course">1st Course</option>
                              <option value="2nd Course">2nd Course</option>
                            </select>
                          </div>
                        )}

                        {/* MEAL TYPES CHECKBOXES */}
                        <div className="mt-4">
                          <label className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 block">Suitable For (Meal Types)</label>
                          <div className="flex space-x-4">
                            {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                              const isChecked = (editForm.suitableMeals || ["Breakfast", "Lunch", "Dinner"]).includes(meal);
                              return (
                                <label key={meal} className="flex items-center space-x-2 text-white text-xs cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const prev = editForm.suitableMeals || ["Breakfast", "Lunch", "Dinner"];
                                      if (e.target.checked) {
                                        setEditForm({ ...editForm, suitableMeals: [...prev, meal] });
                                      } else {
                                        setEditForm({ ...editForm, suitableMeals: prev.filter(m => m !== meal) });
                                      }
                                    }}
                                    className="accent-yellow-500 w-4 h-4"
                                  />
                                  <span>{meal}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* COMBO BUNDLE MULTI-SELECT */}
                        {editForm.isCombo && (
                          <div className="mt-4">
                            <label className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2 block">Included Items in Bundle</label>
                            <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                              {items
                                .filter((i) => i.category === editForm.category && !i.isCombo && i.id !== editForm.id)
                                .map((comboItem) => (
                                  <label key={comboItem.id} className="flex items-center space-x-2 text-white text-xs cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={(editForm.includedItems || []).includes(comboItem.title)}
                                      onChange={(e) => {
                                        const prev = editForm.includedItems || [];
                                        if (e.target.checked) {
                                          setEditForm({ ...editForm, includedItems: [...prev, comboItem.title] });
                                        } else {
                                          setEditForm({ ...editForm, includedItems: prev.filter(i => i !== comboItem.title) });
                                        }
                                      }}
                                      className="accent-[#D4AF37] w-3.5 h-3.5"
                                    />
                                    <span>{comboItem.title}</span>
                                  </label>
                                ))}
                              {items.filter((i) => i.category === editForm.category && !i.isCombo && i.id !== editForm.id).length === 0 && (
                                <span className="text-gray-500 italic text-xs">No regular dishes available in {editForm.category}.</span>
                              )}
                            </div>
                          </div>
                        )}
                        <textarea
                          rows={2}
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl p-2 text-xs text-gray-300 resize-none mt-3"
                        />

                        {/* Inline Image Replacement & Preview */}
                        <div className="pt-2">
                          <label className="block text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2">
                            Dish Photography
                          </label>
                          {editForm.imageUrl ? (
                            <div className="flex items-center gap-3 p-2 bg-[#0D0D0D] border border-white/10 rounded-xl">
                              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border border-[#D4AF37]/40 shrink-0 relative bg-[#1c1c1c]">
                                <img src={editForm.imageUrl} alt="Active preview" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold truncate mb-1.5">Active Photograph</p>
                                <CldUploadWidget
                                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "anna_caterers"}
                                  options={{
                                    folder: "annacaterers",
                                    maxFiles: 1,
                                    resourceType: "image",
                                  }}
                                  onUploadAdded={() => setIsUploading(true)}
                                  onClose={() => setIsUploading(false)}
                                  onError={() => {
                                    setIsUploading(false);
                                    showToast("error", "Failed to replace photo on Cloudinary.");
                                  }}
                                  onSuccess={(result: CloudinaryUploadWidgetResults) => {
                                    setIsUploading(false);
                                    if (result.info && typeof result.info === "object" && result.info.secure_url) {
                                      setEditForm((prev) => ({
                                        ...prev,
                                        imageUrl: (result.info as any).secure_url,
                                        imagePublicId: (result.info as any).public_id || "",
                                      }));
                                      showToast("info", "New photo staged! Click Save below to finalize.");
                                    }
                                  }}
                                >
                                  {({ open }) => (
                                    <button
                                      type="button"
                                      onClick={() => open()}
                                      className="py-1.5 px-3 bg-[#18181B] border border-[#D4AF37]/60 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-black transition-all font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                                    >
                                      <span>Replace Photo ⟳</span>
                                    </button>
                                  )}
                                </CldUploadWidget>
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
                              onUploadAdded={() => setIsUploading(true)}
                              onClose={() => setIsUploading(false)}
                              onError={() => {
                                setIsUploading(false);
                                showToast("error", "Failed to upload photo on Cloudinary.");
                              }}
                              onSuccess={(result: CloudinaryUploadWidgetResults) => {
                                setIsUploading(false);
                                if (result.info && typeof result.info === "object" && result.info.secure_url) {
                                  setEditForm((prev) => ({
                                    ...prev,
                                    imageUrl: (result.info as any).secure_url,
                                    imagePublicId: (result.info as any).public_id || "",
                                  }));
                                  showToast("info", "Photo uploaded! Click Save below to finalize.");
                                }
                              }}
                            >
                              {({ open }) => (
                                <button
                                  type="button"
                                  onClick={() => open()}
                                  className="w-full py-2.5 px-3 bg-[#0D0D0D] border border-dashed border-[#D4AF37]/60 text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/10 transition-all font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <span>Upload Dish Photography →</span>
                                </button>
                              )}
                            </CldUploadWidget>
                          )}
                        </div>

                        <div className="flex justify-end items-center gap-2 pt-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(item.id)}
                            disabled={saving || isUploading}
                            className="px-4 py-1.5 rounded-lg bg-[#D4AF37] text-black text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                          >
                            {saving || isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>{saving ? "Saving..." : (isUploading ? "Uploading..." : "Save")}</span>
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
