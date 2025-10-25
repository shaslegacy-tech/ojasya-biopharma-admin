// app/mr/hospitals/[id]/page.tsx
// app/mr/hospitals/[id]/page.tsx
"use client";
import React from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useState } from "react";
import VisitNoteForm from "@/components/mr/VisitNoteForm";
import OrderForm from "@/components/mr/OrderForm";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { MapPin, Phone, Calendar, ClipboardList, Clock, CheckCircle } from "lucide-react";

type HospitalType = {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  assignedAt?: string | Date;
  recentActivity?: Array<{ title?: string; summary?: string; by?: string; when?: string | Date }>;
  stats?: { updatedAt?: string | Date; stockItems?: number; openOrders?: number; lowStock?: number; lastVisit?: string | Date };
  orders?: Array<{ _id: string; status?: string; totalPrice?: number; createdAt?: string | Date }>;
  dlNumber?: string;
  gstNumber?: string;
  contactPerson?: string;
};

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function HospitalDetail({ params }: { params: { id: string } }) {
  // Next.js (v15+) may provide `params` as a Promise. Use React.use to unwrap if available.
  type ReactUseFn = { use?: <T>(p: T | Promise<T>) => T };
  const reactUse = React as unknown as ReactUseFn;
  const resolvedParams = reactUse.use ? reactUse.use(params) : params;
  const { id } = resolvedParams as { id: string };
  const { user } = useAuth();

  // MR-specific hospital endpoint
  const { data, error, mutate, isValidating } = useSWR(id ? `/mr/hospitals/${id}` : null, fetcher);
  const [tab, setTab] = useState<"visit" | "order">("visit");

  if (!user) return <div className="p-6">Please login</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load hospital</div>;

  // show skeleton while validating
  if (!data) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse h-40 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="h-12 rounded-lg bg-white/60" />
            <div className="h-96 rounded-2xl bg-white/60" />
          </div>
          <div className="space-y-4">
            <div className="h-24 rounded-lg bg-white/60" />
            <div className="h-40 rounded-lg bg-white/60" />
          </div>
        </div>
      </div>
    );
  }

  // backend may return { hospital } or the doc directly

  const hospital = (data && (data.hospital ?? data)) as HospitalType;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600/90 to-teal-500/90 text-white p-6 mb-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{hospital.name}</h1>
            <p className="mt-1 text-sm opacity-90">{hospital.address ?? hospital.city ?? "—"}</p>
            <div className="mt-3 flex items-center gap-3 text-sm opacity-95">
              {hospital.city && (
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <MapPin className="w-4 h-4" /> {hospital.city}
                </span>
              )}

              {hospital.phone && (
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <Phone className="w-4 h-4" /> {hospital.phone}
                </span>
              )}

              <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" /> Assigned: {hospital.assignedAt ? formatDate(hospital.assignedAt) : "—"}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setTab("visit")}
              aria-pressed={tab === "visit"}
              className={`px-4 py-2 rounded-xl font-medium transition ${tab === "visit" ? 'bg-white text-emerald-700' : 'bg-white/10 text-white border border-white/20'}`}>
              Visit Notes
            </button>

            <button
              onClick={() => setTab("order")}
              aria-pressed={tab === "order"}
              className={`px-4 py-2 rounded-xl font-medium transition ${tab === "order" ? 'bg-white text-emerald-700' : 'bg-white/10 text-white border border-white/20'}`}>
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: form area (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{tab === "visit" ? 'Create Visit Note' : 'Place an Order'}</h3>
                <p className="text-sm text-slate-500">{tab === 'visit' ? 'Record your visit notes, observations and next actions.' : 'Create an order for this hospital — include products and quantities.'}</p>
              </div>
              <div className="text-sm text-slate-400">MR: {user?.name ?? (user?.email?.split('@')[0] ?? 'MR')}</div>
            </div>

            <div>
              {tab === "visit" ? (
                <VisitNoteForm hospitalId={id} onSaved={() => mutate()} />
              ) : (
                <OrderForm hospitalId={id} onPlaced={() => mutate()} />
              )}
            </div>
          </div>

          {/* Activity / Notes feed */}
          <div className="bg-white rounded-2xl p-6 shadow space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Recent Activity</h4>
              <div className="text-sm text-slate-500">Auto-synced</div>
            </div>

            {/* Example activity items - replace with real data when available */}
            <div className="space-y-3">
              {(hospital.recentActivity ?? []).length === 0 ? (
                <div className="text-sm text-slate-400">No recent activity. Create a visit note or place an order to get started.</div>
              ) : (
                (hospital.recentActivity ?? []).map((it: { title?: string; summary?: string; by?: string; when?: string | Date }, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{it.title ?? 'Note'}</div>
                      <div className="text-xs text-slate-500">{it.summary ?? ''}</div>
                      <div className="text-xs text-slate-400 mt-1">{it.by ?? 'MR'} • {it.when ? formatDate(it.when) : '—'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: stats, orders, quick info */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-500">Hospital Stats</div>
              <div className="text-xs text-slate-400">Updated {hospital.stats?.updatedAt ? formatDate(hospital.stats.updatedAt) : '—'}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <div className="text-sm text-slate-500">Stock Items</div>
                <div className="mt-1 font-bold text-slate-900">{hospital.stats?.stockItems ?? 0}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <div className="text-sm text-slate-500">Open Orders</div>
                <div className="mt-1 font-bold text-slate-900">{hospital.stats?.openOrders ?? 0}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <div className="text-sm text-slate-500">Low Stock Alerts</div>
                <div className="mt-1 font-bold text-rose-600">{hospital.stats?.lowStock ?? 0}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <div className="text-sm text-slate-500">Last Visit</div>
                <div className="mt-1 font-bold text-slate-900">{hospital.stats?.lastVisit ? formatDate(hospital.stats.lastVisit) : '—'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Recent Orders</h4>
              <div className="text-xs text-slate-400">Last 30 days</div>
            </div>

            {(!hospital.orders || hospital.orders.length === 0) ? (
              <div className="text-sm text-slate-400">No recent orders</div>
            ) : (
              <div className="space-y-3">
                {hospital.orders.slice(0,5).map((o: { _id: string; status?: string; totalPrice?: number; createdAt?: string | Date }) => (
                  <div key={o._id} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">#{o._id.slice(-6)} • {o.status}</div>
                      <div className="text-xs text-slate-500">{o.totalPrice ? `₹${o.totalPrice}` : ''} • {o.createdAt ? formatDate(o.createdAt) : ''}</div>
                    </div>
                    <div className="text-xs text-slate-400">{o.status === 'delivered' ? <CheckCircle className="text-emerald-500" /> : <Clock className="text-amber-500" />}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow text-sm text-slate-600">
            <div className="font-medium mb-2">Quick Info</div>
            <div className="flex flex-col gap-2">
              <div>Drug License: <span className="font-medium">{hospital.dlNumber ?? '—'}</span></div>
              <div>GST: <span className="font-medium">{hospital.gstNumber ?? '—'}</span></div>
              <div>Contact: <span className="font-medium">{hospital.contactPerson ?? '—'}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}