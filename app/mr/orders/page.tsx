// app/mr/orders/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type OrderItem = {
  product?: { name?: string; images?: string[]; brand?: string };
  qty?: number;
  price?: number;
};

type Order = {
  _id: string;
  orderNo?: string;
  customer?: { _id?: string; name?: string } | string | null;
  placedBy?: { _id?: string; name?: string } | string;
  items?: OrderItem[];
  status?: string;
  totalAmount?: number;
  assignedSupplier?: { _id?: string; name?: string } | string | null;
  paymentStatus?: string;
  createdAt?: string | Date;
};

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function MROrdersPage() {
  const { user } = useAuth();
  const mrId = user?.id;
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const perPage = 6;

  // prefer MR endpoint, fallback to global orders filter
  const mrKey = mrId ? `/mr/orders?placedBy=${mrId}` : null;
  const fallbackKey = mrId ? `/orders` : null;

  const { data: mrData } = useSWR(mrKey, fetcher, { revalidateOnFocus: false });
  const { data: fallbackData } = useSWR(mrData ? null : fallbackKey, fetcher, { revalidateOnFocus: false });

  const rawOrders = mrData ?? fallbackData ?? [];

  const orders: Order[] = useMemo(() => {
    const arrCandidate = Array.isArray(rawOrders)
      ? rawOrders
      : rawOrders?.items ?? rawOrders?.data ?? rawOrders?.orders ?? rawOrders?.results ?? rawOrders?.rows ?? [];

    if (!Array.isArray(arrCandidate)) return [];

    return arrCandidate.map((o: any) => {
      // normalize actor objects and compute display strings to avoid showing raw IDs
      const placedByObj = typeof o.placedBy === 'object' ? o.placedBy : undefined;
      const customerObj = typeof o.customer === 'object' ? o.customer : undefined;
      const supplierObj = typeof o.assignedSupplier === 'object' ? o.assignedSupplier : undefined;

      const placedByDisplay = placedByObj
        ? (placedByObj.name ?? placedByObj.fullName ?? placedByObj.displayName ?? placedByObj.email ?? String(placedByObj._id))
        : (o.placedByName ?? o.placedByDisplay ?? (o.placedBy ? String(o.placedBy) : undefined));

      const customerDisplay = customerObj
        ? (customerObj.name ?? customerObj.title ?? customerObj.displayName ?? String(customerObj._id))
        : (o.customerName ?? o.customerDisplay ?? (o.customer ? String(o.customer) : null));

      const supplierDisplay = supplierObj
        ? (supplierObj.name ?? supplierObj.title ?? supplierObj.displayName ?? String(supplierObj._id))
        : (o.assignedSupplierName ?? o.supplierName ?? o.supplierDisplay ?? null);

      return {
        _id: o._id ?? o.id,
        orderNo: o.orderNo,
        placedBy: placedByObj ?? (o.placedBy ? { _id: o.placedBy, name: o.placedByName ?? String(o.placedBy) } : undefined),
        placedByDisplay,
        customer: customerObj ?? (o.customer ? { _id: o.customer, name: o.customerName ?? String(o.customer) } : null),
        customerDisplay,
        items: (o.items ?? o.products ?? []).map((it: any) => ({ product: it.product ?? it.productId ?? it, qty: it.qty ?? it.quantity ?? it.qty ?? 0, price: it.price ?? it.unitPrice ?? 0 })),
        status: o.status ?? o.state,
        totalAmount: o.totalAmount ?? o.totalPrice ?? o.amount ?? 0,
        assignedSupplier: supplierObj ?? (o.assignedSupplier ? { _id: o.assignedSupplier, name: o.assignedSupplierName ?? String(o.assignedSupplier) } : null),
        supplierDisplay,
        paymentStatus: o.paymentStatus ?? undefined,
        createdAt: o.createdAt ?? o.created_at,
      } as Order;
    });
  }, [rawOrders]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return orders;
    return orders.filter((o) => {
      if (o.orderNo?.toLowerCase().includes(qq)) return true;
      if (String(o._id ?? "").toLowerCase().includes(qq)) return true;
      if (o.customer && typeof o.customer === 'object' && (o.customer.name ?? '').toLowerCase().includes(qq)) return true;
      if (o.placedBy && typeof o.placedBy === 'object' && (o.placedBy.name ?? '').toLowerCase().includes(qq)) return true;
      return false;
    });
  }, [orders, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSlice = filtered.slice((page - 1) * perPage, page * perPage);

  const handleRefresh = async () => {
    toast.loading("Refreshing…");
    try {
      await api.get(mrKey ?? fallbackKey ?? "/orders");
      toast.dismiss();
      toast.success("Refreshed");
    } catch (err) {
      toast.dismiss();
      toast.error("Refresh failed");
    }
  };

  if (!user) return <div className="p-6">Please login</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">My Orders</h1>
          <p className="text-slate-500 mt-1">Beautifully organized list of orders you placed — quick overview and details.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white shadow-sm rounded-full px-3 py-2 border">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search order #, id, customer or MR"
              className="bg-transparent outline-none w-72 text-sm"
            />
          </div>

          <button onClick={handleRefresh} className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow hover:opacity-95">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pageSlice.map((o) => (
          <div key={o._id} className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100 hover:shadow-2xl transition">
            <div className="md:flex md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center border">
                  <div className="text-sm font-bold text-emerald-700">{o.orderNo ?? String(o._id).slice(-6)}</div>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">Order #{o.orderNo ?? String(o._id).slice(-6)}</h3>
                    <div className="text-xs text-slate-500">Placed {o.createdAt ? formatDistanceToNowStrict(typeof o.createdAt === 'string' ? parseISO(o.createdAt) : new Date(o.createdAt)) + ' ago' : '—'}</div>
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    <div>Placed by: <span className="font-medium">{o.placedByDisplay ?? '—'}</span></div>
                    <div>Customer: <span className="font-medium">{o.customerDisplay ?? '—'}</span></div>
                    <div>Supplier: <span className="font-medium">{o.supplierDisplay ?? 'Unassigned'}</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="font-bold text-2xl">₹{Number(o.totalAmount ?? 0).toFixed(0)}</div>
                  <div className="text-xs text-slate-400 mt-1">{o.paymentStatus ?? '—'}</div>
                </div>

                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                        style={{ background: statusColorBg(o.status), color: statusColorText(o.status) }}>
                    {o.status ?? '—'}
                  </span>
                </div>

                <button
                  onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
                >
                  {expanded === o._id ? 'Hide details' : 'View details'}
                </button>
              </div>
            </div>

            {expanded === o._id && (
              <div className="mt-4 border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="space-y-3">
                    {o.items?.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-slate-50 rounded-lg p-3">
                        <div className="w-14 h-14 bg-white rounded-md border flex items-center justify-center overflow-hidden">
                          {it.product && (it.product as any).images?.[0] ? (
                            <img src={(it.product as any).images[0]} alt={(it.product as any).name ?? ''} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xs text-slate-400 px-2">No image</div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="font-medium">{(it.product as any)?.name ?? 'Unknown product'}</div>
                          <div className="text-xs text-slate-500">Brand: {(it.product as any)?.brand ?? '—'}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm">Qty: <span className="font-medium">{it.qty ?? 0}</span></div>
                          <div className="text-sm">Price: ₹{Number(it.price ?? 0).toFixed(0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-1 bg-white border rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-slate-500">Order summary</div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>Items</div>
                      <div className="font-medium">{o.items?.reduce((s, it) => s + (it.qty ?? 0), 0) ?? 0}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <div>Subtotal</div>
                      <div className="font-medium">₹{Number(o.totalAmount ?? 0).toFixed(0)}</div>
                    </div>

                    <div className="mt-4">
                      <button className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Reorder</button>
                      <button className="w-full px-4 py-2 rounded-lg border mt-2">Open in admin</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-6 bg-white rounded-2xl shadow text-center text-slate-500">No orders found</div>
        )}
      </div>

      {/* pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(Math.max(1, page - 1))} className="p-2 rounded bg-white border"><ChevronLeft/></button>
          <div className="text-sm">Page {page} of {totalPages}</div>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="p-2 rounded bg-white border"><ChevronRight/></button>
        </div>
        <div className="text-sm text-slate-500">{filtered.length} orders</div>
      </div>
    </div>
  );
}

/** small helpers to color status chips */
function statusColorBg(status?: string) {
  const s = (status ?? "").toLowerCase();
  if (s.includes("placed") || s.includes("pending")) return "#fff7ed"; // amber-50
  if (s.includes("accepted") || s.includes("processing")) return "#ecfdf5"; // green-50
  if (s.includes("delivered") || s.includes("completed")) return "#ecfeff"; // cyan-50
  if (s.includes("cancel")) return "#fff1f2"; // rose-50
  return "#f1f5f9"; // slate-100
}
function statusColorText(status?: string) {
  const s = (status ?? "").toLowerCase();
  if (s.includes("placed") || s.includes("pending")) return "#92400e"; // amber-700
  if (s.includes("accepted") || s.includes("processing")) return "#065f46"; // green-800
  if (s.includes("delivered") || s.includes("completed")) return "#036b6b"; // teal-ish
  if (s.includes("cancel")) return "#b91c1c"; // rose-700
  return "#334155"; // slate-700
}