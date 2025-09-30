// components/layouts/hospital/Navbar.tsx
"use client";
import { Bell, UserCircle } from "lucide-react";

export default function HospitalNavbar() {
  return (
    <nav className="w-full h-16 bg-white shadow flex justify-between items-center px-6">
      <h1 className="text-lg font-semibold text-teal-700">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
        <UserCircle className="w-8 h-8 text-gray-700 cursor-pointer" />
      </div>
    </nav>
  );
}
