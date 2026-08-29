"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sliders,
  Settings,
  Image as ImageIcon,
  Megaphone,
  Compass,
  Star,
  FileText,
  PanelBottom,
} from "lucide-react";

const CMS_NAV_ITEMS = [
  { label: "General", href: "/storefront-cms/general", icon: Settings },
  { label: "Announcement", href: "/storefront-cms/announcement", icon: Megaphone },
  { label: "Hero Banner", href: "/storefront-cms/hero-banner", icon: ImageIcon },
  { label: "Promo Banner", href: "/storefront-cms/promo-banner", icon: ImageIcon },
  { label: "Featured", href: "/storefront-cms/featured", icon: Star },
  { label: "Navigation", href: "/storefront-cms/navigation", icon: Compass },
  { label: "Footer", href: "/storefront-cms/footer", icon: PanelBottom },
  { label: "Pages", href: "/storefront-cms/pages", icon: FileText },
];

export default function StorefrontCmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-6 w-6 text-blue-600 shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Storefront CMS Management
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your online store appearance, banners, announcements, navigation, and informational pages flexibly.
        </p>

        {/* Sub-menu Navigation Tabs */}
        <div className="mt-4 border-t border-gray-100 pt-3 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-2 min-w-max">
            {CMS_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full">{children}</div>
    </div>
  );
}