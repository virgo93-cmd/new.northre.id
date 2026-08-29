import HeroSlider from "@/components/storefront/HeroSlider";
import NewArrivals from "@/components/storefront/NewArrivals";
import { CategoryBar } from "@/components/storefront/CategoryBar";
import PromoBanners from "@/components/storefront/PromoBanners";
import BestSellers from "@/components/storefront/BestSellers";
import ProductPhotoCarousel from "@/components/storefront/ProductPhotoCarousel";
import { getActiveHeroBanners } from "@/modules/storefront-cms/hero-banner.service";
import { getActivePromoBanners } from "@/modules/storefront-cms/promo-banner.service";
import { getFeaturedProducts } from "@/modules/storefront-cms/featured.service";
import { getStoreSettings } from "@/modules/storefront-cms/general.service";
import { getCategories, getProducts } from "@/modules/products/product.service";

export const revalidate = 0; // Memastikan data selalu fresh saat diakses

export default async function StorefrontPage() {
  // Ambil data secara paralel termasuk daftar produk real untuk carousel
  const [banners, promoBanners, featuredProducts, settings, categories, allProducts] = await Promise.all([
    getActiveHeroBanners(),
    getActivePromoBanners(),
    getFeaturedProducts(),
    getStoreSettings(),
    getCategories(),
    getProducts(),
  ]);

  const sliderDelay = settings?.slider_delay_ms || 5000;

  return (
    <main className="w-full min-h-screen bg-white">
      {/* Hero Banner Slider Section */}
      <HeroSlider banners={banners} delayMs={sliderDelay} />

      {/* New And Sale / New Arrivals Section */}
      <NewArrivals />

      {/* Category Bar Section */}
      <CategoryBar categories={categories} />

      {/* Promo Banners Section */}
      <PromoBanners banners={promoBanners} />

      {/* Best Sellers Section */}
      <BestSellers products={featuredProducts} />

      {/* Product Photo Carousel / Marquee Section */}
      <ProductPhotoCarousel products={allProducts} />
    </main>
  );
}