"use client";

import React, { useState, useMemo } from "react";
import { Plus, CornerDownRight } from "lucide-react";
import { Category } from "@/types";
import { createCategory } from "@/modules/products/category.service";

interface TreeCategory extends Category {
  level: number;
}

interface CategoriesSidebarProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  selectedCategoryIds: string[]; // REVISI: Diubah jadi array untuk nampung banyak ID
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<string[]>>; // REVISI: Setter diubah ke array
  onError?: (msg: string) => void;
}

export default function CategoriesSidebar({
  categories,
  setCategories,
  selectedCategoryIds,
  setSelectedCategoryIds,
  onError,
}: CategoriesSidebarProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);

  // Helper membuat struktur hierarki pohon (Tree)
  const treeCategories = useMemo(() => {
    const buildTree = (
      cats: Category[],
      parent: string | null = null,
      level: number = 0
    ): TreeCategory[] => {
      let tree: TreeCategory[] = [];
      const children = cats.filter((c) => (c.parent_id || null) === parent);

      for (const child of children) {
        tree.push({ ...child, level });
        tree = tree.concat(buildTree(cats, child.id, level + 1));
      }
      return tree;
    };
    return buildTree(categories);
  }, [categories]);

  // Fungsi toggle checkbox
  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => 
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleCreateCategoryInline = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setLoadingAdd(true);
      const slugVal = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const created = await createCategory({
        name: newCategoryName.trim(),
        slug: slugVal,
      });

      setCategories((prev) => [created, ...prev]);
      setSelectedCategoryIds((prev) => [...prev, created.id]); // Langsung centang kategori baru
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (err: any) {
      if (onError) onError(err.message || "Failed to create category");
    } finally {
      setLoadingAdd(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Product Categories</h2>
        {selectedCategoryIds.length > 0 && (
          <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs font-bold">
            {selectedCategoryIds.length} Selected
          </span>
        )}
      </div>

      <div className="max-h-56 overflow-y-auto space-y-2 border border-gray-200 p-3 rounded-lg bg-gray-50">
        {treeCategories.length === 0 ? (
          <p className="text-xs text-gray-400">No categories found.</p>
        ) : (
          treeCategories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 rounded px-1.5 py-1 transition"
              style={{ paddingLeft: `${cat.level * 1.25}rem` }}
            >
              {cat.level > 0 && (
                <CornerDownRight className="h-4 w-4 text-gray-400 opacity-60 flex-shrink-0" />
              )}
              <input
                type="checkbox"
                name="product-category"
                checked={selectedCategoryIds.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="text-blue-600 focus:ring-blue-500 rounded border-gray-300 mt-0.5"
              />
              <span
                className={
                  cat.level === 0
                    ? "font-semibold text-gray-900 uppercase text-xs tracking-wider"
                    : "font-medium text-xs text-gray-700"
                }
              >
                {cat.name}
              </span>
            </label>
          ))
        )}
      </div>

      {isAddingCategory ? (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name..."
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateCategoryInline();
              }
            }}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loadingAdd}
              onClick={handleCreateCategoryInline}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingAdd ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingCategory(true)}
          className="text-xs text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> + Add new category
        </button>
      )}
    </div>
  );
}