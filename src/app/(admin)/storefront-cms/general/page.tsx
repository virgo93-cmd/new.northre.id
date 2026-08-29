"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, Save, Building, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getStoreSettings, updateStoreSettings, StoreSettings } from "@/modules/storefront-cms/general.service";

export default function StorefrontGeneralPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<StoreSettings & { favicon_url?: string }>({
    site_name: "",
    site_tagline: "",
    support_email: "",
    support_phone: "",
    logo_url: "",
    favicon_url: "",
    address: "",
    slider_delay_ms: 5000, // <-- Default 5 detik
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await getStoreSettings();
        if (data) {
          setFormData({
            site_name: data.site_name || "",
            site_tagline: data.site_tagline || "",
            support_email: data.support_email || "",
            support_phone: data.support_phone || "",
            logo_url: data.logo_url || "",
            favicon_url: (data as any).favicon_url || "",
            address: data.address || "",
            slider_delay_ms: data.slider_delay_ms || 5000, // <-- Render data
          });
        }
      } catch (err: any) {
        setErrorMsg("Failed to load store settings: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Upload Logo Toko (470 x 170 px)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `brand/logo-${Date.now()}.${fileExt}`;

    try {
      setUploadingLogo(true);
      setErrorMsg(null);

      const { error: uploadError } = await supabase.storage
        .from("storefront")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("storefront")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, logo_url: publicUrlData.publicUrl }));
    } catch (err: any) {
      setErrorMsg("Failed to upload logo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload Favicon (512 x 512 px)
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `brand/favicon-${Date.now()}.${fileExt}`;

    try {
      setUploadingFavicon(true);
      setErrorMsg(null);

      const { error: uploadError } = await supabase.storage
        .from("storefront")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("storefront")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, favicon_url: publicUrlData.publicUrl }));
    } catch (err: any) {
      setErrorMsg("Failed to upload favicon: " + err.message);
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      await updateStoreSettings(formData);
      setSuccessMsg("Store settings updated successfully!");
    } catch (err: any) {
      setErrorMsg("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
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
    <form onSubmit={handleSubmit} className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">General Storefront Settings</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage your store identity, contact info, and branding assets.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 w-full sm:w-auto cursor-pointer"
        >
          {saving ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <Save className="-ml-1 mr-2 h-4 w-4" />}
          Save Changes
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

      {/* Main Form Sections */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600 shrink-0" /> Store Identity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Store Name</label>
            <input
              type="text"
              required
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              placeholder="e.g. NORTHRE®"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Store Tagline / Slogan</label>
            <input
              type="text"
              value={formData.site_tagline}
              onChange={(e) => setFormData({ ...formData, site_tagline: e.target.value })}
              placeholder="e.g. Official Online Store"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Branding Assets: Logo & Favicon Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Store Logo Section (470 x 170) */}
          <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-800">Store Main Logo</label>
              <p className="text-[11px] text-gray-500 mt-0.5">Recommended dimension: <span className="font-semibold text-gray-700">470 x 170 px</span> (PNG, WEBP, or SVG)</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative h-20 w-48 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center p-2 shrink-0 shadow-2xs">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Store Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400 font-medium">No Logo (470x170)</span>
                )}
              </div>

              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center justify-center px-3.5 py-2 border border-gray-300 shadow-2xs text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2 text-gray-400" />}
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
                {formData.logo_url && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logo_url: "" })}
                    className="block text-xs text-red-600 hover:underline text-center sm:text-left cursor-pointer"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Favicon Section (512 x 512) */}
          <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-800">Store Favicon / App Icon</label>
              <p className="text-[11px] text-gray-500 mt-0.5">Recommended dimension: <span className="font-semibold text-gray-700">512 x 512 px</span> (PNG, ICO, or WEBP)</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative h-20 w-20 bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center p-2 shrink-0 shadow-2xs">
                {formData.favicon_url ? (
                  <img src={formData.favicon_url} alt="Store Favicon" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[11px] text-gray-400 font-medium text-center">No Icon (512x512)</span>
                )}
              </div>

              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center justify-center px-3.5 py-2 border border-gray-300 shadow-2xs text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto">
                  {uploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2 text-gray-400" />}
                  {uploadingFavicon ? "Uploading..." : "Upload Favicon"}
                  <input
                    type="file"
                    accept="image/png, image/x-icon, image/jpeg, image/webp"
                    onChange={handleFaviconUpload}
                    disabled={uploadingFavicon}
                    className="hidden"
                  />
                </label>
                {formData.favicon_url && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, favicon_url: "" })}
                    className="block text-xs text-red-600 hover:underline text-center sm:text-left cursor-pointer"
                  >
                    Remove Favicon
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Business Info */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600 shrink-0" /> Contact & Support Info
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Support Email</label>
            <input
              type="email"
              value={formData.support_email}
              onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
              placeholder="support@northre.id"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Support Phone / WhatsApp</label>
            <input
              type="text"
              value={formData.support_phone}
              onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
              placeholder="+62 812-3456-7890"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Business Address</label>
          <textarea
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Jl. HZ. Mustofa, Tasikmalaya, Jawa Barat"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* NEW: Storefront Preferences (Slider Delay, dll) */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 shrink-0" /> Storefront Preferences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hero Slider Autoplay Delay (ms)</label>
            <input
              type="number"
              min="1000"
              step="500"
              value={formData.slider_delay_ms}
              onChange={(e) => setFormData({ ...formData, slider_delay_ms: parseInt(e.target.value) || 5000 })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-gray-500 mt-1.5">
              Waktu jeda antar slide (1000 ms = 1 detik). Rekomendasi: <strong>3000</strong> - <strong>5000</strong> ms.
            </p>
          </div>
        </div>
      </div>

    </form>
  );
}