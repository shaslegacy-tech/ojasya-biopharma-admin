// components/layouts/supplier/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Package, FileText, BarChart, Users } from "lucide-react";

interface SupplierSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupplierSidebar({ isOpen, onClose }: SupplierSidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/supplier/dashboard", label: "Dashboard", icon: BarChart },
    { href: "/supplier/orders", label: "Orders", icon: FileText },
    { href: "/supplier/inventory", label: "Inventory", icon: Package },
    { href: "/supplier/hospitals", label: "Hospitals", icon: Users },
    { href: "/supplier/reports", label: "Reports", icon: BarChart },
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 bg-gradient-to-b from-green-600 to-teal-500 text-white p-5 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <h2 className="text-xl font-bold mb-8">Supplier Panel</h2>
        <ul className="space-y-4">
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
                  onClick={onClose}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto">
          <button
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 w-full"
            onClick={() => {
              localStorage.removeItem("authToken");
              window.location.href = "/auth/login";
            }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
