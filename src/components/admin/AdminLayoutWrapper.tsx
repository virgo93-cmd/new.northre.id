"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AdminFooter from "./AdminFooter";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Jika sedang di halaman login admin, render polos
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-screen flex bg-neutral-100 text-neutral-950 overflow-hidden">
      {/* Sidebar tetap di kiri */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />
      
      {/* Container utama sebelah kanan */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar di atas */}
        <Topbar />
        
        {/* Area konten yang bisa di-scroll secara independen */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
        
        {/* Footer fixed menempel rapi di bawah area konten kanan tanpa perlu scroll */}
        <AdminFooter />
      </div>
    </div>
  );
}