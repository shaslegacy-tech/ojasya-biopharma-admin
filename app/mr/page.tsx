// app/mr/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import HospitalCard from "@/components/mr/HospitalCard";
import { formatDate, cn } from "@/lib/utils";
import { Search, Plus, CalendarDays, Filter, RefreshCw } from "lucide-react";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type Hospital = {
  _id: string;
  name: string;
  city?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  approved?: boolean;
};

export default function MRHomePage() {
  const { user } = useAuth();
  const { data, error, isValidating, mutate } = useSWR("/mr/hospitals", fetcher, { revalidateOnFocus: false });
  const hospitals: Hospital[] = data?.hospitals ?? [];

  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const cities = useMemo(() => Array.from(new Set(hospitals.map((h) => h.city).filter((v): v is string => !!v))), [hospitals]);

  const filtered = hospitals.filter((h) => {
    const term = q.trim().toLowerCase();
    const matchQ = term
      ? (h.name ?? "").toLowerCase().includes(term) || (h.city ?? "").toLowerCase().includes(term) || (h.contactPerson ?? "").toLowerCase().includes(term)
      : true;
    const matchCity = city ? h.city === city : true;
    return matchQ && matchCity;
  });

  const kpis = useMemo(() => ({
    assigned: hospitals.length,
    upcomingVisits: Math.max(0, Math.round(hospitals.length * 0.22)),
    pendingOrders: Math.max(0, Math.round(hospitals.length * 0.12)),
  }), [hospitals]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
      {/* HERO */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6 mb-8 shadow-xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Welcome back, <span className="underline decoration-white/30">{user?.name ?? (user?.email?.split('@')[0] ?? 'MR')}</span></h1>
            <p className="mt-2 text-slate-100/90 max-w-xl">Manage your hospitals, visits and orders from a single place. Quick actions and insights are available below.</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/mr/hospitals/new" className="inline-flex items-center gap-2 bg-white/95 text-emerald-700 px-4 py-2 rounded-lg font-semibold shadow-md hover:scale-[1.02] transition">
                <Plus className="w-4 h-4" /> New Hospital
              </Link>

              <Link href="/mr/visits/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 text-white/95 hover:bg-white/10 transition">
                <CalendarDays className="w-4 h-4" /> Schedule Visit
              </Link>

              <button onClick={() => mutate()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end text-right">
            <div className="text-sm text-white/90">Last synced</div>
            <div className="mt-1 text-lg font-semibold">{formatDate(new Date())}</div>
            <div className="mt-4 text-xs bg-white/12 px-3 py-1 rounded-full">Signed in as <span className="font-medium">{user?.email?.split('@')[0] ?? 'MR'}</span></div>
          </div>
        </div>
        {/* subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/6 rounded-full blur-3xl" />
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 rounded-2xl shadow-md border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Assigned Hospitals</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.assigned}</div>
            </div>
            <div className="text-emerald-600 bg-emerald-50 p-2 rounded-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13L12 4L21 13" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-500">Manage visits & stock for each hospital</div>
        </div>

        <div className="p-5 bg-gradient-to-br from-sky-50 via-white to-sky-100/40 rounded-2xl shadow-md border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Upcoming Visits</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.upcomingVisits}</div>
            </div>
            <div className="text-sky-600 bg-sky-50 p-2 rounded-lg"><CalendarDays className="w-5 h-5" /></div>
          </div>
          <div className="mt-3 text-sm text-slate-500">Plan your daily rounds efficiently</div>
        </div>

        <div className="p-5 bg-gradient-to-br from-rose-50 via-white to-rose-100/40 rounded-2xl shadow-md border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Pending Orders</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.pendingOrders}</div>
            </div>
            <div className="text-rose-600 bg-rose-50 p-2 rounded-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          </div>
          <div className="mt-3 text-sm text-slate-500">Orders that need attention</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-2/3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search className="w-4 h-4" /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hospitals, contact or city" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
          </div>

          <div className="relative">
            <select value={city} onChange={(e) => setCity(e.target.value)} className="appearance-none pl-3 pr-8 py-3 rounded-xl bg-white border border-slate-100 shadow-sm outline-none">
              <option value="">All cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Filter className="w-4 h-4" /></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => mutate()} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition">Refresh</button>
          <Link href="/mr/hospitals/new" className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:scale-[1.02] transition"><Plus className="w-4 h-4" /> Add</Link>
        </div>
      </div>

      {/* Grid of hospitals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Assigned Hospitals</h3>
          <div className="text-sm text-slate-500">Showing {filtered.length} of {hospitals.length}</div>
        </div>

        {error && <div className="p-4 rounded border border-rose-100 bg-rose-50 text-rose-700">Failed to load assigned hospitals</div>}

        {hospitals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center text-slate-500">No hospitals assigned yet. Ask admin to assign hospitals or create a new one.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isValidating && hospitals.length === 0 ? (
              // loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-white/50 animate-pulse" />
              ))
            ) : (
              filtered.map((h) => (
                <Link key={h._id} href={`/mr/hospitals/${h._id}`} className="block">
                  <HospitalCard hospital={h} />
                </Link>
              ))
            )}
          </div>
        )}
      </section>

      <div className="mt-8 p-4 rounded-lg bg-white border border-slate-100 shadow-inner text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <div>Last synced: {formatDate(new Date())}</div>
          <div>Need help? <Link href="/support" className="text-emerald-600 font-medium">Contact support</Link></div>
        </div>
      </div>
    </div>
  );
}