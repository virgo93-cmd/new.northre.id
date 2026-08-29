import { NavSection } from "@/types";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Wallet,
  Settings,
  Megaphone,
  Image as ImageIcon,
  Sparkles,
  Compass,
  PanelBottom,
  FileText,
  Webhook,
} from "lucide-react";

export const ADMIN_NAV_CONFIG: NavSection[] = [
  {
    title: "Main Operations",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        title: "Products",
        icon: Package,
        children: [
          { title: "All Products", href: "/products" },
          { title: "Add New Product", href: "/products/new" },
          { title: "Brands", href: "/products/brands" },
          { title: "Categories", href: "/products/categories" },
          { title: "Tags", href: "/products/tags" },
          { title: "Attributes", href: "/products/attributes" },
          { title: "Reviews", href: "/products/reviews" },
        ],
      },
      { title: "Orders", href: "/orders", icon: ShoppingBag },
      { title: "Users & Roles", href: "/users", icon: Users },
      { title: "Finance & Wallet", href: "/finance", icon: Wallet },
    ],
  },
  {
    title: "Storefront CMS",
    items: [
      { title: "General", href: "/storefront-cms/general", icon: Settings },
      { title: "Announcement", href: "/storefront-cms/announcement", icon: Megaphone },
      { title: "Hero Banner", href: "/storefront-cms/hero-banner", icon: ImageIcon },
      { title: "Promo Banner", href: "/storefront-cms/promo-banner", icon: ImageIcon },
      { title: "Featured Products", href: "/storefront-cms/featured", icon: Sparkles },
      { title: "Navigation", href: "/storefront-cms/navigation", icon: Compass },
      { title: "Footer", href: "/storefront-cms/footer", icon: PanelBottom },
      { title: "Custom Pages", href: "/storefront-cms/pages", icon: FileText },
    ],
  },
  {
    title: "System & Integrations",
    items: [
      {
        title: "Webhooks & APIs",
        icon: Webhook,
        children: [
          { title: "Midtrans Payment", href: "/settings/webhooks/midtrans" },
          { title: "Mengantar Logistics", href: "/settings/webhooks/mengantar" },
        ],
      },
    ],
  },
];

/* ==========================================================================
   WEBHOOK & THIRD-PARTY INTEGRATION CONSTANTS
   ========================================================================== */

export const MIDTRANS_CONFIG = {
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
  isProduction: process.env.NODE_ENV === "production",
};

export const MENGANTAR_CONFIG = {
  apiKey: process.env.MENGANTAR_API_KEY || "",
  webhookSecret: process.env.MENGANTAR_WEBHOOK_SECRET || "",
  baseUrl: process.env.MENGANTAR_BASE_URL || "https://api.mengantar.com",
};