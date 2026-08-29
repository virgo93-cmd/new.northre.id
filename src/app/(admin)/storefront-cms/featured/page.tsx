"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Star, X, Search, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getFeaturedProducts, addMultipleFeaturedProducts, updateFeaturedSortOrder, removeFeaturedProduct, FeaturedProduct } from "@/modules/storefront-cms/featured.service";

export default function StorefrontFeaturedPage() {
  const supabase = createClient();
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State untuk Pilih Banyak Produk (Multi-Select)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    loadFeatured();
  }, []);

  async function loadFeatured() {
    try {
      setLoading(true);
      const data = await getFeaturedProducts();
      setFeatured(data);
    } catch (err: any) {
      setErrorMsg("Failed to load featured products: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openAddModal() {
    setIsModalOpen(true);
    setSelectedProductIds([]);
    setSearchQuery("");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, regular_price, sale_price, gallery_images, image_url")
        .order("name", { ascending: true });

      if (error) throw error;
      setAllProducts(data || []);
    } catch (err: any) {
      setErrorMsg("Failed to load products list: " + err.message);
    }
  }

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) {
      setErrorMsg("Please select at least one product to feature.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      // Hitung urutan sort_order berikutnya secara berurutan
      let baseSortOrder = featured.length > 0 ? Math.max(...featured.map(f => f.sort_order)) + 1 : 0;
      
      const payloads = selectedProductIds.map((prodId, index) => ({
        product_id: prodId,
        sort_order: baseSortOrder + index,
      }));

      await addMultipleFeaturedProducts(payloads);
      setSuccessMsg(`${selectedProductIds.length} product(s) added to featured list successfully!`);
      setIsModalOpen(false);
      loadFeatured();
    } catch (err: any) {
      setErrorMsg("Failed to add featured products: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product from featured?")) return;
    try {
      setErrorMsg(null);
      await removeFeaturedProduct(id);
      setSuccessMsg("Featured product removed successfully!");
      loadFeatured();
    } catch (err: any) {
      setErrorMsg("Failed to remove product: " + err.message);
    }
  };

  const handleUpdateSortOrder = async (id: string, newOrder: number) => {
    try {
      await updateFeaturedSortOrder(id, newOrder);
      loadFeatured();
    } catch (err: any) {
      setErrorMsg("Failed to update sort order: " + err.message);
    }
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Featured Products</h1>
          <p className="text-xs sm:text-sm text-gray-500">Curate and manage highlighted products displayed on your storefront homepage.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" /> Add Featured Products
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {featured.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            <Star className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            No featured products selected yet. Click &quot;Add Featured Products&quot; to begin.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {featured.map((item) => {
                    const prod = item.product;
                    const imageUrl = prod?.images && prod.images.length > 0 ? prod.images[0] : null;
                    const displayPrice = prod?.regular_price ?? 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <input
                            type="number"
                            value={item.sort_order}
                            onChange={(e) => item.id && handleUpdateSortOrder(item.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                              {imageUrl ? (
                                <img src={imageUrl} alt={prod?.name} className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{prod?.name || "Deleted Product"}</div>
                              <div className="text-xs text-gray-500">Slug: {prod?.slug || "-"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rp {displayPrice.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => item.id && handleRemove(item.id)}
                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-gray-100">
              {featured.map((item) => {
                const prod = item.product;
                const imageUrl = prod?.images && prod.images.length > 0 ? prod.images[0] : null;
                const displayPrice = prod?.regular_price ?? 0;

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                        {imageUrl ? (
                          <img src={imageUrl} alt={prod?.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{prod?.name || "Deleted Product"}</div>
                        <div className="text-xs text-blue-600 font-medium mt-0.5">
                          Rp {displayPrice.toLocaleString("id-ID")}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate">Slug: {prod?.slug || "-"}</div>
                      </div>
                      <button
                        onClick={() => item.id && handleRemove(item.id)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-500">
                      <span className="font-medium">Sort Order:</span>
                      <input
                        type="number"
                        value={item.sort_order}
                        onChange={(e) => item.id && handleUpdateSortOrder(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal Picker (Multi-Select dengan Checkbox) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Select Products to Feature</h2>
                <p className="text-xs text-gray-500">Selected: {selectedProductIds.length} product(s)</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer bg-gray-50 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded-lg min-h-[160px] max-h-[300px]">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">No products found.</div>
                ) : (
                  filteredProducts.map((prod) => {
                    const isSelected = selectedProductIds.includes(prod.id);
                    const prodImages = prod.gallery_images || (prod.image_url ? [prod.image_url] : []);
                    const prodPrice = prod.regular_price ?? 0;

                    return (
                      <div
                        key={prod.id}
                        onClick={() => toggleSelectProduct(prod.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                          isSelected ? "bg-blue-50 border border-blue-300" : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center shrink-0">
                            {prodImages[0] ? (
                              <img src={prodImages[0]} alt={prod.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div className="truncate">
                            <div className="text-sm font-medium text-gray-900 truncate">{prod.name}</div>
                            <div className="text-xs text-gray-500">Rp {prodPrice.toLocaleString("id-ID")}</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(prod.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shrink-0 cursor-pointer"
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex-1 sm:flex-initial cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || selectedProductIds.length === 0}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex-1 sm:flex-initial cursor-pointer"
                >
                  {saving && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                  Add {selectedProductIds.length > 0 ? `(${selectedProductIds.length})` : ""} to Featured
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}