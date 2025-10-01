"use client";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useState } from "react";

interface SupplierNavbarProps {
  onToggleSidebar: () => void;
}

export default function SupplierNavbar({ onToggleSidebar }: SupplierNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="w-full h-16 bg-white shadow-md flex justify-between items-center px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <Menu className="w-6 h-6 cursor-pointer lg:hidden text-gray-700" onClick={onToggleSidebar} />
        <h1 className="text-xl font-bold text-gray-800">Supplier Dashboard</h1>
      </div>

      <div className="flex items-center gap-6 relative">
        {/* Notification */}
        <div className="relative cursor-pointer">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 animate-pulse" />
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <UserCircle
            className="w-8 h-8 text-gray-700 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-30">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                onClick={() => {
                  localStorage.removeItem("authToken");
                  window.location.href = "/auth/login";
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
