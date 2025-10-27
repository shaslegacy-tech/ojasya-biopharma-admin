// app/mr/profile/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Edit2, Mail, Phone, Copy, ExternalLink } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IUser } from "@/types";

// small ClientOnly helper: renders nothing on server, renders children after hydration
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

const fetcher = (url: string) => api.get(url).then((r) => r.data);

// small stat card
function StatCard({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-4 rounded-lg bg-white/90 shadow-sm border border-slate-100", className ?? "") }>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-bold text-lg text-slate-900">{value}</div>
    </div>
  );
}

export default function MRProfilePage() {
  const { user, login, logout } = useAuth();
  const userId = user?.id;
  const { data, error, mutate, isValidating } = useSWR(userId ? `/users/${userId}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  // local server user shape support { user } or direct
  const serverUser = useMemo<IUser | undefined>(() => {
    if (!data) return undefined;
    if (typeof data === "object" && (data as any).user) return (data as any).user as IUser;
    return data as IUser;
  }, [data]);

  // fetch quick stats (assigned hospitals count) and recent orders
  const { data: assignedData } = useSWR(userId ? `/mr/hospitals?summary=true` : null, fetcher, { revalidateOnFocus: false });
  // recent orders list (shows recent items)
  const { data: ordersData } = useSWR(userId ? `/mr/orders?limit=6` : null, fetcher, { revalidateOnFocus: false });
  // summary endpoints (we request a small page to obtain totals when available)
  const { data: ordersSummary } = useSWR(userId ? `/mr/orders?limit=1` : null, fetcher, { revalidateOnFocus: false });
  // visits (visit notes) summary — backend may return { total } or an array; we ask for 1 item to get meta totals if supported
  const { data: visitsData } = useSWR(userId ? `/mr/visit-notes/summary` : null, fetcher, { revalidateOnFocus: false });

  const assignedCount = useMemo<number>(() => {
    if (!assignedData) return 0;
    if (typeof assignedData === "number") return assignedData;
    if ((assignedData as any).assignedCount !== undefined) return Number((assignedData as any).assignedCount) || 0;
    if (Array.isArray(assignedData)) return assignedData.length;
    if ((assignedData as any).count !== undefined) return Number((assignedData as any).count) || 0;
    return 0;
  }, [assignedData]);

  // derive order count (tries several common response shapes)
  const orderCount = useMemo<number>(() => {
    const src = ordersSummary ?? ordersData;
    if (!src) return 0;
    if (typeof src === "number") return src;
    if ((src as any).total !== undefined) return Number((src as any).total) || 0;
    if ((src as any).count !== undefined) return Number((src as any).count) || 0;
    if (Array.isArray((src as any).items)) return (src as any).items.length;
    if (Array.isArray((src as any).orders)) return (src as any).orders.length;
    if (Array.isArray(src)) return src.length;
    return 0;
  }, [ordersSummary, ordersData]);

  // derive visit count (attempts to read common shapes)
  const visitCount = useMemo<number>(() => {
    if (!visitsData) return 0;
    if (typeof visitsData === "number") return visitsData;
    if ((visitsData as any).total !== undefined) return Number((visitsData as any).total) || 0;
    if ((visitsData as any).count !== undefined) return Number((visitsData as any).count) || 0;
    if (Array.isArray((visitsData as any).visits)) return (visitsData as any).visits.length;
    if (Array.isArray(visitsData)) return visitsData.length;
    return 0;
  }, [visitsData]);

  // ensure recentOrders is always an array to avoid map errors
  const recentOrders = useMemo<any[]>(() => {
    if (!ordersData) return [];
    if (Array.isArray(ordersData)) return ordersData as any[];
    if (Array.isArray((ordersData as any).orders)) return (ordersData as any).orders as any[];
    if (Array.isArray((ordersData as any).items)) return (ordersData as any).items as any[];
    // sometimes API returns { data: [...] }
    if (Array.isArray((ordersData as any).data)) return (ordersData as any).data as any[];
    // if listMyOrders returned { items, total } treat items as recent mini list
    if (Array.isArray((ordersData as any).items)) return (ordersData as any).items as any[];
    return [];
  }, [ordersData]);

  // client-side formatted dates to avoid SSR/CSR hydration mismatch
  const [formattedOrderDates, setFormattedOrderDates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!recentOrders) return;
    const map: Record<string, string> = {};
    for (const o of recentOrders) {
      try {
        map[o._id] = new Date(o.createdAt).toLocaleString();
      } catch (_) {
        map[o._id] = String(o.createdAt ?? "");
      }
    }
    setFormattedOrderDates(map);
  }, [recentOrders]);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (serverUser) {
      setForm({ name: serverUser.name ?? "", phone: serverUser.phone ?? "" });
    }
  }, [serverUser]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!userId) return toast.error("No user");
    if (!form.name?.trim()) return toast.error("Name is required");
    try {
      await api.put(`/users/${userId}`, { name: form.name.trim(), phone: form.phone.trim() });
      toast.success("Profile updated");
      setEditOpen(false);
      // revalidate server user and auth /me
      mutate();
      await login();
    } catch (err: unknown) {
      const maybe = err as { response?: { data?: { message?: string } }; message?: string } | undefined;
      const msg = maybe?.response?.data?.message ?? (maybe?.message ?? "Failed to save");
      toast.error(String(msg));
    }
  }, [form, userId, mutate, login]);

  const initials = (serverUser?.name ?? user?.email ?? "MR")
    .split(" ")
    .map((s) => (s ? s[0] : ""))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCopyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(userId ?? "");
      toast.success("User id copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  }, [userId]);

  if (!user) return <div className="p-6">Please login to view profile.</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load profile</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <ClientOnly>
              <div
                aria-hidden
                className="w-24 h-24 rounded-full bg-white/18 flex items-center justify-center text-3xl font-extrabold text-white border border-white/20"
              >
                {initials}
              </div>
            </ClientOnly>

            <div>
              <ClientOnly>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{serverUser?.name ?? user.email}</h1>
              </ClientOnly>
              <p className="mt-1 text-sm opacity-90">Medical Representative • <span className="font-medium">{serverUser?.email ?? user.email}</span></p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <Mail className="w-4 h-4" /> {serverUser?.email ?? "—"}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <Phone className="w-4 h-4" /> {serverUser?.phone ?? "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
            >
              <Edit2 className="w-4 h-4" /> Edit profile
            </button>

            <button
              title="Copy id"
              onClick={handleCopyId}
              className="inline-flex items-center gap-2 bg-white/8 px-3 py-2 rounded-lg hover:bg-white/20 transition text-white"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                logout();
              }}
              className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-emerald-700 font-semibold hover:opacity-95 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Overview</h3>
                <p className="text-sm text-slate-500">Quick actions, recent orders and visit activity live here.</p>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/mr/hospitals" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-emerald-50 text-emerald-700">
                  <ExternalLink className="w-4 h-4" /> Assigned hospitals
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <StatCard label="Assigned hospitals" value={isValidating ? "…" : assignedCount ?? "—"} />
              <StatCard label="Orders (all)" value={isValidating ? "…" : orderCount ?? "—"} />
              <StatCard label="Visits (all)" value={isValidating ? "…" : visitCount ?? "—"} />
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recent Orders</h4>
              {recentOrders.length === 0 ? (
                <div className="text-sm text-slate-500">No recent orders placed via MR portal.</div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((o: any) => (
                    <div key={o._id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-100">
                      <div>
                        <div className="text-sm font-medium">#{o.orderNo ?? String(o._id).slice(-6)} • {o.status}</div>
                        <div className="text-xs text-slate-500">{o.items?.length ?? 0} items • ₹{o.totalAmount ?? o.totalPrice ?? 0}</div>
                      </div>
                      <ClientOnly>
                        <div className="text-sm text-slate-400">{formattedOrderDates[o._id] ?? ""}</div>
                      </ClientOnly>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <h4 className="font-semibold mb-3">Quick Actions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/mr/hospitals" className="block p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition">
                <div className="text-sm text-emerald-700 font-semibold">View Assigned Hospitals</div>
                <div className="text-xs text-slate-500 mt-1">Open the list to manage visits and orders</div>
              </Link>

              <Link href="/mr/orders" className="block p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                <div className="text-sm font-semibold">My Orders</div>
                <div className="text-xs text-slate-500 mt-1">See all orders you placed</div>
              </Link>

              <Link href="/mr/visits/new" className="block p-4 rounded-lg bg-sky-50 hover:bg-sky-100 transition">
                <div className="text-sm font-semibold text-sky-700">Create Visit Note</div>
                <div className="text-xs text-slate-500 mt-1">Record observations quickly</div>
              </Link>

              <Link href="/mr/profile/settings" className="block p-4 rounded-lg bg-white border hover:shadow-sm transition">
                <div className="text-sm font-semibold">Profile Settings</div>
                <div className="text-xs text-slate-500 mt-1">Update contact & availability</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <h4 className="font-semibold">Contact & ID</h4>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div><span className="text-slate-400">Name</span> <div className="font-medium">{serverUser?.name ?? user.email}</div></div>
              <div><span className="text-slate-400">Email</span> <div className="font-medium">{serverUser?.email ?? user.email}</div></div>
              <div><span className="text-slate-400">Phone</span> <div className="font-medium">{serverUser?.phone ?? "—"}</div></div>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={handleCopyId} className="px-3 py-1 rounded bg-slate-50 text-sm">Copy ID</button>
                <Link href={`/mr/hospitals`} className="px-3 py-1 rounded bg-emerald-50 text-emerald-700">Assigned hospitals</Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow text-sm text-slate-600">
            <h4 className="font-semibold mb-2">Account</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-slate-500">Role</div>
                <div className="font-medium">{serverUser?.role ?? user.role}</div>
              </div>
                <div className="flex items-center justify-between">
                  <div className="text-slate-500">Joined</div>
                  <ClientOnly>
                    <div className="font-medium">{"—"}</div>
                  </ClientOnly>
                </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="p-2">
          <h3 className="text-lg font-semibold mb-3">Edit Profile</h3>
          <div className="space-y-3">
            <label className="block">
              <div className="text-sm mb-1">Name</div>
              <input className="w-full px-3 py-2 border rounded" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            </label>
            <label className="block">
              <div className="text-sm mb-1">Phone</div>
              <input className="w-full px-3 py-2 border rounded" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
            </label>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setEditOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={handleSave} className="px-3 py-1 bg-emerald-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}