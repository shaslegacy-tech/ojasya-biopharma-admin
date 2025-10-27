"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Box,
  Home,
  List,
  FileText,
  PieChart,
  Users,
  Settings,
  LogOut,
  BarChart2,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: (next: boolean) => void;
}

const groups = [
  {
    title: "Core",
    items: [
      { href: "/supplier", label: "Dashboard", icon: Home },
      { href: "/supplier/inventory", label: "Inventory", icon: Box },
      { href: "/supplier/orders", label: "Orders", icon: List },
      { href: "/supplier/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    title: "Manage",
    items: [
      { href: "/supplier/reports", label: "Reports", icon: PieChart },
      { href: "/supplier/clients", label: "Clients", icon: Users },
      { href: "/supplier/analytics", label: "Analytics", icon: BarChart2 },
    ],
  },
  {
    title: "Settings",
    items: [{ href: "/supplier/settings", label: "Settings", icon: Settings }],
  },
];

export default function SupplierSidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname() || "/";
  const selected = useMemo(() => pathname.split("?")[0], [pathname]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col transition-all",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "h-full flex flex-col bg-gradient-to-b from-emerald-600 to-teal-600 text-white shadow-xl",
          collapsed ? "items-center" : "items-stretch"
        )}
      >
        <div className={cn("h-16 px-4 flex items-center", collapsed ? "justify-center" : "justify-start")}>
          <div className={cn("flex items-center gap-3", collapsed ? "flex-col" : "")}>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white">OB</div>
            {!collapsed && <div className="text-sm font-bold">Supplier Panel</div>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {groups.map((g) => (
            <div key={g.title} className="mb-4">
              {!collapsed && <div className="px-2 text-xs uppercase text-white/80 font-semibold mb-2">{g.title}</div>}
              <ul className="space-y-1">
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const active = selected === it.href;
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition",
                          active
                            ? "bg-white/20 text-white shadow"
                            : "text-white/90 hover:bg-white/10"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {!collapsed && <span className="truncate">{it.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle?.(!collapsed)}
              className="w-full text-sm px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition flex items-center gap-2 justify-center"
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
          </div>

          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="mt-3 w-full text-sm px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition flex items-center gap-2 justify-center"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}