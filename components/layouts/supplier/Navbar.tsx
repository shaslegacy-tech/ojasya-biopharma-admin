"use client";

import { Bell, Menu, User } from "lucide-react";
import { useEffect, useState } from "react";

interface SupplierNavbarProps {
  onToggleSidebar: () => void;
}

export default function SupplierNavbar({ onToggleSidebar }: SupplierNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 5);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between px-6 py-3 transition-all duration-300 backdrop-blur-md ${
        scrolled ? "shadow-md bg-white/80" : "bg-white"
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Ojasya Supplier Dashboard</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell className="h-6 w-6 text-gray-700" />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition">
          <User className="h-6 w-6 text-gray-700" />
          <span className="hidden sm:block font-medium text-gray-700">Supplier</span>
        </button>
      </div>
    </header>
  );
}
