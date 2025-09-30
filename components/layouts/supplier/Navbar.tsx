// components/layouts/supplier/Navbar.tsx
"use client";
import { Bell, UserCircle, Menu } from "lucide-react";

interface SupplierNavbarProps {
  onToggleSidebar: () => void;
}

export default function SupplierNavbar({ onToggleSidebar }: SupplierNavbarProps) {
  return (
    <nav className="w-full h-16 bg-white shadow flex justify-between items-center px-6">
      <div className="flex items-center gap-4">
        <Menu className="w-6 h-6 cursor-pointer lg:hidden" onClick={onToggleSidebar} />
        <h1 className="text-lg font-semibold text-gray-800">Supplier Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
        <UserCircle className="w-8 h-8 text-gray-700 cursor-pointer" />
      </div>
    </nav>
  );
}
