import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { getProducts } from "@/modules/products/product.service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products — NORTHRE",
  description: "Browse our complete collection of apparel and products.",
};

function toRp(num: number): string {
  if (!num || isNaN(num)) return "";
  return "RP " + num.toLocaleString("id-ID");
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="w-full bg-white px-4 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
      
      {/* Tombol Back */}
      <div className="mx-auto max-w-[1440px] mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-neutral-600 uppercase transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          BACK TO HOME
        </Link>
      </div>

      <div className="mb-10 text-center sm:mb-14">
        <h1 className="text-base sm:text-lg font-bold tracking-[0.35em] text-[#111] uppercase">
          ALL PRODUCTS
        </h1>
        <p className="mt-2 text-xs text-neutral-500 uppercase tracking-widest">
          Explore our full collection
        </p>
      </div>

      <div className="mx-auto max-w-[1440px]">
        {(!products || products.length === 0) ? (
          <div className="py-20 text-center text-sm text-neutral-500 uppercase tracking-wider">
            No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-4 md:gap-x-10 lg:gap-x-12 md:gap-y-14">
            {products.map((product: any) => {
              let discountPercentage = 0;
              if (product.sale_price && product.regular_price && product.regular_price > product.sale_price) {
                discountPercentage = Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100);
              }

              const mainImage = product.image_url || product.featured_image || product.gallery_images?.[0] || "";
              const hoverImage = product.gallery_images && product.gallery_images.length > 0 
                ? product.gallery_images[0] 
                : null;

              return (
                <div key={product.id} className="group flex flex-col items-center bg-white text-center w-full">
                  <Link href={`/shop/${product.slug || product.id}`} className="relative aspect-square w-full overflow-hidden bg-[#f4f4f4]">
                    {discountPercentage > 0 && (
                      <span className="absolute top-2 left-2 z-20 bg-neutral-900 text-white text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-1 uppercase">
                        -{discountPercentage}%
                      </span>
                    )}

                    {mainImage ? (
                      <>
                        <img
                          src={mainImage}
                          alt={product.name}
                          className={`absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${hoverImage ? 'z-0' : 'z-10'}`}
                        />
                        {hoverImage && (
                          <img
                            src={hoverImage}
                            alt={`${product.name} detail`}
                            className="absolute inset-0 z-10 h-full w-full object-cover object-center opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                          />
                        )}
                      </>
                    ) : (
                       <div className="absolute inset-0 z-10 flex items-center justify-center h-full w-full text-gray-300">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </Link>

                  <div className="mt-4 flex flex-col items-center w-full px-2">
                    <Link
                      href={`/shop/${product.slug || product.id}`}
                      title={product.name}
                      className="line-clamp-2 min-h-[2.6em] sm:min-h-[2.8em] flex items-center justify-center text-[10px] sm:text-[11px] font-medium tracking-[0.16em] leading-snug text-[#2c3e50] uppercase transition-colors hover:text-black"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-2 w-full">
                      <div className="flex items-center justify-center gap-1.5 font-sans text-[10px] sm:text-[11px] font-normal tracking-[0.08em]">
                        {discountPercentage > 0 ? (
                          <>
                            <span className="text-[#6fa832] font-semibold">{toRp(product.sale_price)}</span>
                            <span className="text-[#9ca3af] line-through">{toRp(product.regular_price)}</span>
                          </>
                        ) : (
                          <span className="text-[#6fa832] font-semibold">{toRp(product.regular_price)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}