import Link from "next/link";
import { Package, ShoppingBag } from "lucide-react";
import { FeaturedProduct } from "@/modules/storefront-cms/featured.service";

// Fungsi format Rupiah identik dengan NewArrivals
function toRp(num: number): string {
  if (!num || isNaN(num)) return "";
  return "Rp " + num.toLocaleString("id-ID");
}

interface BestSellersProps {
  products: FeaturedProduct[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (!products || products.length === 0) return null;

  // Batasi maksimal 4 grid
  const displayProducts = products.slice(0, 4);

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-8 sm:py-24 lg:px-12 xl:px-16 border-t border-neutral-100">
      
      {/* Title Identik dengan New Arrivals */}
      <div className="mb-10 text-center sm:mb-14">
        <h2 className="text-sm sm:text-base font-bold tracking-[0.35em] text-[#111] uppercase">
          BEST SELLERS
        </h2>
      </div>

      {/* Kontainer Full-Width */}
      <div className="w-full">
        {/* Grid 4 Kolom Full-Width */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-4 md:gap-x-10 lg:gap-x-12 md:gap-y-14 w-full">
          {displayProducts.map((item) => {
            const product = item.product;
            if (!product) return null;

            // Logika Diskon
            let discountPercentage = 0;
            if (product.sale_price && product.regular_price && product.regular_price > product.sale_price) {
              discountPercentage = Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100);
            }

            const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
            const hoverImage = product.images && product.images.length > 1 ? product.images[1] : null;

            return (
              <div key={item.id || product.id} className="group flex flex-col items-center bg-white text-center w-full">
                
                {/* Image Container */}
                <Link href={`/shop/${product.slug}`} className="relative aspect-square w-full overflow-hidden bg-[#f4f4f4]">
                  
                  {/* Badge Diskon Mengapung */}
                  {discountPercentage > 0 && (
                    <span className="absolute top-2 left-2 z-20 bg-neutral-900 text-white text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-1 uppercase">
                      -{discountPercentage}%
                    </span>
                  )}

                  {mainImage ? (
                    <>
                      {/* Foto Utama */}
                      <img
                        src={mainImage}
                        alt={product.name}
                        className={`absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${hoverImage ? 'z-0' : 'z-10'}`}
                      />
                      {/* Foto Kedua (Fade in halus) */}
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

                {/* Info Teks di Bawah Foto (Identik style New Arrivals) */}
                <div className="mt-4 flex flex-col items-center w-full px-2">
                  <Link
                    href={`/shop/${product.slug}`}
                    title={product.name}
                    className="line-clamp-2 min-h-[2.6em] sm:min-h-[2.8em] flex items-center justify-center text-[10px] sm:text-[11px] font-medium tracking-[0.16em] leading-snug text-[#2c3e50] uppercase transition-colors hover:text-black"
                  >
                    {product.name}
                  </Link>

                  {/* Harga */}
                  <div className="mt-2 w-full">
                    <div className="flex items-center justify-center gap-1.5 font-sans text-[10px] sm:text-[11px] font-normal tracking-[0.08em]">
                      {discountPercentage > 0 && product.sale_price ? (
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

                  {/* Tombol View Detail di masing-masing card */}
                  <div className="mt-4 w-full">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="w-full inline-flex items-center justify-center py-2 px-3 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-black text-white hover:bg-neutral-800 transition-colors shadow-sm"
                    >
                      <ShoppingBag className="h-3 w-3 mr-1.5" /> View Detail
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}