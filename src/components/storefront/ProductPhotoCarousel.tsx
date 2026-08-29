"use client";

import Link from "next/link";
import { Package } from "lucide-react";

interface ProductPhotoCarouselProps {
  products: any[];
}

export default function ProductPhotoCarousel({ products }: ProductPhotoCarouselProps) {
  if (!products || products.length === 0) return null;

  // Duplikasi data agar perputaran animasi loop tidak ada jeda kosong
  const displayItems = [...products, ...products, ...products];

  return (
    <section className="relative w-full overflow-hidden bg-white py-12 sm:py-16 border-t border-neutral-100">
      {/* Edge Fade Gradients Kiri & Kanan */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-24" />

      {/* Marquee Track */}
      <div className="group relative flex w-full overflow-hidden">
        <div className="carousel-track flex w-max shrink-0 items-center gap-3 sm:gap-5">
          {displayItems.map((product, index) => {
            const imageUrl = product.image_url || (product.gallery_images && product.gallery_images[0]) || null;
            const secondaryImage = product.gallery_images && product.gallery_images.length > 0 ? product.gallery_images[0] : null;
            const imageAlt = product.name || "Product photo";

            return (
              <Link
                key={`${product.id || product.slug}-${index}`}
                href={`/shop/${product.slug}`}
                className="group/item relative aspect-square w-[160px] sm:w-[220px] md:w-[260px] shrink-0 overflow-hidden bg-[#f4f4f4]"
              >
                {imageUrl ? (
                  <>
                    {/* Foto Utama */}
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-500 ease-out ${
                        secondaryImage ? "group-hover/item:opacity-0" : "group-hover/item:scale-105"
                      }`}
                    />
                    {/* Foto Kedua saat hover */}
                    {secondaryImage && (
                      <img
                        src={secondaryImage}
                        alt={`${imageAlt} - alternate`}
                        className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-500 ease-out group-hover/item:opacity-100 group-hover/item:scale-105"
                      />
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <Package className="h-8 w-8" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Style Animasi Self-Contained */}
      <style jsx>{`
        .carousel-track {
          animation: marqueeScroll 35s linear infinite;
        }
        .group:hover .carousel-track {
          animation-play-state: paused;
        }
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
}