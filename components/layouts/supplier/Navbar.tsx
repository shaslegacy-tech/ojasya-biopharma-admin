"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Menu, User, Search, Sun, Moon, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface SupplierNavbarProps {
  onToggleSidebar: () => void;
  onCreateQuick?: () => void;
  onLogout?: () => void;
  user?: { name?: string; email?: string; image?: string };
  darkMode?: boolean;
  setDarkMode?: (v: boolean) => void;
  onSearch?: (q: string) => void;
}

export default function SupplierNavbar({
  onToggleSidebar,
  onCreateQuick,
  onLogout,
  user,
  darkMode = false,
  setDarkMode,
  onSearch,
}: SupplierNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!avatarRef.current) return;
      if (!avatarRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (typeof onSearch !== "function") return;
    const id = setTimeout(() => onSearch(q.trim()), 220);
    return () => clearTimeout(id);
  }, [q, onSearch]);

  const initials = (user?.name || user?.email || "Supplier")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        "backdrop-blur-sm",
        scrolled ? "shadow-lg bg-white/70 dark:bg-slate-900/70" : "bg-transparent dark:bg-transparent"
      )}
      aria-hidden={false}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-3">
          {/* left: menu + brand */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 transition"
            >
              <Menu className="h-6 w-6 text-slate-700 dark:text-slate-200" />
            </button>

            <Link href="/supplier" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow">
                <span className="font-bold text-white">OB</span>
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ojasya Supplier</span>
                <span className="text-xs text-slate-500 dark:text-slate-300">Inventory · Orders · Invoices</span>
              </div>
            </Link>

            {/* search */}
            <div className="ml-4 flex-1 max-w-md">
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-full px-3 py-2 shadow-sm border border-transparent dark:border-slate-700">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products, batches, categories..."
                  className="ml-3 w-full bg-transparent outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* right: actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onCreateQuick) onCreateQuick();
                else toast("Create quick action");
              }}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600 shadow"
              title="Quick create"
            >
              <PlusSquare className="w-4 h-4" /> New
            </button>

            <button
              onClick={() => setDarkMode && setDarkMode(!darkMode)}
              title="Toggle dark"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            <button className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition" aria-label="Notifications">
              <Bell className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-rose-500 text-xs text-white">3</span>
            </button>

            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center text-slate-900 font-semibold">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.name ?? user?.email ?? "Supplier"}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-300">Manage account</span>
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden ring-1 ring-black/5 z-50">
                  <Link href="/supplier/profile" className="block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Profile</Link>
                  <Link href="/supplier/settings" className="block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Settings</Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}