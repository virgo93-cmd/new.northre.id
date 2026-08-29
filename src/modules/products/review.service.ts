import { createClient } from "@/lib/supabase/client";
import { Review } from "@/types";

export async function getReviews() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, products(name, slug), profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error.message);
    return [];
  }

  return data as Review[];
}

export async function updateReviewStatus(id: string, status: "approved" | "pending" | "spam") {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Review;
}

export async function deleteReview(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}