"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Trash2, Plus } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { revalidateServices } from "@/app/actions";

type Service = {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string | null;
  icon: string | null;
};

export default function AdminDashboard({ initialServices }: { initialServices: Service[] }) {
  const [isPending, setIsPending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const price = formData.get("price") as string;
      const icon = formData.get("icon") as string;
      const image = formData.get("image") as File;

      let imageUrl = null;

      // 1. Upload Image to Firebase Storage if exists
      if (image && image.size > 0) {
        const uniqueFilename = `${Date.now()}-${image.name}`;
        const storageRef = ref(storage, `services/${uniqueFilename}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }

      // 2. Save Data to Firestore
      await addDoc(collection(db, "services"), {
        title,
        description,
        price,
        icon: icon || "🍽️",
        imageUrl,
        createdAt: serverTimestamp(),
      });

      // 3. Clear form and trigger Next.js revalidation
      formRef.current?.reset();
      setUploadProgress(0);
      await revalidateServices();

    } catch (error) {
      console.error("Error adding service:", error);
      alert("Failed to add service. Check console.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteDoc(doc(db, "services", id));
      await revalidateServices();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Add Form */}
      <div className="lg:col-span-1 bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 h-fit">
        <h2 className="text-2xl font-bold mb-6 text-gold">Add New Service</h2>
        <form ref={formRef} onSubmit={handleAdd} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Title / Event Name</label>
            <input name="title" required type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" placeholder="e.g. Signature Weddings" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Description</label>
            <textarea name="description" required rows={3} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none resize-none" placeholder="Event details..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Starting Price</label>
            <input name="price" required type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" placeholder="e.g. ₹50,000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Icon (Emoji)</label>
              <input name="icon" type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none" placeholder="💍" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Cover Photo</label>
              <input name="image" type="file" accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-black hover:file:bg-gold-hover cursor-pointer" />
            </div>
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-black rounded-full h-2 mt-4">
              <div className="bg-gold h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}

          <button disabled={isPending} type="submit" className="w-full bg-gold text-black font-bold py-4 rounded-xl hover:bg-[#b5952f] transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50">
            <Plus className="w-5 h-5" />
            {isPending ? "Uploading..." : "Save Service"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold mb-6">Current Services ({initialServices.length})</h2>
        {initialServices.length === 0 ? (
          <div className="text-[#a0a0a0] p-8 text-center bg-[#1a1a1a] rounded-2xl border border-white/5">
            No services added yet. Add one to see it here!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialServices.map((service) => (
              <div key={service.id} className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 relative group">
                {service.imageUrl && (
                  <div className="h-48 w-full relative">
                    <Image src={service.imageUrl} alt={service.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                  </div>
                )}
                <div className={`p-6 ${service.imageUrl ? 'pt-2' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {service.icon && <span>{service.icon}</span>}
                      {service.title}
                    </h3>
                    <span className="text-gold font-semibold bg-gold/10 px-3 py-1 rounded-full text-sm">
                      {service.price}
                    </span>
                  </div>
                  <p className="text-[#a0a0a0] text-sm line-clamp-3 mb-4">{service.description}</p>
                  
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
