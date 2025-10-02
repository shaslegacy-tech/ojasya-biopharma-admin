"use client";
import React, { useState, useRef, useEffect } from "react";
import { Menu, Bell, MessageSquare, ChevronDown, Search } from "lucide-react";
import Link from "next/link";

interface HospitalNavbarProps {
  toggleSidebar: () => void;
  user?: {
    firstName: string;
    lastName: string;
    image?: string;
  };
}

interface AvatarProps {
  firstName: string;
  lastName: string;
  imageUrl?: string;
}

export default function HospitalNavbar({ toggleSidebar, user }: HospitalNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "HU";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-16 bg-gradient-to-r from-[#0daba9]/90 via-[#78cfce]/80 to-[#1f9507]/70 shadow-md flex items-center justify-between px-6">
      
      {/* Left: Hamburger + Dashboard Title + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          className="p-2 rounded hover:bg-white/20 transition"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6 text-white" />
        </button>

        <h1 className="text-white text-xl font-bold hidden md:block">
          Hospital Dashboard
        </h1>

        {/* Search Bar */}
        <div className="relative hidden md:flex flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition"
          />
        </div>
      </div>

      {/* Right: Notifications, Messages, User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded hover:bg-white/20 transition">
          <Bell className="h-5 w-5 text-white" />
          <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Messages */}
        <button className="relative p-2 rounded hover:bg-white/20 transition">
          <MessageSquare className="h-5 w-5 text-white" />
          <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
          <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </button>

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 p-2 rounded hover:bg-white/20 transition"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt="User"
                className="h-8 w-8 rounded-full border-2 border-white"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0daba9] to-[#78cfce] flex items-center justify-center">
                <span className="text-lg font-bold text-black">{initials}</span>
              </div>
            )}
            <span className="text-white font-semibold hidden md:block">
              {user ? `${user.firstName} ${user.lastName}` : "Hospital User"}
            </span>
            <ChevronDown className="h-4 w-4 text-white" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-lg shadow-lg overflow-hidden z-50 animate-slide-down">
              <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 transition">
                Profile
              </Link>
              <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100 transition">
                Settings
              </Link>
              <Link href="/logout" className="block px-4 py-2 hover:bg-gray-100 transition">
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
