"use client";

import React from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { ProductType, ProductStatus } from "@/types";

interface GeneralInfoSectionProps {
  name: string;
  setName: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  type: ProductType;
  setType: (value: ProductType) => void;
  status: ProductStatus;
  setStatus: (value: ProductStatus) => void;
  description: string;
  setDescription: (value: string) => void;
}

export default function GeneralInfoSection({
  name,
  setName,
  slug,
  setSlug,
  type,
  setType,
  status,
  setStatus,
  description,
  setDescription,
}: GeneralInfoSectionProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-medium text-gray-900">General Information</h2>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Product Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={handleNameChange}
          placeholder="e.g. Premium Leather Jacket"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Slug URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="premium-leather-jacket"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
        />
      </div>

      {/* Product Type & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProductType)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500 font-semibold text-blue-600"
          >
            <option value="simple">Simple Product</option>
            <option value="variable">Variable Product</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="publish">Publish</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Full product description (supports Visual & HTML Code)..."
        />
      </div>
    </div>
  );
}