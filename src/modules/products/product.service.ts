import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types";
import type { Database } from "../../../types/database.types";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

interface VariantDraft {
  is_active: boolean;
  name: string;
  key: string;
  regular_price: string;
  sale_price?: string;
  stock_quantity: string;
}

/**
 * Interface khusus untuk payload save/update agar bisa menerima data relasional
 * (kategori, brand, tag, galeri, dan varian) dari form Next.js
 */
export interface ProductSavePayload extends Partial<Product> {
  selectedTagIds?: string[];
  selectedCategoryIds?: string[]; // BARU: Array untuk multi-kategori
  galleryUrls?: string[];
  variantsData?: VariantDraft[];
}

/**
 * Mengambil semua daftar produk beserta relasi kategori dan total order
 */
export async function getProducts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories:product_categories (
        category:categories (
          id,
          name,
          parent:categories (
            id,
            name
          )
        )
      ),
      order_items (
        quantity
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  // Format response untuk menghitung total order dari tabel order_items
  const formattedData = data.map((product) => {
    // Menghitung total quantity produk yang ada di order_items
    const total_orders = product.order_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    
    // Ambil kategori pertama sebagai fallback untuk UI lama (All Products)
    const primaryCategory = product.categories?.[0]?.category || null;

    return {
      ...product,
      category: primaryCategory, // Menjaga kompatibilitas dengan tabel All Products
      all_categories: product.categories?.map((categoryRelation) => categoryRelation.category) || [], // Semua kategori
      total_orders
    };
  });

  return formattedData;
}

/**
 * Mengambil detail produk beserta variannya berdasarkan ID (untuk form Edit)
 */
export async function getProductById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      variants:product_variants(*),
      tags:product_tags(tag_id),
      categories:product_categories(category_id)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product by id:", error.message);
    return null;
  }

  return data;
}

/**
 * Mengambil detail produk berdasarkan slug
 */
export async function getProductBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      variants:product_variants(*),
      categories:product_categories(
        category:categories(id, name)
      )
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching product by slug:", error.message);
    return null;
  }

  return data;
}

/**
 * Menambah produk baru ke database beserta relasinya (Variants, Tags, Gallery, Kategori)
 */
export async function createProduct(payload: ProductSavePayload) {
  const supabase = createClient();
  
  // 1. Ekstrak data relasional dari payload
  // PENTING: Kita juga ekstrak `category_id` (jika ada dari UI lama) agar tidak ikut ter-insert ke tabel products
  const { selectedTagIds, selectedCategoryIds, category_id: _categoryId, galleryUrls, variantsData, ...productData } = payload;
  void _categoryId;
  
  // Format gallery_images 
  const productToSave = {
    ...productData,
    gallery_images: galleryUrls && galleryUrls.length > 0 ? galleryUrls : null,
  } as ProductInsert;

  // 2. Insert ke tabel utama (products)
  const { data: newProduct, error: productError } = await supabase
    .from("products")
    .insert([productToSave])
    .select()
    .single();

  if (productError) throw new Error("Error creating product: " + productError.message);

  const productId = newProduct.id;

  // 3. Insert ke tabel product_categories (Multi-Kategori)
  if (selectedCategoryIds && selectedCategoryIds.length > 0) {
    const categoriesToInsert = selectedCategoryIds.map((catId: string) => ({
      product_id: productId,
      category_id: catId
    }));
    
    const { error: catError } = await supabase
      .from("product_categories")
      .insert(categoriesToInsert);
      
    if (catError) console.error("Error saving categories:", catError.message);
  }

  // 4. Insert ke tabel product_tags
  if (selectedTagIds && selectedTagIds.length > 0) {
    const tagsToInsert = selectedTagIds.map((tagId: string) => ({
      product_id: productId,
      tag_id: tagId
    }));
    
    const { error: tagsError } = await supabase
      .from("product_tags")
      .insert(tagsToInsert);
      
    if (tagsError) console.error("Error saving tags:", tagsError.message);
  }

  // 5. Insert ke tabel product_variants
  if (productData.type === "variable" && variantsData && variantsData.length > 0) {
    const activeVariants = variantsData.filter((variant) => variant.is_active);
    
    if (activeVariants.length > 0) {
      const variantsToInsert = activeVariants.map((v) => {
        const attrObj: Record<string, string> = { "combination": v.name }; 
        return {
          product_id: productId,
          sku: `${productData.sku || productId}-${v.key}`,
          regular_price: parseFloat(v.regular_price) || 0,
          sale_price: v.sale_price ? parseFloat(v.sale_price) : null,
          stock_status: parseInt(v.stock_quantity) > 0 ? "instock" : "outofstock",
          stock_quantity: parseInt(v.stock_quantity) || 0,
          attributes: attrObj
        };
      });

      const { error: variantError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);
        
      if (variantError) throw new Error("Error saving variants: " + variantError.message);
    }
  }

  return newProduct;
}

/**
 * Memperbarui data produk berdasarkan ID beserta relasinya
 */
export async function updateProduct(id: string, payload: ProductSavePayload) {
  const supabase = createClient();
  
  // 1. Ekstrak data relasional
  const { selectedTagIds, selectedCategoryIds, category_id: _categoryId, galleryUrls, variantsData, ...productData } = payload;
  void _categoryId;
  
  const productToSave = {
    ...productData,
    gallery_images: galleryUrls && galleryUrls.length > 0 ? galleryUrls : null,
  } as ProductUpdate;

  // 2. Update tabel utama (products)
  const { data: updatedProduct, error: productError } = await supabase
    .from("products")
    .update(productToSave)
    .eq("id", id)
    .select()
    .single();

  if (productError) throw new Error("Error updating product: " + productError.message);

  // 3. Update Multi-Kategori (Hapus yang lama, insert yang baru)
  if (selectedCategoryIds) {
    await supabase.from("product_categories").delete().eq("product_id", id);
    
    if (selectedCategoryIds.length > 0) {
       const categoriesToInsert = selectedCategoryIds.map((catId: string) => ({
        product_id: id,
        category_id: catId
      }));
      await supabase.from("product_categories").insert(categoriesToInsert);
    }
  }

  // 4. Update Tags (Hapus yang lama, insert yang baru)
  if (selectedTagIds) {
    await supabase.from("product_tags").delete().eq("product_id", id);
    
    if (selectedTagIds.length > 0) {
       const tagsToInsert = selectedTagIds.map((tagId: string) => ({
        product_id: id,
        tag_id: tagId
      }));
      await supabase.from("product_tags").insert(tagsToInsert);
    }
  }

  // 5. Update Variants 
  if (productData.type === "variable" && variantsData) {
     // Hapus varian lama
     await supabase.from("product_variants").delete().eq("product_id", id);
     
     // Insert varian baru
     const activeVariants = variantsData.filter((variant) => variant.is_active);
     if (activeVariants.length > 0) {
      const variantsToInsert = activeVariants.map((v) => {
        const attrObj: Record<string, string> = { "combination": v.name }; 
        return {
          product_id: id,
          sku: `${productData.sku || id}-${v.key}`,
          regular_price: parseFloat(v.regular_price) || 0,
          sale_price: v.sale_price ? parseFloat(v.sale_price) : null,
          stock_status: parseInt(v.stock_quantity) > 0 ? "instock" : "outofstock",
          stock_quantity: parseInt(v.stock_quantity) || 0,
          attributes: attrObj
        };
      });
      await supabase.from("product_variants").insert(variantsToInsert);
     }
  } else if (productData.type === "simple") {
     // Jika diubah jadi tipe simple, bersihkan data varian di database
     await supabase.from("product_variants").delete().eq("product_id", id);
  }

  return updatedProduct;
}

/**
 * Menghapus produk dari database
 */
export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

/**
 * Mengambil seluruh daftar kategori dari database untuk CategoryBar
 */
export async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }

  return data || [];
}
