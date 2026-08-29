"use client";

import React, { useState } from "react";
import { Plus, Loader2, X, Move } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GalleryCardProps {
  galleryUrls: string[];
  setGalleryUrls: React.Dispatch<React.SetStateAction<string[]>>;
  onError?: (msg: string) => void;
}

export default function GalleryCard({
  galleryUrls,
  setGalleryUrls,
  onError,
}: GalleryCardProps) {
  const supabase = createClient();
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingGallery(true);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `gal-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          newUrls.push(publicUrlData.publicUrl);
        }
      }

      setGalleryUrls((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      if (onError) onError("Failed to upload gallery images: " + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setGalleryUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- HTML5 Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Wajib agar drop bisa jalan
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIndex) return;

    setGalleryUrls((prev) => {
      const newUrls = [...prev];
      const draggedItem = newUrls[draggedIdx];
      // Hapus item dari posisi lama
      newUrls.splice(draggedIdx, 1);
      // Sisipkan item ke posisi baru
      newUrls.splice(dropIndex, 0, draggedItem);
      return newUrls;
    });
    
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Product Gallery</h2>
      <p className="text-xs text-gray-500 mb-2">
        Upload multiple images. Drag and drop to reorder.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {galleryUrls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative group aspect-square w-full bg-gray-100 rounded-lg overflow-hidden border-2 transition-all cursor-move ${
              draggedIdx === index ? "border-blue-500 opacity-50" : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <img
              src={url}
              alt={`Gallery ${index}`}
              className="w-full h-full object-cover pointer-events-none"
            />
            
            {/* Indikator Drag (Muncul saat hover) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Move className="h-6 w-6 text-white" />
            </div>

            {/* Tombol Hapus */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Mencegah drag trigger
                handleRemoveGalleryImage(index);
              }}
              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-700 z-10"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <label className="flex flex-col items-center justify-center aspect-square w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
          {uploadingGallery ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          ) : (
            <Plus className="h-5 w-5 text-gray-400" />
          )}
          <span className="text-[10px] text-gray-500 mt-1">
            {uploadingGallery ? "Uploading..." : "Add Images"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            disabled={uploadingGallery}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}