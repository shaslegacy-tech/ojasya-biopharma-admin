// app/supplier/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  Line,
  LineChart,
} from "recharts";
import {
  ArrowUpRight,
  Box,
  FileText,
  List,
  Download,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import CreatePOModal from "@/components/ui/CreatePOModal";

type ProductRef = {
  _id?: string;
  name?: string;
  brand?: string;
  category?: string;
  unit?: string;
  mrp?: number;
};

type InventoryItem = {
  _id?: string;
  product?: ProductRef;
  availableQty?: number;
  costPrice?: number;
  threshold?: number;
  lastUpdated?: string;
  batchNo?: string;
  warehouse?: string;
};

type OrderSummary = {
  _id?: string;
  orderNo?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  placedByName?: string;
};

const fetcher = (url: string) => api.get(url).then((r) => r.data);

function kFormatter(n: number) {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

function Spark({ data, color = "#10b981" }: { data: { x: string; y: number }[]; color?: string }) {
  const small = data && data.length > 0 ? data : [{ x: "1", y: 0 }, { x: "2", y: 0 }];
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={small}>
        <defs>
          <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.18} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip formatter={(val: number) => [val, ""]} labelFormatter={() => ""} />
        <Area dataKey="y" stroke={color} fill="url(#spark)" strokeWidth={2} type="monotone" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function KPICard({
  title,
  value,
  sub,
  data,
  color = "#10b981",
  accent,
}: {
  title: string;
  value: string;
  sub?: string;
  data?: { x: string; y: number }[];
  color?: string;
  accent?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-800/60 shadow-2xl border border-slate-100 dark:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-300">
              {title}
            </div>
            {accent ? <div className="ml-2">{accent}</div> : null}
          </div>

          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {value}
          </div>

          {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
        </div>

        <div className="w-36 h-12 -mr-2">
          <Spark data={data ?? [{ x: "1", y: 0 }, { x: "2", y: 0 }]} color={color} />
        </div>
      </div>

      <div className="absolute -right-8 -top-8 opacity-10 pointer-events-none">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="80" fill={accent ? (typeof accent === "string" ? accent : "#10b981") : "#10b981"} />
        </svg>
      </div>
    </div>
  );
}

export default function SupplierDashboardPage() {
  const { user } = useAuth();
  const supplierId = user?.id;
  const [search, setSearch] = useState("");
  const [poOpen, setPoOpen] = useState(false);

  const invUrl = supplierId ? `/suppliers/${supplierId}/inventories` : null;
  const ordersUrl = supplierId ? `/suppliers/${supplierId}/orders?limit=8` : null;
  const lowInvUrl = supplierId ? `/suppliers/${supplierId}/inventories?lowStock=true&limit=8` : null;

  const { data: invData, mutate: mutateInv, isValidating: invLoading } = useSWR(invUrl, fetcher);
  const { data: ordersData, mutate: mutateOrders, isValidating: ordersLoading } = useSWR(ordersUrl, fetcher);
  const { data: lowInvData, isValidating: lowInvLoading } = useSWR(lowInvUrl, fetcher, { revalidateOnFocus: false });

  // Normalize responses
  const inventories = useMemo<InventoryItem[]>(() => {
    if (!invData) return [];
    if (Array.isArray(invData)) return invData as InventoryItem[];
    if (Array.isArray((invData as any).data)) return (invData as any).data as InventoryItem[];
    if (Array.isArray((invData as any).items)) return (invData as any).items as InventoryItem[];
    return [];
  }, [invData]);

  const recentOrders = useMemo<OrderSummary[]>(() => {
    if (!ordersData) return [];
    if (Array.isArray(ordersData)) return ordersData as OrderSummary[];
    if (Array.isArray((ordersData as any).data)) return (ordersData as any).data as OrderSummary[];
    if (Array.isArray((ordersData as any).orders)) return (ordersData as any).orders as OrderSummary[];
    return [];
  }, [ordersData]);

  const lowInventories = useMemo<InventoryItem[]>(() => {
    if (!lowInvData) return [];
    if (Array.isArray(lowInvData)) return lowInvData as InventoryItem[];
    if (Array.isArray((lowInvData as any).data)) return (lowInvData as any).data as InventoryItem[];
    if (Array.isArray((lowInvData as any).items)) return (lowInvData as any).items as InventoryItem[];
    return [];
  }, [lowInvData]);

  // KPIs
  const kpis = useMemo(() => {
    const totalUnits = inventories.reduce((s, it) => s + (it.availableQty ?? 0), 0);
    const lowCount = inventories.reduce((s, it) => s + (((it.availableQty ?? 0) < (it.threshold ?? 10)) ? 1 : 0), 0);
    const estValue = inventories.reduce((s, it) => s + ((it.availableQty ?? 0) * Number(it.costPrice ?? 0)), 0);
    const series = inventories.slice(-12).map((it, i) => ({ x: String(i + 1), y: it.availableQty ?? 0 }));
    return { totalUnits, lowCount, estValue, series };
  }, [inventories]);

  // Filtering
  const filteredOrders = useMemo(() => {
    if (!search) return recentOrders;
    const q = search.toLowerCase();
    return recentOrders.filter((o) =>
      (o.orderNo ?? "").toLowerCase().includes(q)
      || String(o.totalAmount ?? "").includes(q)
      || (o.placedByName ?? "").toLowerCase().includes(q)
    );
  }, [recentOrders, search]);

  const filteredLowInv = useMemo(() => {
    if (!search) return lowInventories;
    const q = search.toLowerCase();
    return lowInventories.filter((it) => {
      const name = (it.product?.name ?? "").toLowerCase();
      const brand = (it.product?.brand ?? "").toLowerCase();
      const cat = (it.product?.category ?? "").toLowerCase();
      return name.includes(q) || brand.includes(q) || cat.includes(q);
    });
  }, [lowInventories, search]);

  useEffect(() => {
    // small accessibility: focus search on mount when visible
    const el = document.querySelector<HTMLInputElement>("#supplier-search");
    if (el) {
      // don't auto-focus aggressively; only when there's no value
      if (!search) el.focus();
    }
  }, []); // run once

  const exportInventoryCsv = async () => {
    if (!inventories || inventories.length === 0) {
      toast.error("No inventory to export");
      return;
    }
    const header = ["productId", "name", "brand", "category", "unit", "qty", "costPrice", "batchNo", "warehouse", "lastUpdated"];
    const rows: string[] = [header.join(",")];
    for (const it of inventories) {
      const p = it.product ?? ({} as ProductRef);
      const vals = [
        p._id ?? "",
        p.name ?? "",
        p.brand ?? "",
        p.category ?? "",
        p.unit ?? "",
        String(it.availableQty ?? 0),
        String(it.costPrice ?? ""),
        it.batchNo ?? "",
        it.warehouse ?? "",
        it.lastUpdated ?? "",
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      rows.push(vals.join(","));
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supplier_inventory_${supplierId ?? "export"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Inventory CSV exported");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Supplier dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300 max-w-xl">
            Overview of inventory, orders and low-stock alerts — quick actions to manage your supply.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center bg-white dark:bg-slate-800/60 rounded-full px-4 py-2 border border-slate-100 dark:border-slate-700 shadow-sm w-full lg:w-[520px]">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              id="supplier-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders, products, SKUs or client names..."
              className="w-full bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
            />
            <button
              onClick={() => { setSearch(""); (document.getElementById("supplier-search") as HTMLInputElement | null)?.focus(); }}
              title="Clear"
              className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Clear
            </button>
          </div>

          <button
            onClick={() => exportInventoryCsv()}
            className="ml-3 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard
          title="Total Units"
          value={kFormatter(kpis.totalUnits)}
          sub={`${inventories.length} SKUs`}
          data={kpis.series}
          color="#06b6d4"
          accent={<div className="text-xs text-slate-400">Units</div>}
        />
        <KPICard
          title="Low Stock Items"
          value={String(kpis.lowCount)}
          sub="Needs attention"
          data={kpis.series.map(s => ({ x: s.x, y: Math.max(0, s.y - 2) }))}
          color="#f97316"
          accent={<ArrowUpRight className="text-rose-500 w-4 h-4" />}
        />
        <KPICard
          title="Estimated Inventory Value"
          value={`₹${kFormatter(Math.round(kpis.estValue))}`}
          sub="Approx. stock cost"
          data={kpis.series.map(s => ({ x: s.x, y: Math.round(s.y * ((kpis.estValue / Math.max(1, kpis.totalUnits)) || 1)) }))}
          color="#10b981"
          accent={<div className="text-xs text-slate-400">Value</div>}
        />
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">Latest orders that require action or review.</p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/supplier/orders" className="text-sm text-emerald-600 hover:underline">View all</Link>

              <button
                onClick={() => setPoOpen(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg shadow"
              >
                <Plus className="w-4 h-4" /> New PO
              </button>

              <CreatePOModal
                open={poOpen}
                onClose={() => setPoOpen(false)}
                supplierId={supplierId ?? ""}
                onCreated={() => {
                  mutateInv?.();
                  mutateOrders?.();
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {ordersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-slate-50 dark:bg-slate-700 animate-pulse" />
              ))
            ) : filteredOrders.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No recent orders</div>
            ) : (
              filteredOrders.map((o) => (
                <div
                  key={o._id}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      #{(o.orderNo ?? "—").slice(-4)}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{o.orderNo ?? "—"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-300 truncate">{o.placedByName ?? "System"} • {o.status}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold">₹{o.totalAmount ?? 0}</div>
                    <div className="text-xs text-slate-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right column: Low-stock & Quick Stats */}
        <aside className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Low Stock</h3>
                <div className="text-xs text-slate-500 dark:text-slate-300">Items below threshold</div>
              </div>
              <div className="text-sm font-semibold text-rose-500">{kpis.lowCount}</div>
            </div>

            <div className="space-y-3">
              {lowInvLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-slate-50 dark:bg-slate-700 animate-pulse" />
                ))
              ) : filteredLowInv.length === 0 ? (
                <div className="text-sm text-slate-500">No low stock items</div>
              ) : (
                filteredLowInv.map((it) => (
                  <div key={it._id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{it.product?.name ?? "—"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-300 truncate">{it.product?.brand ?? ""} • {it.product?.category ?? ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900 dark:text-white">{it.availableQty ?? 0}</div>
                      <div className="text-xs text-slate-400">₹{it.costPrice ?? "—"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Stats</h3>
                <div className="text-xs text-slate-500 dark:text-slate-300">Snapshot</div>
              </div>
              <div className="text-xs text-slate-400">{new Date().toLocaleDateString()}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div className="text-xs text-slate-500">SKUs</div>
                <div className="font-bold">{inventories.length}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div className="text-xs text-slate-500">Total Units</div>
                <div className="font-bold">{kFormatter(kpis.totalUnits)}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div className="text-xs text-slate-500">Low Alerts</div>
                <div className="font-bold text-rose-600">{kpis.lowCount}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div className="text-xs text-slate-500">Value</div>
                <div className="font-bold">₹{kFormatter(Math.round(kpis.estValue))}</div>
              </div>
            </div>

            <div className="mt-4">
              <Link href="/supplier/inventory" className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg">
                <Box className="w-4 h-4" /> Manage Inventory
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}