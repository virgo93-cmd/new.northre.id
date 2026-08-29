"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_CONFIG } from "@/lib/constants";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  // State dinamis untuk melacak menu mana saja yang dropdown-nya sedang terbuka
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    ADMIN_NAV_CONFIG.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const isChildActive = item.children.some(
            (child) => pathname === child.href || pathname.startsWith(child.href)
          );
          initialState[item.title] = isChildActive;
        }
      });
    });
    return initialState;
  });

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside
      className={`relative bg-white border-r border-neutral-200 flex flex-col justify-between hidden md:flex shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Toggle Collapse Button */}
      <button
        onClick={onToggleCollapse}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        className="absolute -right-3 top-6 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-xs hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* Brand Logo Header */}
        <div className="h-16 border-b border-neutral-200 flex items-center justify-center px-4 overflow-hidden">
          <Link href="/dashboard" className="flex items-center justify-center">
            {isCollapsed ? (
              <div className="relative h-8 w-8 scale-150 transform transition-transform">
                <Image
                  src="/fav.png"
                  alt="NORTHRE"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative h-8 w-36 scale-150 transform transition-transform flex items-center justify-center">
                <Image
                  src="/northre_logo.png"
                  alt="NORTHRE"
                  fill
                  priority
                  sizes="144px"
                  className="object-contain"
                />
              </div>
            )}
          </Link>
        </div>

        {/* Dynamic Nav Sections */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {ADMIN_NAV_CONFIG.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {/* Section Title */}
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                  {section.title}
                </div>
              )}

              {/* Section Divider */}
              {isCollapsed && idx !== 0 && (
                <div className="my-2 border-t border-neutral-100" />
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const isOpen = !!openMenus[item.title];

                  const isActive = hasChildren
                    ? item.children?.some((child) => pathname === child.href)
                    : pathname === item.href ||
                      (item.href !== "/dashboard" && item.href && pathname.startsWith(item.href));

                  if (hasChildren) {
                    return (
                      <div key={item.title} className="space-y-1">
                        {/* Parent Menu */}
                        <button
                          onClick={() => !isCollapsed && toggleSubmenu(item.title)}
                          title={isCollapsed ? item.title : undefined}
                          className={`w-full flex items-center text-xs font-semibold rounded-md transition-colors ${
                            isCollapsed
                              ? "justify-center h-10 w-full px-0"
                              : "justify-between px-3 py-2.5"
                          } ${
                            isActive
                              ? "bg-neutral-900 text-white"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                          }`}
                        >
                          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                            {Icon && <Icon size={18} className="shrink-0" />}
                            {!isCollapsed && <span>{item.title}</span>}
                          </div>

                          {!isCollapsed && (
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </button>

                        {/* Sub-menu Dropdown */}
                        {!isCollapsed && isOpen && (
                          <div className="pl-6 space-y-1 pt-1 border-l-2 border-neutral-100 ml-4">
                            {item.children?.map((child) => {
                              const isChildActive = pathname === child.href;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`block px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                                    isChildActive
                                      ? "bg-black text-white font-semibold"
                                      : "text-neutral-500 hover:bg-neutral-100 hover:text-black"
                                  }`}
                                >
                                  {child.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      title={isCollapsed ? item.title : undefined}
                      className={`flex items-center text-xs font-semibold rounded-md transition-colors ${
                        isCollapsed
                          ? "justify-center h-10 w-full px-0"
                          : "justify-between px-3 py-2.5"
                      } ${
                        isActive
                          ? "bg-black text-white"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                        {Icon && <Icon size={18} className="shrink-0" />}
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800 font-normal">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}