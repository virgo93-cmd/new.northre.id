import Link from "next/link";
import { getProducts, getCategories } from "@/modules/products/product.service";
import { Package, ArrowLeft, Layers } from "lucide-react";

// Fungsi format Rupiah identik dengan NewArrivals
function toRp(num: number): string {
  if (!num || isNaN(num)) return "";
  return "RP " + num.toLocaleString("id-ID");
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Ambil data real dari database secara paralel[cite: 3]
  const [allProducts, allCategories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Temukan kategori aktif berdasarkan slug
  const currentCategory = allCategories.find((cat: any) => cat.slug === slug);

  // Filter produk yang berelasi dengan kategori ini
  const products = allProducts.filter((product: any) => {
    if (!currentCategory) return false;
    
    const matchCategory = product.category_id === currentCategory.id || product.category?.id === currentCategory.id;
    const matchSlug = product.category?.slug === slug || product.category_slug === slug;
    const matchArray = product.all_categories?.some((c: any) => c.id === currentCategory.id || c.slug === slug);

    return matchCategory || matchSlug || matchArray;
  });

  // Pisahkan kategori lain: Parent dan Child
  const otherCategories = allCategories.filter((cat: any) => cat.slug !== slug);
  
  const parentCategories = otherCategories.filter(
    (cat: any) => !cat.parent_id || cat.parent_id === 0 || cat.parent === null
  );

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      {/* Header Banner */}
      <div className="bg-neutral-50 border-b border-neutral-200 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-2">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-neutral-900">
            {currentCategory ? currentCategory.name : slug.replace(/-/g, " ")}
          </h1>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            {products.length} {products.length === 1 ? "Product" : "Products"} Available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 space-y-16">
        {/* List Produk Grid dengan Card Identik NewArrivals */}
        {products.length === 0 ? (
          <div className="py-20 text-center space-y-4 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <Package className="mx-auto h-10 w-10 text-neutral-300" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider">No Products Found</h3>
              <p className="text-xs text-neutral-500">There are no products currently listed under this category.</p>
            </div>
            <Link 
              href="/" 
              className="inline-block mt-2 px-5 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-all"
            >
              Explore All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 md:grid-cols-4 md:gap-x-10 lg:gap-x-12 md:gap-y-14">
            {products.map((product: any) => {
              // Logika Diskon Identik NewArrivals[cite: 3]
              let discountPercentage = 0;
              if (product.sale_price && product.regular_price && product.regular_price > product.sale_price) {
                discountPercentage = Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100);
              }

              // Gambar Utama & Hover[cite: 3]
              const mainImage = product.image_url || product.featured_image || product.gallery_images?.[0] || "";
              const hoverImage = product.gallery_images && product.gallery_images.length > 0 
                ? product.gallery_images[0] 
                : null;

              return (
                <div key={product.id} className="group flex flex-col items-center bg-white text-center w-full">
                  
                  {/* Image Container Identik NewArrivals[cite: 3] */}
                  <Link href={`/shop/${product.slug || product.id}`} className="relative aspect-square w-full overflow-hidden bg-[#f4f4f4]">
                    
                    {/* Badge Diskon[cite: 3] */}
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

                  {/* Info Teks di Bawah Foto Identik NewArrivals[cite: 3] */}
                  <div className="mt-4 flex flex-col items-center w-full px-2">
                    <Link
                      href={`/shop/${product.slug || product.id}`}
                      title={product.name}
                      className="line-clamp-2 min-h-[2.6em] sm:min-h-[2.8em] flex items-center justify-center text-[10px] sm:text-[11px] font-medium tracking-[0.16em] leading-snug text-[#2c3e50] uppercase transition-colors hover:text-black"
                    >
                      {product.name}
                    </Link>

                    {/* Harga Identik NewArrivals[cite: 3] */}
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
        )}

        {/* Section: More Categories (Dikelompokkan Berdasarkan Parent Category) */}
        {parentCategories.length > 0 && (
          <div className="pt-12 border-t border-neutral-200 space-y-10">
            <div>
              <h2 className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-black">
                More Categories
              </h2>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mt-0.5">
                Browse by collections & groups
              </p>
            </div>

            <div className="space-y-8">
              {parentCategories.map((parent: any) => {
                const childrenOfParent = otherCategories.filter(
                  (cat: any) => cat.parent_id === parent.id || cat.parent?.id === parent.id
                );

                if (childrenOfParent.length === 0) return null;

                return (
                  <div key={parent.id || parent.slug} className="space-y-3">
                    {/* Parent Category sebagai Judul Kelompok */}
                    <div className="flex items-center gap-2 pb-1.5 border-b border-neutral-200">
                      <Layers className="w-3.5 h-3.5 text-neutral-500" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900">
                        {parent.name}
                      </h3>
                    </div>

                    {/* Grid Child Categories Dinamis */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {childrenOfParent.map((child: any) => {
                        const childImage = child.image_url || child.image || "";

                        return (
                          <Link
                            key={child.id || child.slug}
                            href={`/category/${child.slug}`}
                            className="group flex items-center gap-3 p-2.5 bg-neutral-50 hover:bg-black hover:text-white rounded-lg border border-neutral-200 hover:border-black transition-all duration-200"
                          >
                            <div className="relative w-10 h-10 rounded-md bg-neutral-200 group-hover:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                              {childImage ? (
                                <img 
                                  src={childImage} 
                                  alt={child.name} 
                                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300" 
                                />
                              ) : (
                                <Package className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold uppercase tracking-wider truncate text-neutral-900 group-hover:text-white">
                                {child.name}
                              </span>
                              <span className="block text-[10px] font-medium uppercase tracking-widest text-neutral-400 group-hover:text-neutral-400">
                                View Items
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}