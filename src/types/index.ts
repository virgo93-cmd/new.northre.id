import { LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  href: string;
}

export interface NavItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string;
  external?: boolean;
  children?: NavSubItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// Database Entity Types
export type UserRole = "admin" | "customer";
export type AffiliateBadge = "bronze" | "silver" | "gold" | "platinum";

export interface Profile {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  referral_code?: string | null;
  referred_by?: string | null;
  is_affiliate: boolean;
  affiliate_badge?: AffiliateBadge | string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  cashback_balance: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// E-COMMERCE / PRODUCTS TYPES (WooCommerce Style)
// ==========================================

export type ProductType = "simple" | "variable";
export type ProductStatus = "publish" | "draft" | "private";
export type StockStatus = "instock" | "outofstock";

export interface Product {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  description?: string | null;
  short_description?: string | null;
  regular_price: number;
  sale_price?: number | null;
  sku?: string | null;
  stock_status: StockStatus;
  stock_quantity?: number | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  
  // --- RELASI & SHIPPING ---
  category_id?: string | null;
  brand_id?: string | null;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  is_free_shipping?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
  // Relasi opsional jika di-join di query
  parent?: Category | null;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
}

export interface Attribute {
  id: string;
  name: string; // Contoh: "Size", "Color"
  slug: string;
  created_at: string;
  terms?: AttributeTerm[];
}

export interface AttributeTerm {
  id: string;
  attribute_id: string;
  name: string; // Contoh: "XL", "Red"
  slug: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string | null;
  regular_price: number;
  sale_price?: number | null;
  stock_status: StockStatus;
  stock_quantity?: number | null;
  image_url?: string | null;
  attributes?: Record<string, string> | null; // Contoh: {"size": "L", "color": "Red"}
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number; // 1 - 5
  comment?: string | null;
  status: "approved" | "pending" | "spam";
  created_at: string;
  // Relasi join dari query Supabase
  products?: {
    name: string;
    slug: string;
  } | null;
  profiles?: {
    full_name?: string | null;
    email?: string | null;
  } | null;
}