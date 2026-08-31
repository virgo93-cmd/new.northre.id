"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext"; // 1. Hook diaktifkan
import type { Json } from "../../../types/database.types";

interface DetailVariant {
  attributes: Json;
  regular_price: number;
  sale_price: number | null;
}

function getStringAttributes(value: Json): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  gallery_images?: Json | null;
  regular_price: number;
  sale_price: number | null;
  variants?: DetailVariant[];
}

// Format Rupiah
function toRp(num: number): string {
  if (!num || isNaN(num)) return "";
  return "RP " + num.toLocaleString("id-ID");
}

export default function ProductDetailView({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { addToCart } = useCart(); // 2. Fungsi addToCart dipanggil
  const [isAdded, setIsAdded] = useState(false);

  // 1. MAPPING GAMBAR
  const primaryImg = product.image_url;
  const galleryImgs = Array.isArray(product.gallery_images)
    ? product.gallery_images.filter((image): image is string => typeof image === "string")
    : [];
  const allImages = [...(primaryImg ? [primaryImg] : []), ...galleryImgs];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk geser ke gambar tertentu saat thumbnail diklik
  const scrollToImage = (index: number) => {
    setCurrentIndex(index);
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: width * index,
        behavior: "smooth",
      });
    }
  };

  // 2. EKSTRAK & PISAHKAN ATRIBUT (Color & Size)
  const variations = product.variants || [];
  const extractedAttributes: Record<string, Set<string>> = {
    Color: new Set(),
    Size: new Set(),
  };
  
  variations.forEach((v) => {
    const variantAttributes = getStringAttributes(v.attributes);
    if (Object.keys(variantAttributes).length > 0) {
      Object.entries(variantAttributes).forEach(([key, val]) => {
        const rawVal = String(val).trim();
        if (key.toLowerCase() === "combination" || rawVal.includes("-")) {
          const parts = rawVal.split("-").map(p => p.trim());
          if (parts.length >= 2) {
            extractedAttributes.Color.add(parts[0].toUpperCase());
            extractedAttributes.Size.add(parts[parts.length - 1].toUpperCase());
          } else {
            extractedAttributes.Color.add(rawVal.toUpperCase());
          }
        } else {
          const attrKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
          if (!extractedAttributes[attrKey]) {
            extractedAttributes[attrKey] = new Set();
          }
          extractedAttributes[attrKey].add(rawVal.toUpperCase());
        }
      });
    }
  });

  const attributes = Object.keys(extractedAttributes)
    .map(key => ({
      name: key,
      options: Array.from(extractedAttributes[key]),
    }))
    .filter(attr => attr.options.length > 0);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    attributes.forEach((attr) => {
      if (attr.options && attr.options.length > 0) {
        initial[attr.name] = attr.options[0];
      }
    });
    return initial;
  });

  // Logika Harga Berdasarkan Varian
  const matchedVariation = variations.find((variation) => {
    const variantAttributes = getStringAttributes(variation.attributes);
    if (Object.keys(variantAttributes).length === 0) return false;
    const varValues = Object.values(variantAttributes).map(v => v.toUpperCase());
    return Object.values(selectedAttributes).every(selectedOpt => 
      varValues.some(val => val.includes(selectedOpt))
    );
  });

  const activeRegularPrice = matchedVariation?.regular_price || product.regular_price || 0;
  const activeSalePrice = matchedVariation?.sale_price || product.sale_price || 0;
  const hasDiscount = activeSalePrice > 0 && activeRegularPrice > activeSalePrice;

  const handleSelectAttribute = (attrName: string, option: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: option,
    }));
  };

  const handleAddToCart = () => {
    // 3. Susun data produk yang akan dimasukkan ke keranjang
    const cartItem = {
      id: product.id || product.slug || Date.now().toString(), 
      slug: product.slug,
      name: product.name,
      // FIX: Pastikan Harga Diskon (kalau ada) dan Harga Normal (sebagai referensi coret) terkirim
      price: hasDiscount ? activeSalePrice : activeRegularPrice, 
      regular_price: activeRegularPrice, 
      quantity: quantity,
      image: primaryImg ?? undefined,
      selectedAttributes: selectedAttributes,
    };

    addToCart(cartItem); // 4. Eksekusi penambahan ke keranjang
    setIsAdded(true);
    
    setTimeout(() => {
      router.push("/cart");
    }, 1200);
  };

  return (
    <>
      {/* Modal Sukses */}
      {isAdded && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-2xl animate-bounce">
            <svg className="h-16 w-16 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold uppercase tracking-widest text-black">
              SUCCESS!
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-neutral-500">
              Redirecting to cart...
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-20 relative">
        
        {/* Kolom Kiri: Galeri Foto Utama dengan Swipe Nyata */}
        <div className="flex flex-col items-center">
          
          {/* Container Slider Utama */}
          <div className="relative aspect-square w-full max-w-[540px] overflow-hidden bg-[#f4f4f4]">
            <div 
              ref={scrollContainerRef}
              className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-none cursor-grab active:cursor-grabbing"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch' 
              }}
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                const newIndex = Math.round(scrollLeft / width);
                if (newIndex !== currentIndex && !isNaN(newIndex)) {
                  setCurrentIndex(newIndex);
                }
              }}
            >
              {allImages.map((img: string, idx: number) => (
                <div key={idx} className="relative h-full w-full shrink-0 grow-0 snap-center snap-always">
                  <img
                    src={img}
                    alt={`${product.name} - foto ${idx + 1}`}
                    className="h-full w-full object-cover object-center select-none"
                  />
                </div>
              ))}
            </div>

            {/* Indikator Titik (Dots) di bawah gambar */}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5 pointer-events-none">
                {allImages.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      currentIndex === idx ? "w-6 bg-black" : "w-1.5 bg-black/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail / Galeri Gambar di Bawah */}
          {allImages.length > 1 && (
            <div className="mt-4 flex w-full max-w-[540px] items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, idx) => {
                const isSelected = currentIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToImage(idx)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden border bg-[#f4f4f4] transition-all sm:h-16 sm:w-16 ${
                      isSelected ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="64px" className="object-cover object-center" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Detail & Order Info */}
        <div className="flex flex-col text-left">
          <h1 className="text-base sm:text-lg font-bold tracking-[0.2em] text-[#111] uppercase">
            {product.name}
          </h1>

          {/* Harga Dinamis */}
          <div className="mt-3 flex justify-start gap-1.5 font-sans text-sm sm:text-base font-normal tracking-[0.08em]">
            {hasDiscount ? (
              <>
                <span className="text-[#6fa832] font-semibold">{toRp(activeSalePrice)}</span>
                <span className="text-[#9ca3af] line-through">{toRp(activeRegularPrice)}</span>
              </>
            ) : (
              <span className="text-[#6fa832] font-semibold">{toRp(activeRegularPrice)}</span>
            )}
          </div>

          {/* Pemilihan Atribut Terpisah (Color & Size) */}
          {attributes.length > 0 && (
            <div className="mt-6 flex flex-col space-y-4 border-t border-neutral-100 pt-5">
              {attributes.map((attr) => {
                const currentVal = selectedAttributes[attr.name];
                return (
                  <div key={attr.name} className="flex flex-col">
                    <span className="text-[11px] font-bold tracking-[0.15em] text-neutral-800 uppercase">
                      {attr.name}: <span className="font-normal text-neutral-500">{currentVal}</span>
                    </span>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {attr.options.map((opt) => {
                        const isActive = currentVal === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectAttribute(attr.name, opt)}
                            className={`flex min-w-[40px] items-center justify-center border px-3 py-2 text-[11px] font-bold uppercase transition-all ${
                              isActive
                                ? "border-black bg-black text-white"
                                : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-6 flex items-center">
            <div className="flex items-center border border-neutral-300">
              <button
                type="button"
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="flex h-10 w-10 items-center justify-center text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                -
              </button>
              <span className="flex h-10 w-12 items-center justify-center text-xs font-semibold text-[#111]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-10 w-10 items-center justify-center text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded} 
              className={`w-full py-4 text-[11px] font-bold tracking-[0.25em] uppercase transition-all duration-200 ${
                isAdded ? "bg-neutral-400 text-white cursor-not-allowed" : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              ADD TO CART
            </button>
          </div>

          {/* Payment Badges */}
          <div className="mt-6 border-t border-neutral-100 pt-6 text-center">
            <p className="text-[11px] font-bold tracking-[0.1em] text-neutral-800 uppercase">
              Checkout securely with
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="relative h-5 w-10">
                <Image src="/images/payments/visa.png" alt="Visa" fill sizes="40px" className="object-contain" />
              </div>
              <div className="relative h-5 w-8">
                <Image src="/images/payments/mastercard.webp" alt="Mastercard" fill sizes="32px" className="object-contain" />
              </div>
              <div className="relative h-5 w-10">
                <Image src="/images/payments/bca.webp" alt="BCA" fill sizes="40px" className="object-contain" />
              </div>
              <div className="relative h-5 w-10">
                <Image src="/images/payments/qris.png" alt="QRIS" fill sizes="40px" className="object-contain" />
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          {product.description && (
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <h3 className="text-xs font-bold tracking-[0.15em] text-neutral-900 uppercase">
                Product Details
              </h3>
              <div
                className="prose prose-sm mt-3 text-xs leading-relaxed text-neutral-600"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
