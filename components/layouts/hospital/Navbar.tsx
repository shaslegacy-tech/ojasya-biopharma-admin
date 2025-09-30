// components/layouts/hospital/Navbar.tsx
"use client";
import { Bell, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function HospitalNavbar() {
    const { user, logout } = useAuth();
    
  return (
    <nav className="w-full h-16 bg-white shadow flex justify-between items-center px-6">
      <h1 className="text-lg font-semibold text-teal-700">Hospital Dashboard</h1>
      <div className="flex items-center gap-4">
        <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
        <UserCircle className="w-8 h-8 text-gray-700 cursor-pointer" />
        <div className="flex items-center gap-4">
        {user && <span>{user.email}</span>}
        <button
          onClick={logout}
          className="bg-white text-teal-600 px-3 py-1 rounded-md"
        >
          Logout
        </button>
      </div>
      </div>
    </nav>
  );
}
