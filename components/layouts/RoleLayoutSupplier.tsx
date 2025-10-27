"use client";
import React, { useEffect, useState } from "react";
import SupplierSidebar from "./supplier/Sidebar";
import SupplierNavbar from "./supplier/Navbar";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface RoleLayoutSupplierProps {
  children: React.ReactNode;
  role?: string;
}

export default function RoleLayoutSupplier({ children }: RoleLayoutSupplierProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("supplier_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("supplier_dark") === "1";
    } catch {
      return false;
    }
  });

  const { logout, user } = useAuth();

  useEffect(() => {
    try {
      localStorage.setItem("supplier_sidebar_collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    try {
      localStorage.setItem("supplier_dark", darkMode ? "1" : "0");
    } catch {}
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await logout?.();
    } catch {
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className={cn("min-h-screen flex bg-slate-50 dark:bg-slate-900")}>
      <Toaster position="top-right" />
      <SupplierSidebar collapsed={collapsed} onToggle={(n) => setCollapsed(n)} />

      <div
        className={cn(
          "flex-1 flex flex-col transition-all min-h-screen",
          collapsed ? "pl-20 lg:pl-20" : "pl-64 lg:pl-64"
        )}
      >
        <SupplierNavbar
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onCreateQuick={() => (window.location.href = "/supplier/inventory")}
          onLogout={handleLogout}
          user={user ? { name: user.name, email: user.email } : undefined}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSearch={(q) => {
            // optional: broadcast search via URL param
            const url = new URL(window.location.href);
            if (q) url.searchParams.set("q", q);
            else url.searchParams.delete("q");
            window.history.replaceState({}, "", url.toString());
          }}
        />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}