// components/layout/mr/MRSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import { ClipboardList, FileText, Users, Activity, User, CreditCard } from "lucide-react";

interface Item { href: string; label: string; Icon: React.ComponentType<{ className?: string }>; }

const links: Item[] = [
  { href: "/mr", label: "Overview", Icon: ClipboardList },
  { href: "/mr/orders", label: "Orders", Icon: FileText },
  { href: "/mr/hospitals", label: "Assigned Hospitals", Icon: Users },
  { href: "/mr/visits", label: "Visits", Icon: Activity },
  { href: "/mr/profile", label: "Profile", Icon: User },
  { href: "/mr/invoices", label: "Invoices", Icon: CreditCard },
];

interface MRSidebarProps { collapsed?: boolean; }

export default function MRSidebar({ collapsed = false }: MRSidebarProps) {
  const pathname = usePathname();
  return (
    <aside className={cn("h-full flex flex-col bg-gradient-to-b from-slate-900/95 to-slate-800/95 text-white shadow-2xl transition-all", collapsed ? "w-20" : "w-64")}>
      <div className="flex items-center gap-3 p-4 border-b border-white/6">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-slate-900">OB</div>
        {!collapsed && <div className="text-lg font-semibold">Ojasya Biopharma</div>}
      </div>

      <nav className="flex-1 overflow-auto px-2 py-4">
        <ul className="space-y-1">
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <li key={href}>
                <Link href={href} className={cn("group flex items-center gap-3 px-3 py-3 rounded-lg transition-colors", active ? "bg-white/10 ring-1 ring-white/10 text-white font-semibold" : "hover:bg-white/6 text-white/90")}>
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span className="text-sm">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-white/6">
        <button className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-900 font-semibold hover:scale-[1.01] transition-transform">Quick Actions</button>
      </div>
    </aside>
  );
}