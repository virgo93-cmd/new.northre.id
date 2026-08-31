import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Metadata } from "next";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fungsi untuk mengambil data halaman berdasarkan slug langsung dari database (Server-side)
async function getPageBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

// Generate Dynamic SEO Metadata untuk halaman ini
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found - NORTHRE",
    };
  }

  return {
    title: `${page.title} — NORTHRE`,
    description: page.meta_description || "NORTHRE® Official Store Page",
  };
}

export default async function CustomPageView({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  // Jika halaman tidak ditemukan atau belum dipublikasikan, lempar ke 404
  if (!page) {
    notFound();
  }

  return (
    <main className="w-full bg-white text-[#222] min-h-[70vh] py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Judul Halaman */}
        <div className="mb-12 border-b border-neutral-200 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-black uppercase">
            {page.title}
          </h1>
        </div>

        {/* Konten Rich Text dari CMS */}
        <div 
          className="prose prose-neutral max-w-none text-[14px] sm:text-[15px] leading-relaxed text-[#444] space-y-6"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(page.content) }}
        />
      </div>
    </main>
  );
}
