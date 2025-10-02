"use client";
import React, { ReactNode, useState } from "react";
import HospitalSidebar from "./hospital/Sidebar";
import HospitalNavbar from "./hospital/Navbar";

interface RoleLayoutProps {
  role: "hospital";
  children: ReactNode;
}

export default function RoleLayoutHospital({ role, children }: RoleLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {role === "hospital" && (
        <HospitalSidebar collapsed={sidebarCollapsed} />
      )}

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        {role === "hospital" && <HospitalNavbar toggleSidebar={toggleSidebar} />}

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-inner p-6 min-h-full transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
