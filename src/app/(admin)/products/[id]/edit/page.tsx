"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

// Services
import { getProductById, updateProduct } from "@/modules/products/product.service";
import { getCategories } from "@/modules/products/category.service";
import { getBrands } from "@/modules/products/brand.service";
import { getTags } from "@/modules/products/tag.service";
import { getAttributes } from "@/modules/products/attribute.service";

// Types
import { Category, Brand, Tag, Attribute, ProductType, ProductStatus, StockStatus } from "@/types";

// Modular Sub-components
import GeneralInfoSection from "@/components/admin/product-new/GeneralInfoSection";
import AttributesSection from "@/components/admin/product-new/AttributesSection";
import SimplePricingCard from "@/components/admin/product-new/SimplePricingCard";
import VariantPricingCard, { ProductVariantItem } from "@/components/admin/product-new/VariantPricingCard";
import ShippingCard from "@/components/admin/product-new/ShippingCard";
import CategoriesSidebar from "@/components/admin/product-new/CategoriesSidebar";
import BrandSidebar from "@/components/admin/product-new/BrandSidebar";
import TagsSidebar from "@/components/admin/product-new/TagsSidebar";
import FeaturedImageCard from "@/components/admin/product-new/FeaturedImageCard";
import GalleryCard from "@/components/admin/product-new/GalleryCard";

const isProductType = (value: string): value is ProductType => value === "simple" || value === "variable";
const isProductStatus = (value: string): value is ProductStatus => ["publish", "draft", "private"].includes(value);
const isStockStatus = (value: string): value is StockStatus => value === "instock" || value === "outofstock";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<ProductType>("simple");
  const [status, setStatus] = useState<ProductStatus>("draft");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("instock");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  // Shipping State
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  // Relations & Metadata State
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [attributesList, setAttributesList] = useState<Attribute[]>([]);

  // REVISI: Mengubah dari string tunggal jadi Array of strings untuk Multi-Kategori
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Attributes & Variable Product State
  const [selectedAttributes, setSelectedAttributes] = useState<{ attributeId: string; terms: string[] }[]>([]);
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);

  // 1. Fetch metadata dan data produk yang akan diedit
  useEffect(() => {
    async function loadData() {
      if (!productId) return;
      try {
        setPageLoading(true);
        const [catData, brandData, tagData, attrData, productData] = await Promise.all([
          getCategories(),
          getBrands(),
          getTags(),
          getAttributes(),
          getProductById(productId),
        ]);

        setCategories(catData);
        setBrands(brandData);
        setTags(tagData);
        setAttributesList(attrData);

        if (productData) {
          setName(productData.name || "");
          setSlug(productData.slug || "");
          setType(isProductType(productData.type) ? productData.type : "simple");
          setStatus(isProductStatus(productData.status) ? productData.status : "draft");
          setRegularPrice(productData.regular_price ? String(productData.regular_price) : "");
          setSalePrice(productData.sale_price ? String(productData.sale_price) : "");
          setSku(productData.sku || "");
          setStockStatus(isStockStatus(productData.stock_status) ? productData.stock_status : "instock");
          setStockQuantity(productData.stock_quantity ? String(productData.stock_quantity) : "0");
          setDescription(productData.description || "");
          setImageUrl(productData.image_url || "");
          setIsFreeShipping(Boolean(productData.is_free_shipping));
          setWeight(productData.weight ? String(productData.weight) : "");
          setLength(productData.length ? String(productData.length) : "");
          setWidth(productData.width ? String(productData.width) : "");
          setHeight(productData.height ? String(productData.height) : "");
          
          setSelectedBrandId(productData.brand_id || "");

          // REVISI: Set relasi kategori dari tabel perantara (product_categories)
          if ((productData as any).categories) {
            setSelectedCategoryIds(
              (productData as any).categories
                .map((c: any) => c.category_id)
                .filter(Boolean)
            );
          }

          // Set relasi tags jika ada
          if ((productData as any).tags) {
            setSelectedTagIds(
              (productData as any).tags
                .map((t: any) => t.tag?.id || t.tag_id || t.id)
                .filter(Boolean)
            );
          }

          // Set galeri gambar jika ada
          if ((productData as any).gallery_images) {
            setGalleryUrls((productData as any).gallery_images);
          }

          // Set varian produk jika ada
          if ((productData as any).variants && (productData as any).variants.length > 0) {
            const mappedVariants: ProductVariantItem[] = (productData as any).variants.map((v: any) => ({
              key: v.id || Math.random().toString(),
              name: Object.values(v.attributes || {}).join(" - ") || v.sku || "Variant",
              regular_price: v.regular_price ? String(v.regular_price) : "",
              sale_price: v.sale_price ? String(v.sale_price) : "",
              stock_quantity: v.stock_quantity ? String(v.stock_quantity) : "0",
              is_active: v.stock_status !== "outofstock",
            }));
            setVariants(mappedVariants);
          }
        }
      } catch (err: any) {
        console.error("Failed to load product data", err);
        setErrorMsg(err.message || "Failed to load product");
      } finally {
        setPageLoading(false);
      }
    }

    loadData();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);

      if (!name) {
        throw new Error("Product name is required.");
      }

      if (type === "simple" && !regularPrice) {
        throw new Error("Regular price is required for simple product.");
      }

      const activeVariants = variants.filter((v) => v.is_active);
      if (type === "variable") {
        if (variants.length === 0) {
          throw new Error("Please configure variants for variable product.");
        }
        if (activeVariants.length === 0) {
          throw new Error("Please enable at least one active variant.");
        }
        if (activeVariants.some((v) => !v.regular_price)) {
          throw new Error("All active variants must have a regular price.");
        }
      }

      const totalVariableStock = activeVariants.reduce(
        (sum, v) => sum + (parseInt(v.stock_quantity) || 0),
        0
      );

      // MENGIRIM PAYLOAD LENGKAP SAAT UPDATE
      await updateProduct(productId, {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type,
        status,
        regular_price: type === "simple" ? parseFloat(regularPrice) : (parseFloat(activeVariants[0]?.regular_price) || 0),
        sale_price: type === "simple" ? (salePrice ? parseFloat(salePrice) : null) : (activeVariants[0]?.sale_price ? parseFloat(activeVariants[0].sale_price) : null),
        sku: sku || null,
        stock_status: stockStatus,
        stock_quantity: type === "simple" ? (parseInt(stockQuantity) || 0) : totalVariableStock,
        description: description || null,
        image_url: imageUrl || null,
        weight: parseInt(weight) || 0,
        length: parseFloat(length) || 0,
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
        is_free_shipping: isFreeShipping,
        // --- DATA RELASIONAL ---
        selectedCategoryIds: selectedCategoryIds, // REVISI: Field multi-kategori baru
        brand_id: selectedBrandId || null,
        selectedTagIds: selectedTagIds,
        galleryUrls: galleryUrls,
        variantsData: variants
      });

      router.push("/products");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12 w-full">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Edit Product
            </h1>
            <p className="text-sm text-gray-500">
              Update existing product details and settings.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {submitting && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
            Update Product
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Utama */}
        <div className="lg:col-span-2 space-y-6">
          <GeneralInfoSection
            name={name}
            setName={setName}
            slug={slug}
            setSlug={setSlug}
            type={type}
            setType={setType}
            status={status}
            setStatus={setStatus}
            description={description}
            setDescription={setDescription}
          />

          <AttributesSection
            attributesList={attributesList}
            setAttributesList={setAttributesList}
            selectedAttributes={selectedAttributes}
            setSelectedAttributes={setSelectedAttributes}
            onError={setErrorMsg}
          />

          {type === "simple" ? (
            <SimplePricingCard
              regularPrice={regularPrice}
              setRegularPrice={setRegularPrice}
              salePrice={salePrice}
              setSalePrice={setSalePrice}
              sku={sku}
              setSku={setSku}
              stockStatus={stockStatus}
              setStockStatus={setStockStatus}
              stockQuantity={stockQuantity}
              setStockQuantity={setStockQuantity}
            />
          ) : (
            <VariantPricingCard
              variants={variants}
              setVariants={setVariants}
            />
          )}

          <ShippingCard
            isFreeShipping={isFreeShipping}
            setIsFreeShipping={setIsFreeShipping}
            weight={weight}
            setWeight={setWeight}
            length={length}
            setLength={setLength}
            width={width}
            setWidth={setWidth}
            height={height}
            setHeight={setHeight}
          />
        </div>

        {/* Kolom Kanan: Sidebar */}
        <div className="space-y-6">
          <CategoriesSidebar
            categories={categories}
            setCategories={setCategories}
            selectedCategoryIds={selectedCategoryIds} // REVISI
            setSelectedCategoryIds={setSelectedCategoryIds} // REVISI
            onError={setErrorMsg}
          />

          <BrandSidebar
            brands={brands}
            setBrands={setBrands}
            selectedBrandId={selectedBrandId}
            setSelectedBrandId={setSelectedBrandId}
            onError={setErrorMsg}
          />

          <TagsSidebar
            tags={tags}
            setTags={setTags}
            selectedTagIds={selectedTagIds}
            setSelectedTagIds={setSelectedTagIds}
            onError={setErrorMsg}
          />

          <FeaturedImageCard
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            onError={setErrorMsg}
          />

          <GalleryCard
            galleryUrls={galleryUrls}
            setGalleryUrls={setGalleryUrls}
            onError={setErrorMsg}
          />
        </div>
      </div>
    </form>
  );
}
