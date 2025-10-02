"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClipboardList, FileText, User, CreditCard } from "lucide-react";
import { Tooltip } from "react-tooltip";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const links: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: ClipboardList },
  { href: "/dashboard/orders", label: "Orders", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/invoices", label: "Invoices", icon: CreditCard },
];

interface HospitalSidebarProps {
  collapsed: boolean;
}

export default function HospitalSidebar({ collapsed }: HospitalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-full flex flex-col bg-gradient-to-b from-[#0a8780] via-[#0daba9] to-[#78cfce] text-white shadow-lg transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Branding / Logo */}
      <div className="flex items-center justify-center p-4 border-b border-white/20">
        <span className="font-bold text-2xl transition-all duration-300">
          {collapsed ? "OB" : "Ojasya Biopharma"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4">
        <ul className="space-y-2">
          {links.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                  pathname === href
                    ? "bg-white/30 font-semibold text-white"
                    : "hover:bg-white/20 text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <button className="w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 transition">
          {!collapsed ? "Settings" : "⚙️"}
        </button>
      </div>
    </aside>
  );
}
