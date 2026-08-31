"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

// Services
import { createProduct } from "@/modules/products/product.service";
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

export default function AddNewProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
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

  // REVISI: Mengubah dari string tunggal jadi Array of strings
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Attributes & Variable Product Specific State
  const [selectedAttributes, setSelectedAttributes] = useState<{ attributeId: string; terms: string[] }[]>([]);
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);

  // Load Initial Metadata
  useEffect(() => {
    async function loadMetaData() {
      try {
        const [catData, brandData, tagData, attrData] = await Promise.all([
          getCategories(),
          getBrands(),
          getTags(),
          getAttributes(),
        ]);
        setCategories(catData);
        setBrands(brandData);
        setTags(tagData);
        setAttributesList(attrData);
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    }
    queueMicrotask(() => void loadMetaData());
  }, []);

  // Variant Generator Logic (Kombinasi Otomatis)
  useEffect(() => {
    queueMicrotask(() => setVariants((prevVariants) => {
      if (selectedAttributes.length === 0) return [];

      const activeAttributes = selectedAttributes.filter((a) => a.terms.length > 0);
      if (activeAttributes.length === 0) return [];

      const getTermName = (attrId: string, termId: string) => {
        const attr = attributesList.find((a) => a.id === attrId);
        const term = attr?.terms?.find((t) => t.id === termId);
        return term ? term.name : termId;
      };

      const generateCombinations = (arrays: { attrId: string; termId: string }[][]): { attrId: string; termId: string }[][] => {
        if (arrays.length === 0) return [];
        if (arrays.length === 1) return arrays[0].map((x) => [x]);
        const result = [];
        const rest = generateCombinations(arrays.slice(1));
        for (const item of arrays[0]) {
          for (const r of rest) {
            result.push([item, ...r]);
          }
        }
        return result;
      };

      const termArrays = activeAttributes.map((attr) =>
        attr.terms.map((termId) => ({ attrId: attr.attributeId, termId }))
      );

      const combinations = generateCombinations(termArrays);

      return combinations.map((combo) => {
        const key = combo.map((c) => c.termId).join("-");
        const name = combo.map((c) => getTermName(c.attrId, c.termId)).join(" - ");
        const existing = prevVariants.find((v) => v.key === key);
        return {
          key,
          name,
          regular_price: existing ? existing.regular_price : "",
          sale_price: existing ? existing.sale_price : "",
          stock_quantity: existing ? existing.stock_quantity : "0",
          is_active: existing ? existing.is_active : true,
        };
      });
    }));
  }, [selectedAttributes, attributesList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg(null);

      if (!name) {
        throw new Error("Product name is required.");
      }

      if (type === "simple" && !regularPrice) {
        throw new Error("Regular price is required for simple product.");
      }

      // Validasi untuk Variable Product
      const activeVariants = variants.filter((v) => v.is_active);
      if (type === "variable") {
        if (variants.length === 0) {
          throw new Error("Please select attributes to generate variants for variable product.");
        }
        if (activeVariants.length === 0) {
          throw new Error("Please enable at least one active variant.");
        }
        if (activeVariants.some((v) => !v.regular_price)) {
          throw new Error("All active variants must have a regular price.");
        }
      }

      // Menghitung total stok dari seluruh varian aktif jika tipe variable
      const totalVariableStock = activeVariants.reduce(
        (sum, v) => sum + (parseInt(v.stock_quantity) || 0),
        0
      );

      // MENGIRIM PAYLOAD LENGKAP TERMASUK RELASI
      await createProduct({
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
        selectedCategoryIds: selectedCategoryIds, // REVISI: Pakai field multi-kategori baru
        brand_id: selectedBrandId || null,
        selectedTagIds: selectedTagIds,
        galleryUrls: galleryUrls,
        variantsData: variants
      });

      router.push("/products");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

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
              Add New Product
            </h1>
            <p className="text-sm text-gray-500">
              Fill in the information below to add a product to your catalog.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
            Save Product
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
