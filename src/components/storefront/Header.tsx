"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { NavigationDrawer } from "./NavigationDrawer";
import { Search, X, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
// 1. Import client Supabase lu
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  logoUrl?: string;
  siteName?: string;
  categories?: any[];
  navItems?: any[];
  products?: any[];
}

export default function Header({ logoUrl, siteName, categories = [], navItems = [], products = [] }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { cart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  
  // 2. State untuk menyimpan data user
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);

    // 3. Tarik data sesi user saat komponen dimuat
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // 4. Pantau perubahan status (jika tiba-tiba login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  const displayLogo = logoUrl || "/northre_logo.png";
  const altText = siteName || "NORTHRE®";

  const headerNavLinks = navItems.filter(
    (item) => item.is_active && (item.location === "header" || item.location === "Header Nav")
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products.filter((p: any) => 
      p.name?.toLowerCase().includes(query) || 
      p.description?.toLowerCase().includes(query) ||
      p.category?.name?.toLowerCase().includes(query)
    );
  }, [searchQuery, products]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200">
        <div className="relative w-full px-4 md:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center z-10">
            <button 
              type="button" 
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Menu"
              className="p-1 -ml-1 text-black hover:opacity-70 transition-opacity cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto">
            <Link href="/" className="relative block h-11 w-52 md:h-13 md:w-56">
              <img
                src={displayLogo}
                alt={altText}
                className="w-full h-full object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 z-10">
            <button 
              type="button" 
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search" 
              className="p-1.5 text-black hover:opacity-70 transition-opacity cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link href="/cart" aria-label="Cart" className="relative p-1.5 text-black hover:opacity-70 transition-opacity">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {isMounted && totalCartItems > 0 && (
                <span className="absolute top-0 right-0 flex h-[15px] w-[15px] -translate-y-0.5 translate-x-0.5 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* 5. LOGIKA RENDER TOMBOL LOGIN / PROFIL */}
            {isMounted && user ? (
              <Link href="/dashboard" aria-label="Dashboard" className="relative p-1.5 text-black hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {/* Indikator titik hijau bahwa user SUDAH LOGIN */}
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
              </Link>
            ) : (
              <Link href="/login" aria-label="Account" className="p-1.5 text-black hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>

        </div>
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col pt-16 px-4 md:px-20 animate-in fade-in duration-200">
          <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            
            <div className="flex items-center px-6 py-4 border-b border-gray-200 gap-3">
              <Search className="w-6 h-6 text-neutral-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, category, or description..."
                className="w-full text-lg outline-none text-neutral-900 placeholder:text-neutral-400 bg-transparent font-medium"
              />
              <button 
                type="button" 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 md:p-6 space-y-3 flex-1 bg-neutral-50">
              {searchQuery.trim() === "" ? (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  Type something to search products across the store...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-sm">
                  No products found matching &quot;<span className="font-semibold text-neutral-800">{searchQuery}</span>&quot;.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {searchResults.map((product: any) => {
                    const imgUrl = product.image_url || product.images?.[0] || "";
                    
                    const regularPrice = Number(
                      product.price ?? 
                      product.base_price ?? 
                      product.regular_price ?? 
                      product.variants?.[0]?.price ?? 
                      0
                    );

                    const salePrice = Number(
                      product.sale_price ?? 
                      product.discount_price ?? 
                      product.variants?.[0]?.sale_price ?? 
                      0
                    );

                    const hasDiscount = salePrice > 0 && salePrice < regularPrice;

                    return (
                      <Link
                        key={product.id || product.slug}
                        href={`/products/${product.slug}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                        className="flex items-center gap-4 p-3 bg-white rounded-xl border border-neutral-200 hover:border-black transition-all group"
                      >
                        <div className="relative w-14 h-14 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                          {imgUrl ? (
                            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-neutral-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-neutral-900 truncate group-hover:text-black">
                            {product.name}
                          </h4>
                          <p className="text-xs text-neutral-500 capitalize mt-0.5">
                            {product.category?.name || "General"}
                          </p>
                        </div>
                        
                        <div className="text-right shrink-0">
                          {hasDiscount ? (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-neutral-400 line-through font-mono">
                                Rp {regularPrice.toLocaleString("id-ID")}
                              </span>
                              <span className="text-sm font-mono font-bold text-red-600">
                                Rp {salePrice.toLocaleString("id-ID")}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm font-mono font-semibold text-neutral-900">
                              Rp {regularPrice.toLocaleString("id-ID")}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-white border-t border-neutral-200 text-right text-xs text-neutral-400">
              Found {searchResults.length} results
            </div>

          </div>
        </div>
      )}

      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
        navLinks={headerNavLinks}
        products={products}
      />
    </>
  );
}