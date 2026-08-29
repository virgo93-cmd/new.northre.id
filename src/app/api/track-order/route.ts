import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("id");
  const email = searchParams.get("email");

  if (!orderNumber || !email) {
    return NextResponse.json(
      { message: "ID Pesanan dan Email wajib diisi." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Cari pesanan berdasarkan nomor pesanan dan email customer
  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items(*)`)
    .eq("order_number", orderNumber.trim())
    .ilike("customer_email", email.trim())
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: "Pesanan tidak ditemukan atau kombinasi email salah." },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}