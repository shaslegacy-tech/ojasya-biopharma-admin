// components/layouts/supplier/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Package, FileText, BarChart, Users, LogOut } from "lucide-react";
import { useState } from "react";

interface SupplierSidebarProps {
  isOpen: boolean; // mobile only
  onClose: () => void;
}

export default function SupplierSidebar({ isOpen, onClose }: SupplierSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false); // desktop collapsed

  const links = [
    { href: "/supplier/dashboard", label: "Dashboard", icon: BarChart },
    { href: "/supplier/orders", label: "Orders", icon: FileText },
    { href: "/supplier/inventory", label: "Inventory", icon: Package },
    { href: "/supplier/hospitals", label: "Hospitals", icon: Users },
    { href: "/supplier/reports", label: "Reports", icon: BarChart },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 bg-gradient-to-b from-teal-800 via-green-700 to-teal-600 text-white p-4 flex flex-col justify-between shadow-xl z-50 transition-all duration-300 rounded-r-3xl",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64", // mobile slide
          "lg:translate-x-0", // desktop always visible
          collapsed ? "lg:w-20" : "lg:w-64" // desktop collapsed width
        )}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        {/* Logo */}
        <div className="mb-10 flex items-center justify-between">
          {!collapsed ? (
            <h2 className="text-2xl font-extrabold tracking-wide drop-shadow-lg">
              Ojasya Supplier
            </h2>
          ) : (
            <h2 className="text-2xl font-extrabold drop-shadow-lg">OS</h2>
          )}
        </div>

        {/* Links */}
        <ul className="space-y-4 flex-1">
          {links.map(link => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg text-lg font-semibold transition-all duration-200 hover:bg-white/20 hover:translate-x-1 hover:shadow-lg",
                    active ? "bg-white/30 text-white shadow-inner" : "text-white/90"
                  )}
                  onClick={onClose}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-transform duration-200",
                      active ? "text-white" : "text-green-200 group-hover:text-white"
                    )}
                  />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <div className="mt-auto">
          <button
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg hover:bg-white/20 transition-all duration-200",
              collapsed ? "justify-center" : "justify-start"
            )}
            onClick={() => {
              localStorage.removeItem("authToken");
              window.location.href = "/auth/login";
            }}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
