// components/layouts/hospital/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClipboardList, FileText, User } from "lucide-react";

export default function HospitalSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: ClipboardList },
    { href: "/dashboard/orders", label: "Orders", icon: FileText },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  ];

  return (
    <aside className="h-full w-64 bg-gradient-to-b from-cyan-700 to-teal-600 text-white p-5">
      <h2 className="text-xl font-bold mb-8">Hospital Panel</h2>
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
