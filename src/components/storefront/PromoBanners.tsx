import Link from "next/link";
import { PromoBanner } from "@/modules/storefront-cms/promo-banner.service";

interface PromoBannersProps {
  banners: PromoBanner[];
}

export default function PromoBanners({ banners }: PromoBannersProps) {
  if (!banners || banners.length === 0) return null;

  return (
    <section className="w-full py-6">
      <div className="w-full space-y-6">
        {banners.map((banner) => (
          <div
            key={banner.id || banner.sort_order}
            className="relative overflow-hidden bg-neutral-100 group aspect-[2/1] w-full"
          >
            {/* Banner Image */}
            <img
              src={banner.image_url}
              alt={banner.title || "Promo Banner"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Optional Overlay Content (Title, Subtitle, CTA Button) */}
            {(banner.title || banner.subtitle || (banner.show_button ?? true)) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
                <div className="max-w-3xl space-y-2">
                  {banner.title && (
                    <h3 className="text-xl sm:text-3xl font-bold tracking-tight">
                      {banner.title}
                    </h3>
                  )}
                  {banner.subtitle && (
                    <p className="text-xs sm:text-sm text-neutral-200 line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}
                  {(banner.show_button ?? true) && banner.button_link && (
                    <div className="pt-2">
                      <Link
                        href={banner.button_link}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-white text-black hover:bg-neutral-100 transition-colors shadow-sm"
                      >
                        {banner.button_text || "Shop Now"}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}