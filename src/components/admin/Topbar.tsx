"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadUserAvatar } from "@/modules/users/avatar";
import EditProfileModal from "./EditProfileModal";
import { Search, LogOut, Camera, Loader2, Settings, Package, Receipt, Users, ChevronRight, LayoutDashboard } from "lucide-react";
import { Profile } from "@/types";
// Import konfigurasi menu dari constants yang sama dengan Sidebar
import { ADMIN_NAV_CONFIG } from "@/lib/constants";

export default function Topbar() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Global Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    menus: { title: string; href: string; parent?: string }[];
    products: any[];
    orders: any[];
    users: any[];
  }>({ menus: [], products: [], orders: [], users: [] });

  // 1. Fetch Profile
  useEffect(() => {
    async function loadAdminProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) setProfile(data as Profile);
      }
    }
    loadAdminProfile();
  }, [supabase]);

  // 2. Keyboard Shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 3. Click Outside untuk menutup Dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Debounced Search Effect (Mencari Menu Lokal & 3 Tabel Supabase)
  useEffect(() => {
    const fetchSearchResults = async () => {
      const rawQuery = searchQuery.trim();
      if (rawQuery.length < 2) {
        setSearchResults({ menus: [], products: [], orders: [], users: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      const queryLower = rawQuery.toLowerCase();
      const supabaseQuery = `%${rawQuery}%`;

      try {
        // --- A. Pencarian Data Menu Lokal (dari ADMIN_NAV_CONFIG) ---
        const matchedMenus: { title: string; href: string; parent?: string }[] = [];
        ADMIN_NAV_CONFIG.forEach(section => {
          section.items.forEach(item => {
            // Cek Parent Menu
            if (item.title.toLowerCase().includes(queryLower) && item.href) {
              matchedMenus.push({ title: item.title, href: item.href });
            }
            // Cek Child Menu
            if (item.children) {
              item.children.forEach(child => {
                if (child.title.toLowerCase().includes(queryLower)) {
                  matchedMenus.push({ title: child.title, href: child.href, parent: item.title });
                }
              });
            }
          });
        });

        // --- B. Pencarian Data Database (Supabase) ---
        const [prodRes, orderRes, userRes] = await Promise.all([
          supabase.from("products").select("id, name, sku, image_url").or(`name.ilike.${supabaseQuery},sku.ilike.${supabaseQuery}`).limit(4),
          supabase.from("orders").select("id, order_number, customer_name").or(`order_number.ilike.${supabaseQuery},customer_name.ilike.${supabaseQuery}`).limit(4),
          supabase.from("profiles").select("id, full_name, email").or(`full_name.ilike.${supabaseQuery},email.ilike.${supabaseQuery}`).limit(4)
        ]);

        setSearchResults({
          menus: matchedMenus.slice(0, 4), // Batasi 4 menu agar dropdown tidak kepanjangan
          products: prodRes.data || [],
          orders: orderRes.data || [],
          users: userRes.data || [],
        });
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const delay = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, supabase]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploading(true);
    const { url, error } = await uploadUserAvatar(profile.id, file);
    if (error) alert(`Failed to upload avatar: ${error}`);
    else if (url) setProfile((prev) => (prev ? { ...prev, avatar_url: url } : null));
    setIsUploading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const getInitials = () => {
    if (profile?.first_name) return profile.first_name.charAt(0).toUpperCase();
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (profile?.email) return profile.email.charAt(0).toUpperCase();
    return "A";
  };

  const displayName = profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.full_name || profile?.email?.split("@")[0] || "Admin";

  const totalResults = searchResults.menus.length + searchResults.products.length + searchResults.orders.length + searchResults.users.length;

  return (
    <>
      <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between gap-4 relative z-40">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-neutral-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 2) setShowDropdown(true);
              }}
              onFocus={() => {
                if (searchQuery.length >= 2) setShowDropdown(true);
              }}
              placeholder="Search menu, products, orders, users..."
              className="w-full pl-9 pr-12 py-2 bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {isSearching ? (
              <Loader2 size={14} className="absolute right-3 text-blue-500 animate-spin" />
            ) : (
              <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white border border-neutral-200 rounded shadow-sm pointer-events-none hidden sm:block">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showDropdown && searchQuery.length >= 2 && (
            <div className="absolute top-full mt-2 w-full max-w-xl bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="overflow-y-auto p-2">
                {totalResults === 0 && !isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No results found for <span className="font-semibold text-gray-900">"{searchQuery}"</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    
                    {/* Menus Result */}
                    {searchResults.menus.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <LayoutDashboard size={14} /> Navigation
                        </div>
                        <ul className="space-y-1">
                          {searchResults.menus.map((m, idx) => (
                            <li key={idx}>
                              <Link 
                                href={m.href}
                                onClick={() => {
                                  setShowDropdown(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg group transition-colors"
                              >
                                <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center border border-slate-200 shrink-0">
                                  <LayoutDashboard size={16} className="text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">{m.title}</div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {m.parent ? `Menu > ${m.parent} > ${m.title}` : `Menu > ${m.title}`}
                                  </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Products Result */}
                    {searchResults.products.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Package size={14} /> Products
                        </div>
                        <ul className="space-y-1">
                          {searchResults.products.map(p => (
                            <li key={p.id}>
                              <Link 
                                href={`/products/${p.id}/edit`}
                                onClick={() => {
                                  setShowDropdown(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg group transition-colors"
                              >
                                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                  {p.image_url ? <Image src={p.image_url} alt={p.name} width={40} height={40} className="object-cover" /> : <Package size={16} className="text-gray-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">{p.name}</div>
                                  <div className="text-xs text-gray-500 truncate">{p.sku || "No SKU"}</div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Orders Result */}
                    {searchResults.orders.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Receipt size={14} /> Orders
                        </div>
                        <ul className="space-y-1">
                          {searchResults.orders.map(o => (
                            <li key={o.id}>
                              <Link 
                                href={`/orders/${o.id}`}
                                onClick={() => {
                                  setShowDropdown(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg group transition-colors"
                              >
                                <div className="h-10 w-10 bg-amber-50 rounded flex items-center justify-center border border-amber-100 shrink-0">
                                  <Receipt size={16} className="text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">{o.order_number}</div>
                                  <div className="text-xs text-gray-500 truncate">Customer: {o.customer_name}</div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Users Result */}
                    {searchResults.users.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Users size={14} /> Users
                        </div>
                        <ul className="space-y-1">
                          {searchResults.users.map(u => (
                            <li key={u.id}>
                              <Link 
                                href={`/users/${u.id}`}
                                onClick={() => {
                                  setShowDropdown(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg group transition-colors"
                              >
                                <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100 shrink-0">
                                  <Users size={16} className="text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">{u.full_name || "Unknown"}</div>
                                  <div className="text-xs text-gray-500 truncate">{u.email}</div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
              
              {/* Footer Search */}
              {totalResults > 0 && (
                <div className="bg-gray-50 border-t border-gray-100 p-2 text-center">
                  <span className="text-xs text-gray-500">Showing top results across your store</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: [ADMIN] | [AVATAR] | [NAME & EMAIL] | [SETTINGS] | [LOGOUT] */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 pl-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
              {profile?.role || "ADMIN"}
            </span>

            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              title="Click to change profile picture"
              className="relative h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs border border-neutral-200 overflow-hidden shrink-0 cursor-pointer group"
            >
              {isUploading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  fill
                  sizes="36px"
                  className="object-cover group-hover:opacity-40 transition-opacity"
                />
              ) : (
                <span className="group-hover:opacity-20 transition-opacity">
                  {getInitials()}
                </span>
              )}

              {!isUploading && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                  <Camera size={14} className="text-white" />
                </div>
              )}
            </div>

            <div className="hidden sm:flex flex-col ml-0.5">
              <span className="text-xs font-bold text-neutral-900 leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] text-neutral-400 leading-tight">
                {profile?.email || "admin@northre.id"}
              </span>
            </div>

            {profile && (
              <button
                onClick={() => setIsModalOpen(true)}
                title="Edit profile details"
                className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer ml-1"
              >
                <Settings size={18} />
              </button>
            )}
          </div>

          <div className="h-5 w-[1px] bg-neutral-200 hidden sm:block" />

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50/80 rounded-md transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {profile && (
        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          profile={profile}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}
    </>
  );
}