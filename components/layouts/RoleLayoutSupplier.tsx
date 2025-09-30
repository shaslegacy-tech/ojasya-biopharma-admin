// components/layouts/RoleLayoutSupplier.tsx
"use client";
import React, { ReactNode, useState } from "react";
import SupplierSidebar from "./supplier/Sidebar";
import SupplierNavbar from "./supplier/Navbar";

interface RoleLayoutProps {
    role: "supplier";
  children: ReactNode;
}

export default function SupplierLayout({ role, children }: RoleLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <SupplierSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col">
        <SupplierNavbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
