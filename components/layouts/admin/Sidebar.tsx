// components/layouts/admin/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
   Users,
  Building,
  FileText,
  BarChart,
  DollarSign,
  Package,
  Settings,
  ClipboardList,
 } from "lucide-react";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart },
    { href: "/admin/hospitals", label: "Hospitals", icon: Building },
    { href: "/admin/suppliers", label: "Suppliers", icon: Users },
    { href: "/admin/orders", label: "Orders", icon: FileText },
    { href: "/admin/inventory", label: "Inventory", icon: Package },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart },
    { href: "/admin/commissions", label: "Commissions", icon: DollarSign },
    { href: "/admin/reports", label: "Reports", icon: ClipboardList },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-gradient-to-b from-purple-700 to-indigo-600 text-white p-5 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 text-white hover:text-gray-200"
      >
        {collapsed ? "➡️" : "⬅️"}
      </button>
      <h2 className={cn("text-xl font-bold mb-8", collapsed && "hidden")}>Admin Panel</h2>
      <ul className="space-y-4 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 transition",
                  pathname === link.href && "bg-white/30 font-semibold"
                )}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {!collapsed && (
        <div className="mt-auto">
          <button
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 w-full"
            onClick={() => {
              localStorage.removeItem("authToken");
              window.location.href = "/auth/login";
            }}
          >
            <Users className="h-5 w-5" />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
