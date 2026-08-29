"use client";

import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FeaturedImageCardProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onError?: (msg: string) => void;
}

export default function FeaturedImageCard({
  imageUrl,
  setImageUrl,
  onError,
}: FeaturedImageCardProps) {
  const supabase = createClient();
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `feat-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    try {
      setUploadingImage(true);
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      setImageUrl(publicUrlData.publicUrl);
    } catch (err: any) {
      if (onError) onError("Failed to upload image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Featured Image</h2>
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 hover:bg-gray-100 transition">
        {imageUrl ? (
          <div className="space-y-3 w-full flex flex-col items-center">
            <div className="w-full aspect-square max-w-[240px] overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
              <img
                src={imageUrl}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="text-xs text-red-600 font-medium hover:underline"
            >
              Remove Image
            </button>
          </div>
        ) : (
          <label className="cursor-pointer space-y-2 w-full aspect-square max-w-[240px] flex flex-col items-center justify-center">
            {uploadingImage ? (
              <Loader2 className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
            ) : (
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
            )}
            <span className="block text-xs font-medium text-gray-600 px-2">
              {uploadingImage
                ? "Uploading..."
                : "Click to upload featured image (1:1)"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}