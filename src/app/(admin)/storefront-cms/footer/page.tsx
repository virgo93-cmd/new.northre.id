"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Globe, Mail, Phone, MapPin, Share2, Link as LinkIcon, Plus, Trash2, ListOrdered, Clock } from "lucide-react";
import { 
  getFooterSettings, 
  updateFooterSettings, 
  getAvailablePages, 
  FooterSettings, 
  FooterLink, 
  PageOption 
} from "@/modules/storefront-cms/footer.service";

export default function StorefrontFooterPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // State untuk menyimpan daftar halaman dari database untuk dropdown
  const [availablePages, setAvailablePages] = useState<PageOption[]>([]);

  const [formData, setFormData] = useState<FooterSettings>({
    description: "",
    trademark_text: "",
    operational_hours: "",
    information_links: [],
    copyright_text: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    instagram_url: "",
    tiktok_url: "",
    facebook_url: "",
    twitter_url: "",
    youtube_url: "",
  });

  async function loadData() {
    try {
      // Ambil data settings footer dan daftar halaman secara paralel
      const [settingsData, pagesData] = await Promise.all([
        getFooterSettings(),
        getAvailablePages(),
      ]);

      setFormData({
        ...settingsData,
        information_links: settingsData.information_links || [],
      });
      setAvailablePages(pagesData);
    } catch (error: unknown) {
      setErrorMsg(`Failed to load footer settings: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => void loadData());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      await updateFooterSettings(formData);
      setSuccessMsg("Footer settings saved successfully!");
    } catch (error: unknown) {
      setErrorMsg(`Failed to save footer settings: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Dynamic Links Handlers ---
  const handleAddLink = () => {
    setFormData((prev) => ({
      ...prev,
      information_links: [...(prev.information_links || []), { label: "", url: "" }],
    }));
  };

  const handleRemoveLink = (index: number) => {
    setFormData((prev) => {
      const newLinks = [...(prev.information_links || [])];
      newLinks.splice(index, 1);
      return { ...prev, information_links: newLinks };
    });
  };

  const handleUpdateLink = (index: number, field: keyof FooterLink, value: string) => {
    setFormData((prev) => {
      const newLinks = [...(prev.information_links || [])];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, information_links: newLinks };
    });
  };

  // Handler khusus saat dropdown halaman dipilih
  const handlePageSelect = (index: number, selectedSlug: string) => {
    const selectedPage = availablePages.find((p) => p.slug === selectedSlug);
    if (!selectedPage) return;

    setFormData((prev) => {
      const newLinks = [...(prev.information_links || [])];
      // Otomatis set label dari judul halaman dan URL dari slug halaman
      newLinks[index] = {
        label: selectedPage.title,
        url: `/pages/${selectedPage.slug}`,
      };
      return { ...prev, information_links: newLinks };
    });
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Footer Settings</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Configure global storefront footer content, navigation links, and contact info.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto cursor-pointer"
        >
          {saving ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <Save className="-ml-1 mr-2 h-4 w-4" />}
          Save Footer Settings
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

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Brand & About */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Globe className="h-5 w-5 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Brand & About</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Short Storefront Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="NORTHRE® is an Indonesian streetwear apparel brand..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trademark Statement (Optional)</label>
            <input
              type="text"
              value={formData.trademark_text || ""}
              onChange={(e) => setFormData({ ...formData, trademark_text: e.target.value })}
              placeholder="NORTHRE® is registered trademark and protected under Indonesian Law."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Dynamic Information Links with Page Dropdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-blue-600 shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Information Links (Navigation)</h2>
            </div>
            <button
              type="button"
              onClick={handleAddLink}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Link
            </button>
          </div>

          {(!formData.information_links || formData.information_links.length === 0) ? (
            <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No navigation links added yet. Click &quot;Add Link&quot; to create your footer menu.
            </div>
          ) : (
            <div className="space-y-3">
              {formData.information_links.map((link, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  
                  {/* Dropdown Pilih Halaman dari Database */}
                  <div className="w-full sm:w-1/3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Select from Custom Pages</label>
                    <select
                      onChange={(e) => handlePageSelect(index, e.target.value)}
                      defaultValue=""
                      className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" disabled>-- Choose saved page --</option>
                      {availablePages.map((page) => (
                        <option key={page.slug} value={page.slug}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Menu Label (Bisa diedit manual jika ingin custom) */}
                  <div className="w-full sm:flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Menu Label</label>
                    <input
                      type="text"
                      required
                      value={link.label}
                      onChange={(e) => handleUpdateLink(index, "label", e.target.value)}
                      placeholder="e.g. Size Guide"
                      className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Target URL */}
                  <div className="w-full sm:flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Target URL</label>
                    <input
                      type="text"
                      required
                      value={link.url}
                      onChange={(e) => handleUpdateLink(index, "url", e.target.value)}
                      placeholder="e.g. /pages/size-guide"
                      className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm font-mono focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-0 sm:pt-5 w-full sm:w-auto flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Remove link"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Mail className="h-5 w-5 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Contact & Support Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Support Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="northre26@gmail.com"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone / WhatsApp</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="085147356083"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Office / Store Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <textarea
                  rows={2}
                  value={formData.contact_address}
                  onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                  placeholder="Perum Puri Sumelap Indah..."
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Operational Hours</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.operational_hours || ""}
                  onChange={(e) => setFormData({ ...formData, operational_hours: e.target.value })}
                  placeholder="Mon – Sun / 08.00 – 22.00 WIB"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Channels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Share2 className="h-5 w-5 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Social Media Profiles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">TikTok URL</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={formData.tiktok_url}
                  onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Twitter / X URL</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">YouTube Channel URL</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <label className="block text-sm font-medium text-gray-700">Copyright Statement</label>
          <input
            type="text"
            value={formData.copyright_text}
            onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
            placeholder="© 2026 NORTHRE.ID"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

      </form>
    </div>
  );
}
