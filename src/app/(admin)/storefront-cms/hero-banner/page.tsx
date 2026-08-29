"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit, Image as ImageIcon, X, CopyPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getHeroBanners, createMultipleHeroBanners, updateHeroBanner, deleteHeroBanner, HeroBanner } from "@/modules/storefront-cms/hero-banner.service";

export default function StorefrontHeroBannerPage() {
  const supabase = createClient();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingStatus, setUploadingStatus] = useState(false);

  // Array untuk menyimpan banyak banner yang sedang dibuat sekaligus
  const [draftBanners, setDraftBanners] = useState<HeroBanner[]>([]);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      setLoading(true);
      const data = await getHeroBanners();
      setBanners(data);
    } catch (err: any) {
      setErrorMsg("Failed to load hero banners: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Buka Modal untuk CREATE (Bisa nambah banyak)
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setDraftBanners([{
      title: "",
      subtitle: "",
      desktop_image_url: "",
      mobile_image_url: "",
      show_button: true,
      button_text: "Shop Now",
      button_link: "/products",
      sort_order: banners.length,
      is_active: true,
    }]);
    setIsModalOpen(true);
  };

  // Buka Modal untuk EDIT (Hanya edit 1 per satu)
  const handleOpenEditModal = (banner: HeroBanner) => {
    setEditingId(banner.id || null);
    setDraftBanners([{
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      desktop_image_url: banner.desktop_image_url,
      mobile_image_url: banner.mobile_image_url,
      show_button: banner.show_button ?? true,
      button_text: banner.button_text || "Shop Now",
      button_link: banner.button_link || "/products",
      sort_order: banner.sort_order ?? 0,
      is_active: banner.is_active ?? true,
    }]);
    setIsModalOpen(true);
  };

  // Tambah blok slide baru di dalam modal Create
  const handleAddAnotherSlide = () => {
    setDraftBanners((prev) => [
      ...prev,
      {
        title: "",
        subtitle: "",
        desktop_image_url: "",
        mobile_image_url: "",
        show_button: true,
        button_text: "Shop Now",
        button_link: "/products",
        sort_order: banners.length + prev.length,
        is_active: true,
      }
    ]);
  };

  // Hapus blok slide tertentu dari draft
  const handleRemoveDraftSlide = (index: number) => {
    setDraftBanners((prev) => prev.filter((_, i) => i !== index));
  };

  // Update field tertentu pada slide index tertentu
  const updateDraft = (index: number, field: keyof HeroBanner, value: any) => {
    setDraftBanners((prev) => {
      const newDrafts = [...prev];
      newDrafts[index] = { ...newDrafts[index], [field]: value };
      return newDrafts;
    });
  };

  // Upload gambar spesifik untuk slide tertentu
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile", index: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `banners/hero-${type}-${Date.now()}.${fileExt}`;

    try {
      setUploadingStatus(true);
      setErrorMsg(null);

      const { error: uploadError } = await supabase.storage
        .from("storefront")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("storefront")
        .getPublicUrl(fileName);

      if (type === "desktop") {
        updateDraft(index, "desktop_image_url", publicUrlData.publicUrl);
      } else {
        updateDraft(index, "mobile_image_url", publicUrlData.publicUrl);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to upload ${type} image: ` + err.message);
    } finally {
      setUploadingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi: Pastikan SEMUA slide yang mau disimpan punya gambar
    for (let i = 0; i < draftBanners.length; i++) {
      if (!draftBanners[i].desktop_image_url || !draftBanners[i].mobile_image_url) {
        setErrorMsg(`Slide #${i + 1} is missing Desktop or Mobile image. Both are required.`);
        return;
      }
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      if (editingId) {
        // Mode Update (Single)
        await updateHeroBanner(editingId, draftBanners[0]);
        setSuccessMsg("Hero banner updated successfully!");
      } else {
        // Mode Create (Batch / Multiple)
        await createMultipleHeroBanners(draftBanners);
        setSuccessMsg(`${draftBanners.length} hero banner(s) created successfully!`);
      }

      setIsModalOpen(false);
      loadBanners();
    } catch (err: any) {
      setErrorMsg("Failed to save hero banner: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero banner?")) return;
    try {
      setErrorMsg(null);
      await deleteHeroBanner(id);
      setSuccessMsg("Hero banner deleted successfully!");
      loadBanners();
    } catch (err: any) {
      setErrorMsg("Failed to delete banner: " + err.message);
    }
  };

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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Hero Banners Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage interactive homepage slider banners for desktop and mobile devices.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" /> Add New Banner
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

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {banners.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            No hero banners found. Click &quot;Add New Banner&quot; to start.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview Images</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title & Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{banner.sort_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="h-14 w-28 bg-gray-100 border border-gray-200 rounded overflow-hidden flex items-center justify-center">
                              <img src={banner.desktop_image_url} alt="Desktop" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-[10px] text-gray-400">Desktop</span>
                          </div>
                          <div className="text-center">
                            {/* Di tabel, kita paksa mobile icon tetap vertikal (misal lebar w-11 tinggi h-14 biar proporsional 4:5) */}
                            <div className="h-14 w-11 bg-gray-100 border border-gray-200 rounded overflow-hidden flex items-center justify-center">
                              <img src={banner.mobile_image_url} alt="Mobile" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-[10px] text-gray-400">Mobile</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{banner.title || "(No Title)"}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{banner.subtitle || "No subtitle"}</div>
                        <div className="text-[11px] mt-1">
                          {banner.show_button ?? true ? (
                            <span className="text-blue-600 font-medium">Button: {banner.button_text || "Shop Now"} ({banner.button_link || "/products"})</span>
                          ) : (
                            <span className="text-gray-400 italic">No CTA Button</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          banner.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {banner.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(banner)}
                            className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => banner.id && handleDelete(banner.id)}
                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-gray-100">
              {banners.map((banner) => (
                <div key={banner.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-flex text-[11px] font-bold text-gray-400">Order #{banner.sort_order}</span>
                      <h3 className="text-sm font-semibold text-gray-900">{banner.title || "(No Title)"}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{banner.subtitle || "No subtitle"}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${
                      banner.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {banner.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                    <span className="text-blue-600 truncate max-w-[200px] font-mono">
                      {banner.show_button ?? true ? `${banner.button_text} → ${banner.button_link}` : "No Button"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded bg-gray-50 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => banner.id && handleDelete(banner.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded bg-gray-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Form for Create (Multiple) / Edit (Single) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-4 sm:p-6 space-y-4 sm:space-y-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 sticky top-0 bg-white z-10">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {editingId ? "Edit Hero Banner" : "Add Hero Banner(s)"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer bg-gray-50 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Looping Form untuk Multiple Banners */}
              <div className="space-y-6">
                {draftBanners.map((draft, index) => (
                  <div key={index} className="p-4 sm:p-5 border border-gray-200 rounded-xl bg-gray-50/40 relative space-y-4">
                    
                    {/* Header Slide (Order & Remove) */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="text-sm font-semibold text-gray-700">Slide #{index + 1}</h3>
                      {draftBanners.length > 1 && !editingId && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftSlide(index)}
                          className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded flex items-center"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Banner Title (Optional)</label>
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) => updateDraft(index, "title", e.target.value)}
                          placeholder="e.g. Shortpants Collection"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                        <input
                          type="number"
                          value={draft.sort_order}
                          onChange={(e) => updateDraft(index, "sort_order", parseInt(e.target.value) || 0)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subtitle (Optional)</label>
                      <input
                        type="text"
                        value={draft.subtitle}
                        onChange={(e) => updateDraft(index, "subtitle", e.target.value)}
                        placeholder="e.g. Premium casual wear designed for daily comfort."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Toggle CTA Button */}
                    <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200">
                      <div>
                        <label className="text-sm font-semibold text-gray-900 block">
                          Enable CTA Button
                        </label>
                        <span className="text-xs text-gray-500">Tampilkan tombol CTA</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={draft.show_button ?? true}
                        onChange={(e) => updateDraft(index, "show_button", e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Form Input Button Text & Link */}
                    {(draft.show_button ?? true) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Button Text</label>
                          <input
                            type="text"
                            value={draft.button_text}
                            onChange={(e) => updateDraft(index, "button_text", e.target.value)}
                            placeholder="Shop Now"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Button Link URL</label>
                          <input
                            type="text"
                            value={draft.button_link}
                            onChange={(e) => updateDraft(index, "button_link", e.target.value)}
                            placeholder="/products"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Upload Images Section */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-gray-200">
                      
                      {/* Desktop Image */}
                      <div className="flex-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Desktop Image <span className="text-[10px] text-blue-600 font-normal">(Rasio 2:1 / 16:9)</span>
                        </label>
                        <div className="h-32 sm:h-40 w-full bg-white border border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center relative">
                          {draft.desktop_image_url ? (
                            <img src={draft.desktop_image_url} alt="Desktop preview" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-gray-400">No Desktop Image</span>
                          )}
                        </div>
                        <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 w-full">
                          {uploadingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2 text-gray-400" />}
                          {uploadingStatus ? "Uploading..." : "Upload Desktop"}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "desktop", index)} disabled={uploadingStatus} className="hidden" />
                        </label>
                      </div>

                      {/* Mobile Image (FIX RASIO 4:5 PORTRAIT) */}
                      <div className="shrink-0 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Mobile <span className="text-[10px] text-blue-600 font-normal">(4:5 Portrait)</span>
                        </label>
                        {/* Container dipaksa menggunakan aspect-[4/5] dan lebar terbatas (w-28 / sm:w-32) 
                          agar berbentuk portrait vertikal, mengikuti rasio HP.
                        */}
                        <div className="h-32 sm:h-40 w-28 sm:w-32 mx-auto bg-white border border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center relative aspect-[4/5]">
                          {draft.mobile_image_url ? (
                            <img src={draft.mobile_image_url} alt="Mobile preview" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-gray-400 text-center px-2">No Mobile Image</span>
                          )}
                        </div>
                        <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 w-full max-w-[8rem] mx-auto flex">
                          {uploadingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ImageIcon className="h-4 w-4 mr-1 text-gray-400" />}
                          <span className="truncate">{uploadingStatus ? "..." : "Upload"}</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "mobile", index)} disabled={uploadingStatus} className="hidden" />
                        </label>
                      </div>

                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <input
                        type="checkbox"
                        checked={draft.is_active}
                        onChange={(e) => updateDraft(index, "is_active", e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 cursor-pointer">Active on Storefront</span>
                    </div>

                  </div>
                ))}
              </div>

              {/* Button Add Another Slide (Hanya muncul jika mode CREATE) */}
              {!editingId && (
                <button
                  type="button"
                  onClick={handleAddAnotherSlide}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center cursor-pointer"
                >
                  <CopyPlus className="h-4 w-4 mr-2" /> Add Another Slide
                </button>
              )}

              {/* Submit / Cancel Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10 py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingStatus}
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                  {editingId ? "Update Banner" : `Save ${draftBanners.length} Banner(s)`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}