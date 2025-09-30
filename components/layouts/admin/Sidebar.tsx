// components/layouts/admin/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, Building, FileText, BarChart } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart },
    { href: "/admin/hospitals", label: "Hospitals", icon: Building },
    { href: "/admin/suppliers", label: "Suppliers", icon: Users },
    { href: "/admin/orders", label: "Orders", icon: FileText },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart },
    { href: "/admin/commissions", label: "Commissions", icon: FileText },
  ];

  return (
    <aside className="h-full w-64 bg-gradient-to-b from-purple-700 to-indigo-600 text-white p-5">
      <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
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
