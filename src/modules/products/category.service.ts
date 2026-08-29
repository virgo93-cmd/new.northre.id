import { createClient } from "@/lib/supabase/client";
import { Category } from "@/types";

export async function getCategories() {
  const supabase = createClient();
  
  // 1. Ambil data kategori utama
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("*, parent:parent_id(name)")
    .order("name", { ascending: true });

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError.message);
    return [];
  }

  // 2. Ambil data relasi dari tabel perantara secara terpisah agar tidak kena error relasi cache
  const { data: relData, error: relError } = await supabase
    .from("product_categories")
    .select("category_id");

  if (relError) {
    console.error("Error fetching category relations:", relError.message);
  }

  // 3. Gabungkan dan hitung jumlah produk untuk tiap kategori
  const rawData = categoriesData.map((cat: any) => {
    // Hitung kemunculan category_id ini di dalam relData
    const count = relData ? relData.filter((r: any) => r.category_id === cat.id).length : 0;
    return { ...cat, product_count: count };
  });

  // 4. Akumulasi jumlah produk dari Child ke Parent-nya
  const formattedData = rawData.map((cat: any) => {
    if (!cat.parent_id) {
      const childrenTotal = rawData
        .filter((c: any) => c.parent_id === cat.id)
        .reduce((sum: number, c: any) => sum + c.product_count, 0);
      
      return {
        ...cat,
        product_count: cat.product_count + childrenTotal
      };
    }
    return cat;
  });

  return formattedData as any[];
}

export async function createCategory(categoryData: Partial<Category>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert([categoryData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Category;
}

export async function updateCategory(id: string, categoryData: Partial<Category>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .update(categoryData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Category;
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}