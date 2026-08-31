"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, FolderTree, Loader2, Upload, CornerDownRight, Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/modules/products/category.service";
import { Category } from "@/types";

// Tambahkan properti product_count di interface ini
interface TreeCategory extends Category {
  level: number;
  product_count?: number;
}

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const loadData = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => void loadData());
  }, []);

  const treeCategories = useMemo(() => {
    const buildTree = (cats: any[], parent: string | null = null, level: number = 0): TreeCategory[] => {
      let tree: TreeCategory[] = [];
      const children = cats.filter(c => c.parent_id === parent);
      
      for (const child of children) {
        tree.push({ ...child, level });
        tree = tree.concat(buildTree(cats, child.id, level + 1));
      }
      return tree;
    };
    return buildTree(categories);
  }, [categories]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    
    // Auto-generate slug hanya jika sedang tidak dalam mode Edit
    // atau jika user sengaja menghapus slug-nya
    if (!editingId || slug === "") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split(".").pop();
    
    // Menambahkan folder 'categories/' di depannya
    const filePath = `categories/cat-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    try {
      setUploadingImage(true);
      setErrorMsg(null);

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      setImageUrl(publicUrlData.publicUrl);
    } catch (err: any) {
      setErrorMsg("Failed to upload image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setParentId("");
    setDescription("");
    setImageUrl("");
    setErrorMsg(null);
  };

  const handleEditClick = (category: any) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parent_id || "");
    setDescription(category.description || "");
    setImageUrl(category.image_url || "");
    
    // Scroll ke form secara mulus
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        parent_id: parentId ? parentId : null,
        description: description || null,
        image_url: imageUrl || null,
      };

      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }

      resetForm();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? All its subcategories will be affected.")) return;
    try {
      await deleteCategory(id);
      if (editingId === id) resetForm(); // Reset form jika yang dihapus sedang diedit
      loadData();
    } catch (err: any) {
      alert("Failed to delete category: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500">Organize your products into categories and subcategories.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Add/Edit Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
            {editingId && (
              <button 
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Electronics"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="electronics"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">None (Top Level)</option>
                {treeCategories
                  .filter(cat => cat.id !== editingId) 
                  .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"\u00A0\u00A0\u00A0".repeat(cat.level)}{cat.level > 0 ? "↳ " : ""}{cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category Image</label>
              <div className="mt-1 flex items-center gap-4">
                {imageUrl && (
                  <img src={imageUrl} alt="Category preview" className="h-12 w-12 object-cover rounded-lg border" />
                )}
                <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2 text-gray-400" />}
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Category description..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none disabled:opacity-50 ${
                  editingId ? "flex-1 bg-green-600 hover:bg-green-700" : "w-full bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                {editingId ? "Update Category" : "Add Category"}
              </button>
            </div>
          </form>
        </div>

        {/* Table List Categories */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">Loading categories...</td>
                  </tr>
                ) : treeCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      <FolderTree className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  treeCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center" 
                          style={{ paddingLeft: `${category.level * 2}rem` }}
                        >
                          {category.level > 0 && (
                            <CornerDownRight className="h-4 w-4 text-gray-400 mr-2 opacity-70" />
                          )}
                          
                          <div className="h-9 w-9 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                            {category.image_url ? (
                              <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
                            ) : (
                              <FolderTree className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm ${category.level === 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.parent?.name ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {category.parent.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      {/* Kolom Baru: Jumlah Products */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {category.product_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => handleEditClick(category)} 
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit Category"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(category.id)} 
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
