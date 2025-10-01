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
      {/* Sidebar */}
      <SupplierSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"} 
        `}
      >
        <SupplierNavbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
