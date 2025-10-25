// components/layout/mr/MRLayout.tsx
"use client";
import React, { useEffect, useState } from "react";
import MRNavbar from "./mr/Navbar";
import MRSidebar from "./mr/Sidebar";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MRLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // auto-collapse on small screens
    const onResize = () => setCollapsed(window.innerWidth < 900);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggle = () => setCollapsed((s) => !s);

  const onLogout = async () => {
    try {
      await api.post("/auth/logout"); // clears cookie server-side
    } catch (err) {
      // swallow
    } finally {
      // client cleanups
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className={cn("flex-shrink-0 transition-all", collapsed ? "w-20" : "w-64")}>
        <MRSidebar collapsed={collapsed} />
      </div>

      <div className="flex-1 flex flex-col">
        <MRNavbar toggleSidebar={toggle} onLogout={onLogout} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}