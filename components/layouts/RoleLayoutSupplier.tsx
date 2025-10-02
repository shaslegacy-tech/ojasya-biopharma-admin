"use client";

import { useState } from "react";
import SupplierSidebar from "../layouts/supplier/Sidebar";
import SupplierNavbar from "../layouts/supplier/Navbar";

interface RoleLayoutSupplierProps {
  children: React.ReactNode;
  role: string;
}

export default function RoleLayoutSupplier({ children }: RoleLayoutSupplierProps) {
  const [wide, setWide] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (fixed width, always visible) */}
      <div className="w-64 fixed top-0 left-0 h-full z-40">
        <SupplierSidebar />
      </div>

      {/* Main Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          wide ? "ml-64" : "ml-72"
        }`}
      >
        {/* Navbar */}
        <SupplierNavbar onToggleSidebar={() => setWide(!wide)} />

        {/* Dashboard Content */}
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
