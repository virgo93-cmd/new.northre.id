import { getProductBySlug } from "@/modules/products/product.service";
import ProductDetailView from "@/components/storefront/ProductDetailView";
import RelatedProducts from "@/components/storefront/RelatedProducts";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params; 
  
  // 'id' di sini isinya adalah slug dari URL, jadi kita tetap tembak ke fungsi BySlug
  const product = await getProductBySlug(id);
  
  if (!product) {
    return { title: "Product Not Found - NORTHRE" };
  }
  
  return { 
    title: `${product.name} — NORTHRE`,
    description: product.description ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 150) : "NORTHRE® Official Store",
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Tarik data pakai slug (yang tersimpan di variabel id)
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="w-full bg-white py-10 md:py-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <ProductDetailView product={product} />
      </div>

      {/* Bagian You May Also Like */}
      <RelatedProducts currentProductId={product.id} />
    </main>
  );
}