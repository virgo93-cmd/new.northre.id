import Link from "next/link";
import { Package } from "lucide-react";
import { getProducts } from "@/modules/products/product.service";

// Fungsi format Rupiah identik dengan PriceTag.tsx lama
function toRp(num: number): string {
  if (!num || isNaN(num)) return "";
  return "RP " + num.toLocaleString("id-ID");
}

export default async function NewArrivals() {
  const rawProducts = await getProducts();
  const products = rawProducts.slice(0, 8);

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full bg-white px-4 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
      
      {/* Title Identik */}
      <div className="mb-10 text-center sm:mb-14">
        <h2 className="text-sm sm:text-base font-bold tracking-[0.35em] text-[#111] uppercase">
          NEW ARRIVALS
        </h2>
      </div>

      <div className="w-full">
        {/* Jarak Grid Identik dari ProductGrid.tsx */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-4 md:gap-x-10 lg:gap-x-12 md:gap-y-14">
          {products.map((product: any) => {
            
            // Logika Diskon
            let discountPercentage = 0;
            if (product.sale_price && product.regular_price && product.regular_price > product.sale_price) {
              discountPercentage = Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100);
            }

            // Gambar Hover (nyala lagi) - Layer Atas
            const hoverImage = product.gallery_images && product.gallery_images.length > 0 
              ? product.gallery_images[0] 
              : null;

            return (
              <div key={product.id} className="group flex flex-col items-center bg-white text-center w-full">
                
                {/* Image Container: aspect-square dari ProductCard.tsx */}
                <Link href={`/shop/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-[#f4f4f4]">
                  
                  {/* Badge Diskon Mengapung */}
                  {discountPercentage > 0 && (
                    <span className="absolute top-2 left-2 z-20 bg-neutral-900 text-white text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-1 uppercase">
                      -{discountPercentage}%
                    </span>
                  )}

                  {product.image_url ? (
                    <>
                      {/* Foto Utama */}
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={`absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${hoverImage ? 'z-0' : 'z-10'}`}
                      />
                      {/* Foto Kedua (Fade in halus tanpa kedip) */}
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

                {/* Info Teks di Bawah Foto (Identik ProductCard.tsx) */}
                <div className="mt-4 flex flex-col items-center w-full px-2">
                  <Link
                    href={`/shop/${product.slug}`}
                    title={product.name}
                    className="line-clamp-2 min-h-[2.6em] sm:min-h-[2.8em] flex items-center justify-center text-[10px] sm:text-[11px] font-medium tracking-[0.16em] leading-snug text-[#2c3e50] uppercase transition-colors hover:text-black"
                  >
                    {product.name}
                  </Link>

                  {/* Harga (Identik PriceTag.tsx) */}
                  <div className="mt-2 w-full">
                    <div className="flex items-center justify-center gap-1.5 font-sans text-[10px] sm:text-[11px] font-normal tracking-[0.08em]">
                      {discountPercentage > 0 ? (
                        <>
                          <span className="text-[#6fa832] font-semibold">
                            {toRp(product.sale_price)}
                          </span>
                          <span className="text-[#9ca3af] line-through">
                            {toRp(product.regular_price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-[#6fa832] font-semibold">
                          {toRp(product.regular_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Button Identik 100% */}
      <div className="mt-14 flex justify-center sm:mt-18">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-black px-10 py-3.5 text-[11px] font-bold tracking-[0.25em] text-white uppercase transition-all duration-200 hover:bg-[#222]"
        >
          VIEW MORE
        </Link>
      </div>

    </section>
  );
}