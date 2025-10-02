"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Package, FileText, BarChart2, Users, LogOut } from "lucide-react";

export default function SupplierSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/supplier/dashboard", label: "Dashboard", icon: BarChart2 },
    { href: "/supplier/orders", label: "Orders", icon: FileText },
    { href: "/supplier/inventory", label: "Inventory", icon: Package },
    { href: "/supplier/hospitals", label: "Hospitals", icon: Users },
    { href: "/supplier/reports", label: "Reports", icon: BarChart2 },
  ];

  return (
    <aside
      className={cn(
        "h-full w-64 fixed top-0 left-0 z-50 flex flex-col",
        "bg-gradient-to-b from-emerald-600 via-teal-600 to-green-700",
        "text-white shadow-xl"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-center border-b border-white/20">
        <h2 className="text-lg font-bold tracking-wide">Supplier Panel</h2>
      </div>

      {/* Nav Links */}
      <ul className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  active
                    ? "bg-white/20 text-white font-semibold shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <div className="p-4 border-t border-white/20">
        <button
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          onClick={() => {
            localStorage.removeItem("authToken");
            window.location.href = "/auth/login";
          }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
