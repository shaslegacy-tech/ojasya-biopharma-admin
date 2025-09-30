// components/layouts/admin/Navbar.tsx
"use client";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useState } from "react";

export default function AdminNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full h-16 bg-white shadow flex justify-between items-center px-6">
      <div className="flex items-center gap-4">
        <Menu
          className="w-6 h-6 cursor-pointer lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        />
        <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
        <div className="relative">
          <UserCircle className="w-8 h-8 text-gray-700 cursor-pointer" />
          <div
            className={`absolute right-0 mt-2 w-48 bg-white shadow-lg rounded ${
              menuOpen ? "block" : "hidden"
            }`}
          >
            <button
              onClick={() => {
                localStorage.removeItem("authToken");
                window.location.href = "/auth/login";
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
