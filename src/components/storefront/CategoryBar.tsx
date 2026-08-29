"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface CategoryBarProps {
  categories: any[];
}

export function CategoryBar({ categories }: CategoryBarProps) {
  if (!categories || categories.length === 0) return null;

  // Filter Parent Categories (parent_id kosong atau null)
  const parentCategories = categories.filter(
    (cat) => !cat.parent_id || cat.parent_id === 0
  );

  return (
    <section className="w-full bg-white py-6 sm:py-12">
      <div className="w-full px-3 sm:px-6 lg:px-10 xl:px-14">
        {/* Title Section */}
        <div className="mb-4 text-center sm:mb-10">
          <h2 className="text-xs font-bold tracking-[0.35em] text-[#111] uppercase sm:text-base">
            CATEGORIES
          </h2>
        </div>

        {/* Container Layout */}
        <div className="flex w-full flex-row items-stretch gap-2.5 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar sm:gap-4 md:gap-5 md:overflow-visible md:pb-0">
          {parentCategories.map((parent) => {
            // Ambil semua child category milik parent ini berdasarkan parent_id atau relasi
            const childCategories = categories.filter(
              (cat) => cat.parent_id === parent.id
            );

            // Jika parent tidak punya child, kita bisa tampilkan parent itu sendiri atau skip
            const displayList = childCategories.length > 0 ? childCategories : [parent];

            return (
              <ParentCategoryCard
                key={parent.id || parent.slug}
                parentName={parent.name}
                childrenList={displayList}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Sub-komponen per Parent Card
function ParentCategoryCard({
  parentName,
  childrenList,
}: {
  parentName: string;
  childrenList: any[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = childrenList.length;
  const currentChild = childrenList[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const imageUrl = currentChild.image_url || "/placeholder.jpg";
  const imageAlt = currentChild.name;

  return (
    <div className="flex w-[110px] flex-shrink-0 snap-start flex-col items-center justify-between rounded-lg border border-neutral-200 bg-white p-2 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-neutral-300 hover:shadow-md sm:w-[170px] sm:rounded-xl sm:p-3 md:w-auto md:flex-1 md:shrink">
      {/* Header: Nama Parent + Total Count */}
      <div className="mb-1.5 w-full text-center sm:mb-2.5">
        <h3 className="truncate text-[10px] font-bold tracking-wider text-neutral-900 uppercase sm:text-xs md:text-sm">
          {parentName}{" "}
          <span className="text-[9px] font-medium text-neutral-400 sm:text-xs">
            ({total})
          </span>
        </h3>
      </div>

      {/* Area Gambar 1 Child dengan Navigasi Slider */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-neutral-50 p-1 sm:rounded-lg sm:p-2">
        <Link
          href={`/category/${currentChild.slug}`}
          className="group relative block h-full w-full"
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 100px, (max-width: 1024px) 160px, 20vw"
            className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Tombol Panah Slider Mini */}
        {total > 1 && (
          <div className="pointer-events-none absolute inset-x-0.5 top-1/2 flex -translate-y-1/2 justify-between">
            <button
              onClick={handlePrev}
              type="button"
              className="pointer-events-auto flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[8px] font-bold text-neutral-700 shadow-sm backdrop-blur-xs transition-all hover:bg-black hover:text-white sm:h-7 sm:w-7 sm:text-xs sm:shadow-md"
              aria-label="Previous child category"
            >
              &#10094;
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="pointer-events-auto flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[8px] font-bold text-neutral-700 shadow-sm backdrop-blur-xs transition-all hover:bg-black hover:text-white sm:h-7 sm:w-7 sm:text-xs sm:shadow-md"
              aria-label="Next child category"
            >
              &#10095;
            </button>
          </div>
        )}
      </div>

      {/* Label Nama Child */}
      <div className="mt-1.5 w-full text-center sm:mt-2.5">
        <Link
          href={`/category/${currentChild.slug}`}
          className="block truncate text-[10px] font-medium text-neutral-700 transition-colors hover:text-black hover:underline sm:text-xs"
          title={currentChild.name}
        >
          {currentChild.name}
        </Link>
      </div>
    </div>
  );
}