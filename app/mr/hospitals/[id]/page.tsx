// app/mr/hospitals/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import VisitNoteForm from "@/components/mr/VisitNoteForm";
import OrderForm from "@/components/mr/OrderForm";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import { MapPin, Phone, Calendar, ClipboardList, Clock, CheckCircle } from "lucide-react";

/*
  HospitalType: keep light & permissive so page tolerates partial docs
*/
type HospitalType = {
  _id: string;
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  assignedAt?: string | Date;
  recentActivity?: Array<{ title?: string; summary?: string; by?: string; when?: string | Date }>;
  stats?: { updatedAt?: string | Date; stockItems?: number; openOrders?: number; lowStock?: number; lastVisit?: string | Date };
  orders?: Array<{ _id?: string; status?: string; totalAmount?: number; totalPrice?: number; createdAt?: string | Date }>;
  dlNumber?: string;
  gstNumber?: string;
  contactPerson?: string;
};

const fetcher = (url: string) => api.get(url).then((r) => r.data);

// Helper: normalize different shapes returned by endpoints
function normalizeArrayFromResponse(r: any) {
  if (!r) return [];
  if (Array.isArray(r)) return r;
  if (Array.isArray(r.data)) return r.data;
  if (Array.isArray(r.orders)) return r.orders;
  if (Array.isArray(r.hospitals)) return r.hospitals;
  return [];
}

export default function HospitalDetail({ params }: { params: { id: string } }) {
  // Next.js may provide params as a Promise; unwrap safely if React.use exists.
  const reactAny = React as any;
  const resolvedParams = reactAny.use ? reactAny.use(params) : params;
  const id = (resolvedParams as { id: string }).id;

  // auth (must be called unconditionally)
  const { user } = useAuth();

  // main hospital doc (MR endpoint returns hospital or { hospital: ... } shape)
  const { data: hospitalData, error: hospitalError, mutate: mutateHospital, isValidating: hospitalLoading } = useSWR(
    id ? `/mr/hospitals/${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // MR-scoped recent orders endpoint (try /mr then fallback to /hospitals)
  const mrOrdersKey = id ? `/mr/hospitals/${id}/orders?limit=8` : null;
  const hospOrdersKey = id ? `/hospitals/${id}/orders?limit=8` : null;

  // We'll try MR endpoint first; SWR will fetch both when needed.
  const { data: mrOrdersRaw, error: mrOrdersError, mutate: mutateMrOrders } = useSWR(mrOrdersKey, fetcher, {
    revalidateOnFocus: false,
    suspense: false,
  });

  const { data: hospOrdersRaw, error: hospOrdersError, mutate: mutateHospOrders } = useSWR(mrOrdersRaw ? null : hospOrdersKey, fetcher, {
    revalidateOnFocus: false,
    suspense: false,
  });

  // stocks — used to compute stockItems / lowStock if hospital.stats absent
  const { data: stocksRaw, mutate: mutateStocks } = useSWR(id ? `/stocks?hospital=${id}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  // visit notes list (optional): fetch MR visit notes for this hospital to populate recentActivity
  const { data: visitNotesRaw } = useSWR(id ? `/mr/hospitals/${id}/visits?limit=6` : null, fetcher, { revalidateOnFocus: false });

  // normalize hospital doc shape
  const hospital = hospitalData ? (hospitalData.hospital ?? hospitalData) : undefined;
  // build recent orders array by precedence:
  // 1) mrOrdersRaw, 2) hospOrdersRaw, 3) hospital.orders
  const rawOrders = mrOrdersRaw ?? hospOrdersRaw ?? (hospital?.orders ?? []);
  const recentOrders = normalizeArrayFromResponse(rawOrders).slice(0, 8).map((o: any) => ({
    _id: o._id ?? o.id ?? o.orderNo ?? o.orderId,
    status: o.status ?? o.state ?? o.orderStatus,
    totalAmount: (o.totalAmount ?? o.totalPrice ?? o.totalPrice ?? o.totalPrice) || (o.totalPrice ?? o.totalAmount) || 0,
    createdAt: o.createdAt ?? o.created_at ?? o.created,
  }));

  // derive stats: either hospital.stats, or compute from stocks & recentOrders
  const derivedStats = React.useMemo(() => {
    // prefer server-provided stats
    if (hospital?.stats) {
      return {
        stockItems: hospital.stats.stockItems ?? 0,
        openOrders: hospital.stats.openOrders ?? (recentOrders.filter((r: { status: any; }) => (String(r.status ?? "").toLowerCase() !== "delivered")).length),
        lowStock: hospital.stats.lowStock ?? 0,
        lastVisit: hospital.stats.lastVisit ?? hospital.stats.updatedAt ?? null,
        updatedAt: hospital.stats.updatedAt ?? null,
      };
    }

    // compute from stocksRaw (if present)
    const stocks = normalizeArrayFromResponse(stocksRaw);
    const stockItems = stocks.length;
    const lowStock = stocks.filter((s: any) => {
      const qty = Number(s.quantity ?? s.availableQty ?? s.available ?? 0);
      const threshold = Number(s.threshold ?? s.min ?? 10);
      return qty <= threshold;
    }).length;

    const openOrders = recentOrders.filter((r: { status: any; }) => {
      const st = String(r.status ?? "").toLowerCase();
      return !["delivered", "cancelled", "completed"].includes(st);
    }).length;

    // lastVisit: try visitNotesRaw first
    const visits = normalizeArrayFromResponse(visitNotesRaw);
    const lastVisit = visits.length ? (visits[0].createdAt ?? visits[0].date ?? visits[0].when) : null;

    return { stockItems, openOrders, lowStock, lastVisit, updatedAt: null };
  }, [hospital, stocksRaw, recentOrders, visitNotesRaw]);

  // Activity feed: prefer hospital.recentActivity then visit notes then map recentOrders to activity items
  // Additionally: resolve actor display names when placedBy is an id string by fetching user info once and caching it client-side.
  const [actorCache, setActorCache] = useState<Record<string, string>>({});

  React.useEffect(() => {
    // collect string ids that look like ObjectId and are not yet cached
    const idsToFetch = Array.from(
      new Set(
        recentOrders
          .map((o: any) => (o.placedBy && typeof o.placedBy === "string" ? o.placedBy : undefined))
          .filter(Boolean)
      )
    ).filter((id) => !actorCache[id]);

    if (idsToFetch.length === 0) return;

    // fetch names in parallel, update cache
    (async () => {
      try {
        const results = await Promise.all(
          idsToFetch.map(async (id) => {
            try {
              const res = await api.get(`/users/${id}`);
              // backend might return { user } or user directly
              const userObj = res.data?.user ? res.data.user : res.data;
              const display = (userObj && (userObj.name || userObj.email)) ? (userObj.name || userObj.email) : String(id);
              return { id, display };
            } catch (e) {
              return { id, display: String(id) };
            }
          })
        );
        setActorCache((prev) => {
          const next = { ...prev };
          for (const r of results) next[r.id] = r.display;
          return next;
        });
      } catch (e) {
        // ignore fetch errors — leave cache as-is
      }
    })();
  }, [recentOrders]);

  const derivedActivity = React.useMemo(() => {
    if (Array.isArray(hospital?.recentActivity) && hospital!.recentActivity!.length) return hospital!.recentActivity!;

    const visits = normalizeArrayFromResponse(visitNotesRaw).map((v: any) => ({
      title: v.title ?? "Visit note",
      summary: v.summary ?? v.note ?? "",
      by: v.by ?? v.author ?? "MR",
      when: v.createdAt ?? v.date ?? v.when,
    }));

    const ordersAct = recentOrders.slice(0, 6).map((o: any) => {
      // determine actor display name
      let by = "System";
      if (o.placedBy) {
        if (typeof o.placedBy === "string") {
          by = actorCache[o.placedBy] ?? o.placedBy;
        } else if (typeof o.placedBy === "object") {
          by = o.placedBy.name || o.placedBy.email || o.placedBy._id || "User";
        }
      }

      return {
        title: `Order ${String(o._id ?? "").slice(-6)}`,
        summary: `${o.totalAmount ? `₹${o.totalAmount}` : ""} • ${String(o.status ?? "").toUpperCase()}`,
        by,
        when: o.createdAt,
      };
    });

    const merged = [...visits, ...ordersAct];
    merged.sort((a: any, b: any) => {
      const ta = a.when ? new Date(a.when).getTime() : 0;
      const tb = b.when ? new Date(b.when).getTime() : 0;
      return tb - ta;
    });
    return merged.slice(0, 8);
  }, [hospital, visitNotesRaw, recentOrders, actorCache]);

  // revalidate helpers: when order is placed via OrderForm it should call mutateHospital/mutateMrOrders/mutateStocks
  // The OrderForm already triggers onPlaced => mutate() in your previous wiring; ensure it calls these keys
  const refreshAll = async () => {
    mutateHospital();
    mutateMrOrders && mutateMrOrders();
    mutateHospOrders && mutateHospOrders();
    mutateStocks && mutateStocks();
  };

  // local UI state
  const [tab, setTab] = useState<"visit" | "order">("visit");

  // guard: must be logged in MR (or at least logged in)
  if (!user) return <div className="p-6">Please login</div>;
  if (hospitalError) return <div className="p-6 text-red-600">Failed to load hospital</div>;

  // loading skeleton while main hospital data is not yet available
  if (!hospital && hospitalLoading) {
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

  // final hospital doc (could still be undefined if no data)
  const hosp = (hospital ?? { name: "Hospital", city: undefined }) as HospitalType;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600/90 to-teal-500/90 text-white p-6 mb-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{hosp.name ?? "Hospital"}</h1>
            <p className="mt-1 text-sm opacity-90">{hosp.address ?? hosp.city ?? "—"}</p>

            <div className="mt-3 flex items-center gap-3 text-sm opacity-95">
              {hosp.city && (
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <MapPin className="w-4 h-4" /> {hosp.city}
                </span>
              )}

              {hosp.phone && (
                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <Phone className="w-4 h-4" /> {hosp.phone}
                </span>
              )}

              <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" /> Assigned: {hosp.assignedAt ? formatDate(hosp.assignedAt) : "—"}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setTab("visit")}
              aria-pressed={tab === "visit"}
              className={`px-4 py-2 rounded-xl font-medium transition ${tab === "visit" ? "bg-white text-emerald-700" : "bg-white/10 text-white border border-white/20"}`}>
              Visit Notes
            </button>

            <button
              onClick={() => setTab("order")}
              aria-pressed={tab === "order"}
              className={`px-4 py-2 rounded-xl font-medium transition ${tab === "order" ? "bg-white text-emerald-700" : "bg-white/10 text-white border border-white/20"}`}>
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{tab === "visit" ? "Create Visit Note" : "Place an Order"}</h3>
                <p className="text-sm text-slate-500">{tab === "visit" ? "Record your visit notes, observations and next actions." : "Create an order for this hospital — include products and quantities."}</p>
              </div>
              <div className="text-sm text-slate-400">MR: {user?.name ?? user?.email?.split("@")[0]}</div>
            </div>

            <div>
              {tab === "visit" ? (
                <VisitNoteForm hospitalId={id} onSaved={refreshAll} />
              ) : (
                <OrderForm hospitalId={id} onPlaced={refreshAll} />
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-2xl p-6 shadow space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Recent Activity</h4>
              <div className="text-sm text-slate-500">Auto-synced</div>
            </div>

            <div className="space-y-3">
              {derivedActivity.length === 0 ? (
                <div className="text-sm text-slate-400">No recent activity. Create a visit note or place an order to get started.</div>
              ) : (
                derivedActivity.map((it: { title: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; summary: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; by: any; when: string | Date; }, idx: React.Key | null | undefined) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{it.title}</div>
                      <div className="text-xs text-slate-500">{it.summary}</div>
                      <div className="text-xs text-slate-400 mt-1">{it.by ?? "MR"} • {it.when ? formatDate(it.when) : "—"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: stats & recent orders */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-500">Hospital Stats</div>
              <div className="text-xs text-slate-400">Updated {derivedStats.updatedAt ? formatDate(derivedStats.updatedAt) : "—"}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <div className="text-sm text-slate-500">Stock Items</div>
                <div className="mt-1 font-bold text-slate-900">{derivedStats.stockItems ?? 0}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <div className="text-sm text-slate-500">Open Orders</div>
                <div className="mt-1 font-bold text-slate-900">{derivedStats.openOrders ?? 0}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <div className="text-sm text-slate-500">Low Stock Alerts</div>
                <div className="mt-1 font-bold text-rose-600">{derivedStats.lowStock ?? 0}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <div className="text-sm text-slate-500">Last Visit</div>
                <div className="mt-1 font-bold text-slate-900">{derivedStats.lastVisit ? formatDate(derivedStats.lastVisit) : "—"}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Recent Orders</h4>
              <div className="text-xs text-slate-400">Last 30 days</div>
            </div>

            { (mrOrdersError || hospOrdersError) ? (
              <div className="text-sm text-rose-500">Unable to load orders</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-sm text-slate-400">No recent orders</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((o: { _id: any; status: any; totalAmount: any; createdAt: string | Date; }) => (
                  <div key={String(o._id ?? Math.random())} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">#{String(o._id ?? "").slice(-6)} • {String(o.status ?? "—")}</div>
                      <div className="text-xs text-slate-500">{o.totalAmount ? `₹${o.totalAmount}` : ""} • {o.createdAt ? formatDate(o.createdAt) : ""}</div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {String(o.status ?? "").toLowerCase().includes("delivered") ? <CheckCircle className="text-emerald-500" /> : <Clock className="text-amber-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow text-sm text-slate-600">
            <div className="font-medium mb-2">Quick Info</div>
            <div className="flex flex-col gap-2">
              <div>Drug License: <span className="font-medium">{hosp.dlNumber ?? "—"}</span></div>
              <div>GST: <span className="font-medium">{hosp.gstNumber ?? "—"}</span></div>
              <div>Contact: <span className="font-medium">{hosp.contactPerson ?? "—"}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}