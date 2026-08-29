"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Tag } from "@/types";
import { createTag } from "@/modules/products/tag.service";

interface TagsSidebarProps {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  onError?: (msg: string) => void;
}

export default function TagsSidebar({
  tags,
  setTags,
  selectedTagIds,
  setSelectedTagIds,
  onError,
}: TagsSidebarProps) {
  const [newTagName, setNewTagName] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTagInline = async () => {
    if (!newTagName.trim()) return;
    try {
      setLoadingAdd(true);
      const slugVal = newTagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const created = await createTag({
        name: newTagName.trim(),
        slug: slugVal,
      });

      setTags((prev) => [created, ...prev]);
      setSelectedTagIds((prev) => [...prev, created.id]);
      setNewTagName("");
      setIsAddingTag(false);
    } catch (err: any) {
      if (onError) onError(err.message || "Failed to create tag");
    } finally {
      setLoadingAdd(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Product Tags</h2>

      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
        {tags.length === 0 ? (
          <p className="text-xs text-gray-400">No tags found.</p>
        ) : (
          tags.map((tag) => {
            const isChecked = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleToggleTag(tag.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                  isChecked
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {tag.name}
              </button>
            );
          })
        )}
      </div>

      {isAddingTag ? (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name..."
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateTagInline();
              }
            }}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loadingAdd}
              onClick={handleCreateTagInline}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingAdd ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingTag(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingTag(true)}
          className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> + Add new tag
        </button>
      )}
    </div>
  );
}