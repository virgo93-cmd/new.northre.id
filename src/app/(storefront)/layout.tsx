import Header from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { getStoreSettings } from "@/modules/storefront-cms/general.service";
import { getCategories, getProducts } from "@/modules/products/product.service";
import { getNavigationItems } from "@/modules/storefront-cms/navigation.service";
import { CartProvider } from "@/context/CartContext"; // <-- Import Provider keranjang

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ambil settings, kategori, menu navigasi, DAN produk secara paralel
  const [settings, categories, navItems, products] = await Promise.all([
    getStoreSettings(),
    getCategories(),
    getNavigationItems(),
    getProducts(),
  ]);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        {/* Lempar juga data products ke Header */}
        <Header 
          logoUrl={settings?.logo_url} 
          siteName={settings?.site_name} 
          categories={categories}
          navItems={navItems}
          products={products}
        />
        
        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}