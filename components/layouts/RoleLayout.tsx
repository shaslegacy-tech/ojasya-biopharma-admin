// components/layouts/RoleLayout.tsx
"use client";
import React, { ReactNode } from "react";
import AdminSidebar from "./admin/Sidebar";
import AdminNavbar from "./admin/Navbar";

interface RoleLayoutProps {
  role: "admin";
  children: ReactNode;
}

export default function RoleLayout({ role, children }: RoleLayoutProps) {
    
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for Admin only */}
      {role === "admin" && <AdminSidebar />}

      <div className="flex-1 flex flex-col">
        {/* Navbar per role */}
        {role === "admin" && <AdminNavbar />} {/* or create AdminNavbar */}
        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
