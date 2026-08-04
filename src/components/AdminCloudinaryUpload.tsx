"use client";

import React, { useState } from "react";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { UploadCloud, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface AdminCloudinaryUploadProps {
  documentId: string;
  collectionName: "menu" | "gallery" | "services";
  onUploadSuccess?: (secureUrl: string, publicId: string) => void;
}

export default function AdminCloudinaryUpload({
  documentId,
  collectionName,
  onUploadSuccess,
}: AdminCloudinaryUploadProps) {
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Client-Side Sync Function: update existing document in Firestore with secure Cloudinary coordinates
  const syncWithFirestore = async (secureUrl: string, publicId: string) => {
    setIsUpdatingDb(true);
    setFeedback(null);
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        imageUrl: secureUrl,
        imagePublicId: publicId,
        updatedAt: serverTimestamp(),
      });

      setFeedback({ type: "success", message: "Asset uploaded & linked to database successfully!" });
      if (onUploadSuccess) onUploadSuccess(secureUrl, publicId);
    } catch (err) {
      console.error("Firestore sync error:", err);
      setFeedback({ type: "error", message: "CDN upload succeeded, but database linkage failed." });
    } finally {
      setIsUpdatingDb(false);
    }
  };

  return (
    <div className="p-6 bg-[#151515] border border-white/10 rounded-2xl max-w-md text-white shadow-2xl">
      <div className="flex items-center gap-3 mb-2">
        <UploadCloud className="w-5 h-5 text-[#d4af37]" />
        <h4 className="font-bold tracking-wide text-sm uppercase text-white">
          Secure {collectionName} Asset Upload
        </h4>
      </div>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        Upload photography directly to the enterprise CDN. All assets are cryptographically restricted to the <code className="text-[#d4af37] bg-black/50 px-1 py-0.5 rounded">annacaterers</code> vault.
      </p>

      <CldUploadWidget
        signatureEndpoint="/api/sign-cloudinary-params"
        options={{
          folder: "annacaterers", // Must match server-side forced override exactly
          maxFiles: 1,
          clientAllowedFormats: ["webp", "png", "jpg", "jpeg"],
          maxFileSize: 10485760, // 10MB direct-stream limit
          resourceType: "image",
        }}
        onSuccess={async (result: CloudinaryUploadWidgetResults) => {
          if (result.info && typeof result.info === "object") {
            const { secure_url, public_id } = result.info;
            if (secure_url && public_id) {
              await syncWithFirestore(secure_url, public_id);
            }
          }
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            disabled={isUpdatingDb}
            className="w-full py-3.5 px-5 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:bg-[#b5952f] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-[#d4af37]/15 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingDb ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Syncing Database Record...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 shrink-0 fill-current" />
                <span>Select & Upload Image</span>
              </>
            )}
          </button>
        )}
      </CldUploadWidget>

      {feedback && (
        <div
          className={`mt-4 p-3 rounded-xl flex items-center gap-2.5 text-xs ${
            feedback.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
