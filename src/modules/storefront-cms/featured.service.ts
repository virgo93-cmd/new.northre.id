import { createClient } from "@/lib/supabase/client";

export interface FeaturedProduct {
  id?: string;
  product_id: string;
  sort_order: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    regular_price: number;
    sale_price?: number;
    images?: string[];
  } | null;
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("featured_products")
    .select(`
      id,
      product_id,
      sort_order,
      product:products (
        *
      )
    `)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching featured products:", error.message);
    return [];
  }

  const formattedData = (data || []).map((item: any) => {
    const rawProduct = Array.isArray(item.product) ? item.product[0] || null : item.product;
    
    if (!rawProduct) {
      return {
        ...item,
        product: null,
      };
    }

    return {
      ...item,
      product: {
        id: rawProduct.id,
        name: rawProduct.name || rawProduct.title || "Untitled Product",
        slug: rawProduct.slug || "",
        regular_price: rawProduct.regular_price ?? rawProduct.price ?? rawProduct.base_price ?? 0,
        sale_price: rawProduct.sale_price ?? null,
        images: rawProduct.images || rawProduct.gallery_images || (rawProduct.image_url ? [rawProduct.image_url] : []),
      },
    };
  });

  return formattedData as FeaturedProduct[];
}

export async function addFeaturedProduct(product_id: string, sort_order: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("featured_products")
    .insert([{ product_id, sort_order }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// BARU: Fungsi untuk menambah banyak produk unggulan sekaligus
export async function addMultipleFeaturedProducts(payloads: { product_id: string; sort_order: number }[]) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("featured_products")
    .insert(payloads)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateFeaturedSortOrder(id: string, sort_order: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("featured_products")
    .update({ sort_order, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function removeFeaturedProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("featured_products")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}