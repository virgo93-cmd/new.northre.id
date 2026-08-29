"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { HeroBanner } from "@/modules/storefront-cms/hero-banner.service";

interface HeroSliderProps {
  banners: HeroBanner[];
  delayMs: number;
}

export default function HeroSlider({ banners, delayMs }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = banners?.length || 0;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay interval dengan pause saat mouse hover
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, delayMs || 5000);

    return () => clearInterval(interval);
  }, [nextSlide, delayMs, total, isPaused]);

  // Handle Touch & Drag Gesture (Geser manual di mobile & desktop)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // Jarak minimal geser (pixel)

    if (diff > threshold) {
      nextSlide(); // Geser ke kiri -> slide berikutnya
    } else if (diff < -threshold) {
      prevSlide(); // Geser ke kanan -> slide sebelumnya
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Drag handler untuk mouse di Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.clientX;
    const threshold = 50;

    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }

    touchStartX.current = null;
  };

  if (!banners || banners.length === 0) return null;

  return (
    <section
      className="w-full relative overflow-hidden select-none bg-neutral-950 cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        touchStartX.current = null;
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Container utama dengan rasio aspect presisi */}
      <div className="w-full relative aspect-[4/5] md:aspect-[21/9] lg:aspect-[2/1] min-h-[480px] md:min-h-0">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={banner.id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Image Box dengan subtle zoom transition saat slide aktif */}
              <div
                className={`w-full h-full relative transition-transform duration-7000 ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              >
                <picture>
                  <source media="(min-width: 768px)" srcSet={banner.desktop_image_url} />
                  <img
                    src={banner.mobile_image_url}
                    alt={banner.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    draggable={false}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </picture>

                {/* Subtle vignette/dark overlay */}
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {/* CTA Button dengan Fade-Up Transition */}
              {banner.show_button && banner.button_link && (
                <div
                  className={`absolute inset-0 flex items-end justify-center pb-12 md:pb-16 transition-all duration-700 delay-200 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <Link
                    href={banner.button_link}
                    className="group relative inline-flex items-center justify-center px-8 py-3 bg-black/90 hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-2xl border border-white/20 backdrop-blur-xs hover:scale-105 active:scale-95"
                  >
                    <span>{banner.button_text || "Shop Now"}</span>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Indikator Garis Minimalis di Bagian Bawah */}
      {total > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
          {banners.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setCurrentIndex(dotIdx)}
              className={`h-1 transition-all duration-500 rounded-full cursor-pointer ${
                dotIdx === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}