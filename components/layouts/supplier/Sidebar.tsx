// components/layouts/supplier/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Package, FileText, BarChart } from "lucide-react";

export default function SupplierSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/supplier/dashboard", label: "Dashboard", icon: BarChart },
    { href: "/supplier/orders", label: "Orders", icon: FileText },
    { href: "/supplier/inventory", label: "Inventory", icon: Package },
    { href: "/supplier/profile", label: "Profile", icon: FileText },
  ];

  return (
    <aside className="h-full w-64 bg-gradient-to-b from-teal-700 to-green-600 text-white p-5">
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
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
