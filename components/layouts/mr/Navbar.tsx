// components/layouts/mr/Navbar.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Menu, Bell, MessageSquare, ChevronDown, Search, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { randomGradient, hashToGradient } from "@/lib/utils";

export default function MRNavbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, loading } = useAuth();

  const avatarGradient = user?.id ? hashToGradient(user.id) : "from-blue-400 to-indigo-400";


  type UserWithImage = { image?: string; name?: string; firstName?: string; lastName?: string; email?: string; role?: string } & Record<string, unknown>;
  const userImage = ((user as unknown) as UserWithImage)?.image;

  // derive a friendly display name with sensible fallbacks
  const displayName =
    user?.name ||
    (((user as unknown) as UserWithImage)?.firstName
      ? `${(((user as unknown) as UserWithImage).firstName ?? "").toString()} ${(((user as unknown) as UserWithImage).lastName ?? "").toString()}`.trim()
      : undefined) ||
    (((user as unknown) as UserWithImage)?.email ? (((user as unknown) as UserWithImage).email ?? "").toString().split("@")[0] : undefined) ||
    "MR";

  const email = ((user as unknown) as UserWithImage)?.email;
  const role = ((user as unknown) as UserWithImage)?.role ?? "MR";

  // Handle dropdown close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (displayName && displayName.split(" ").map((n) => n[0]).join("").toUpperCase()) || "MR";

  return (
    <header className="w-full h-16 bg-gradient-to-r from-[#0daba9] via-[#1f9507a7] to-[#0b6e5e] shadow-md flex items-center justify-between px-6">
      {/* Left Section: Hamburger + Title */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-white/20 transition" onClick={toggleSidebar}>
          <Menu className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-white text-xl font-bold hidden md:block">Ojasya MR Dashboard</h1>
      </div>

      {/* Middle: Search */}
      <div className="hidden md:flex items-center bg-white/20 rounded-lg px-3 py-1.5 w-1/3">
        <Search className="h-4 w-4 text-white mr-2" />
        <input
          type="text"
          placeholder="Search hospitals or tasks..."
          className="flex-1 bg-transparent text-white placeholder-white/80 outline-none"
          suppressHydrationWarning
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-white/20 transition">
          <Bell className="h-5 w-5 text-white" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        {/* Messages */}
        <button className="relative p-2 rounded-lg hover:bg-white/20 transition">
          <MessageSquare className="h-5 w-5 text-white" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/20 transition" onClick={() => setDropdownOpen(!dropdownOpen)} aria-haspopup="true" aria-expanded={dropdownOpen}>
            {userImage ? (
              <img src={userImage} alt="User" className="h-8 w-8 rounded-full border-2 border-white" />
            ) : (
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center`}>
                <span className="text-lg font-bold text-black">{initials}</span>
              </div>
            )}

            <div className="hidden md:flex flex-col">
              <span className="text-white font-medium">{loading ? <span className="opacity-80 animate-pulse">Fetching…</span> : displayName}</span>
              <span className="text-xs text-white/80">{role}</span>
            </div>

            <ChevronDown className="h-4 w-4 text-white" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-gradient-to-br from-white/95 via-white/95 to-white/95 rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-black/5 flex items-center gap-3">
                {userImage ? (
                  <img src={userImage} alt="avatar" className="h-12 w-12 rounded-full ring-2 ring-white object-cover" />
                ) : (
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${randomGradient()} flex items-center justify-center text-lg font-bold text-slate-800`}>{initials}</div>
                )}
                <div>
                  <div className="font-semibold text-slate-900">{displayName}</div>
                  <div className="text-sm text-slate-600">{email ?? "—"}</div>
                </div>
              </div>

              {/* Links */}
              <div className="p-2">
                <Link href="/mr/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                  <User className="w-4 h-4 text-slate-700" />
                  <span className="text-sm text-slate-800">Profile</span>
                </Link>

                <Link href="/mr/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition mt-1">
                  <Settings className="w-4 h-4 text-slate-700" />
                  <span className="text-sm text-slate-800">Settings</span>
                </Link>
              </div>

              <div className="border-t border-black/5 p-3">
                <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}