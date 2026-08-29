"use client";

import { useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  navLinks?: any[];
  products?: any[]; // Tambahkan props products opsional untuk menghitung jumlah item
}

export function NavigationDrawer({ isOpen, onClose, categories = [], navLinks = [], products = [] }: NavigationDrawerProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Filter Kategori Utama (Parent)
  const parentCategories = categories.filter(
    (cat) => !cat.parent_id || cat.parent_id === 0 || cat.parent === null
  );

  // Pisahkan navLinks dari database: Parent dan Child
  const parentNavs = navLinks.filter((nav) => !nav.parent_id);

  const toggleDropdown = (id: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 transition-opacity backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 left-0 flex max-w-full pr-10">
        <div className="w-screen max-w-md bg-[#111] text-white shadow-2xl flex flex-col justify-between border-r border-[#222]">
          
          <div className="overflow-y-auto flex-1">
            <div className="flex items-center justify-start p-6 border-b border-[#222]">
              <button type="button" onClick={onClose} aria-label="Close Menu" className="p-1 text-white transition-opacity hover:opacity-70 focus:outline-none">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="px-6 py-6 space-y-6 text-[15px] font-medium uppercase tracking-wider">
              
              {/* 1. Menu Navigasi Dinamis dari CMS */}
              {parentNavs.map((parent) => {
                const childNavs = navLinks.filter((nav) => nav.parent_id === parent.id);
                const hasChildren = childNavs.length > 0;
                const isOpenMenu = openDropdowns[parent.id!] || false;

                if (hasChildren) {
                  return (
                    <div key={parent.id} className="border-b border-[#222] pb-6">
                      <button 
                        type="button" 
                        onClick={() => toggleDropdown(parent.id!)} 
                        className="flex w-full items-center justify-between text-white hover:text-neutral-400 transition-colors"
                      >
                        <span>{parent.label}</span>
                        <span className="text-xl font-light">{isOpenMenu ? "−" : "+"}</span>
                      </button>
                      
                      {isOpenMenu && (
                        <div className="mt-4 pl-4 space-y-3 text-[13px] text-[#aaa]">
                          {childNavs.map((child) => (
                            <div key={child.id}>
                              <Link 
                                href={child.url || "#"} 
                                onClick={onClose} 
                                className="block text-[#aaa] hover:text-white transition-colors"
                              >
                                {child.label}
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={parent.id} className="border-b border-[#222] pb-6">
                    <Link 
                      href={parent.url || "#"} 
                      onClick={onClose} 
                      className="block text-white hover:text-neutral-400 transition-colors"
                    >
                      {parent.label}
                    </Link>
                  </div>
                );
              })}

              {/* 2. Menu CATEGORIES (Lengkap dengan Penghitung Jumlah Produk) */}
              <div className="border-b border-[#222] pb-6">
                <button 
                  type="button" 
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)} 
                  className="flex w-full items-center justify-between text-white hover:text-neutral-400 transition-colors"
                >
                  <span>CATEGORIES</span>
                  <span className="text-xl font-light">{isCategoriesOpen ? "−" : "+"}</span>
                </button>
                
                {isCategoriesOpen && (
                  <div className="mt-4 pl-2 space-y-6 text-[13px] text-[#aaa]">
                    {parentCategories.map((parent) => {
                      const childCategories = categories.filter(
                        (cat) => cat.parent_id === parent.id || cat.parent?.id === parent.id
                      );

                      if (childCategories.length === 0) return null;

                      return (
                        <div key={parent.id || parent.slug}>
                          <h4 className="text-white font-bold mb-3 tracking-wider text-xs px-2 text-neutral-400 uppercase">
                            {parent.name}
                          </h4>
                          <div className="space-y-3">
                            {childCategories.map((child) => {
                              const imageUrl = child.image_url || child.image || "";
                              const imageAlt = child.name;

                              // Hitung jumlah produk yang masuk ke kategori ini secara dinamis
                              const productCount = products.filter((product: any) => {
                                const matchCategory = product.category_id === child.id || product.category?.id === child.id;
                                const matchSlug = product.category?.slug === child.slug || product.category_slug === child.slug;
                                const matchArray = product.all_categories?.some((c: any) => c.id === child.id || c.slug === child.slug);
                                return matchCategory || matchSlug || matchArray;
                              }).length;

                              return (
                                <Link 
                                  key={child.id || child.slug}
                                  href={`/category/${child.slug}`} 
                                  onClick={onClose} 
                                  className="flex items-center justify-between p-2 rounded hover:bg-neutral-900 transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8 bg-neutral-800 shrink-0 overflow-hidden rounded">
                                      {imageUrl ? (
                                        <img 
                                          src={imageUrl} 
                                          alt={imageAlt} 
                                          className="h-full w-full object-cover object-center" 
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center h-full w-full text-neutral-600">
                                          <Package className="w-4 h-4" />
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-white group-hover:text-neutral-300 font-medium capitalize">
                                      {child.name}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-neutral-500 font-mono">
                                    ({productCount})
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </nav>
          </div>

          <div className="p-6 border-t border-[#222] flex items-center gap-6 text-neutral-400 shrink-0">
            <span className="text-xs tracking-widest text-neutral-500 uppercase">NORTHRE® 2026</span>
          </div>

        </div>
      </div>
    </div>
  );
}