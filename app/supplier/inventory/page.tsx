// app/supplier/inventory/page.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Moon,
  Sun,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import PremiumModal from "@/components/ui/PremiumModal";

// Chart imports (sparklines)
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

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
  productId?: string;
  warehouse?: string;
  batchNo?: string;
  availableQty?: number;
  reservedQty?: number;
  costPrice?: number;
  threshold?: number;
  lastUpdated?: string;
};

const fetcher = (url: string) => api.get(url).then((r) => r.data);

/* tiny sparkline component */
function Sparkline({ values }: { values: number[] }) {
  const data = {
    labels: values.map((_, i) => String(i + 1)),
    datasets: [
      {
        data: values,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };
  const opts = {
    responsive: true,
    maintainAspectRatio: true,
    scales: { x: { display: false }, y: { display: false } },
    elements: { line: { borderColor: "rgba(34,197,94,0.95)" } },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  } as any;
  return <div className="w-28 h-8"><Line options={opts} data={data} /></div>;
}

/* KPI card with sparkline */
function KPI({
  title,
  value,
  hint,
  accent = "emerald",
  sparkValues,
}: {
  title: string;
  value: string | number;
  hint?: string;
  accent?: "emerald" | "rose" | "amber" | "slate";
  sparkValues?: number[];
}) {
  const accentClasses =
    accent === "rose"
      ? "from-rose-50 to-rose-100 text-rose-700"
      : accent === "amber"
      ? "from-amber-50 to-amber-100 text-amber-700"
      : accent === "slate"
      ? "from-slate-50 to-slate-100 text-slate-800"
      : "from-emerald-50 to-emerald-100 text-emerald-700";

  return (
    <div
      className={`rounded-2xl p-4 shadow-sm border border-slate-100 bg-gradient-to-b ${accentClasses} flex flex-col justify-between`}
      role="region"
      aria-label={title}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider font-medium">{title}</div>
          <div className="mt-2 text-2xl font-extrabold">{value}</div>
          {hint ? <div className="text-xs text-slate-500 mt-1">{hint}</div> : null}
        </div>
        <div className="ml-4 self-end">
          {sparkValues ? <Sparkline values={sparkValues} /> : null}
        </div>
      </div>
    </div>
  );
}

function NiceBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
      {children}
    </span>
  );
}

export default function SupplierInventoryPage() {
  const { user } = useAuth();
  const supplierId = user?.id ?? null;

  const [q, setQ] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [compact, setCompact] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 3; // user asked pagination = 3

  // load persisted darkMode from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("supplier:darkMode");
      setDarkMode(saved === "1");
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("supplier:darkMode", darkMode ? "1" : "0");
    } catch {
      // ignore
    }
  }, [darkMode]);

  const url = supplierId
    ? `/suppliers/${supplierId}/inventories${lowStockOnly ? "?lowStock=true" : ""}`
    : null;
  const { data, mutate, isValidating } = useSWR(url, fetcher, { revalidateOnFocus: false });

  const items: InventoryItem[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as InventoryItem[];
    if (Array.isArray((data as any).items)) return (data as any).items as InventoryItem[];
    if (Array.isArray((data as any).data)) return (data as any).data as InventoryItem[];
    return [];
  }, [data]);

  // KPIs
  const kpis = useMemo(() => {
    const skuSet = new Set<string>();
    let totalCount = 0;
    let lowStockCount = 0;
    let totalValue = 0;
    for (const it of items) {
      const pid = (it.product && it.product._id) || String(it.productId || "");
      if (pid) skuSet.add(pid);
      const qty = Number(it.availableQty ?? 0);
      totalCount += qty;
      const th = Number(it.threshold ?? 10);
      if (qty < th) lowStockCount++;
      const cp = Number(it.costPrice ?? 0);
      totalValue += cp * qty;
    }
    // generate tiny synthetic trending arrays (7 points) derived from the KPI to show sparklines
    const makeTrend = (base: number) => {
      const arr: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const jitter = Math.round((Math.sin(base + i) + 1) * 0.08 * base);
        arr.push(Math.max(0, Math.round(base - i * (base * 0.02) + jitter)));
      }
      return arr;
    };
    return {
      totalSKUs: skuSet.size,
      totalCount,
      lowStockCount,
      totalValue,
      trends: {
        skus: makeTrend(skuSet.size || 8),
        count: makeTrend(totalCount || 50),
        low: makeTrend(lowStockCount || 3),
        value: makeTrend(Math.round(totalValue / 1000) || 10),
      },
    };
  }, [items]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const all = items.filter((it) => {
      if (!ql) return true;
      const name = (it.product?.name ?? "").toString().toLowerCase();
      const brand = (it.product?.brand ?? "").toString().toLowerCase();
      const cat = (it.product?.category ?? "").toString().toLowerCase();
      const batch = (it.batchNo ?? "").toString().toLowerCase();
      return name.includes(ql) || brand.includes(ql) || cat.includes(ql) || batch.includes(ql);
    });
    const start = (page - 1) * perPage;
    const paged = all.slice(start, start + perPage);
    return { allCount: all.length, paged };
  }, [items, q, page, perPage]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  // handlers
  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (it: InventoryItem) => {
    setEditing(it);
    setOpen(true);
  };
  const handleDelete = async (it: InventoryItem) => {
    if (!supplierId || !it._id) return;
    if (!confirm("Delete this inventory record?")) return;
    try {
      await api.delete(`/suppliers/${supplierId}/inventories/${it._id}`);
      toast.success("Deleted");
      mutate();
    } catch {
      toast.error("Delete failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.allCount / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // CSV export
  const handleExportCsv = () => {
    if (!items || items.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const rows = (filtered.paged.length ? filtered.paged : items).map((it) => {
      const prod = it.product ?? ({} as ProductRef);
      return {
        sku: prod._id ?? "",
        name: prod.name ?? "",
        brand: prod.brand ?? "",
        category: prod.category ?? "",
        unit: prod.unit ?? "",
        quantity: String(it.availableQty ?? 0),
        costPrice: String(it.costPrice ?? 0),
        warehouse: it.warehouse ?? "",
        batchNo: it.batchNo ?? "",
        lastUpdated: it.lastUpdated ?? "",
      };
    });
    const header = Object.keys(rows[0]);
    const csv = [header.join(","), ...rows.map((r) => header.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\r\n");
    // add BOM to help Excel detect UTF-8
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlBlob;
    a.download = `inventory_${supplierId ?? "export"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(urlBlob);
    toast.success("CSV exported");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Total SKUs" value={kpis.totalSKUs} hint="Distinct product SKUs" accent="emerald" sparkValues={kpis.trends.skus} />
        <KPI title="Total Inventory" value={kpis.totalCount} hint="Sum of available quantities" accent="slate" sparkValues={kpis.trends.count} />
        <KPI title="Low Stock Alerts" value={kpis.lowStockCount} hint="Items below threshold" accent="rose" sparkValues={kpis.trends.low} />
        <KPI title="Inventory Value" value={`₹${kpis.totalValue.toFixed(0)}`} hint="Estimated cost value" accent="amber" sparkValues={kpis.trends.value} />
      </div>

      {/* Header */}
      <div
        className={`rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
          darkMode ? "bg-gradient-to-r from-slate-800/90 to-slate-900/90 text-white" : "bg-gradient-to-r from-[#0daba9] to-[#78cfce] text-white"
        } shadow-xl`}
      >
        <div>
          <h1 className="text-3xl font-extrabold">Inventory</h1>
          <p className="opacity-90 mt-1">Manage product stock, pricing & batch details — supplier view.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-full p-1 border border-white/10">
            <button onClick={() => setDarkMode((v) => !v)} className="p-2 rounded hover:bg-white/10 transition" title="Toggle dark">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setCompact((v) => !v)} className="p-2 rounded hover:bg-white/10 transition" title="Toggle compact">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center bg-white rounded-full px-3 py-2 border shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search product, brand, category" className="bg-transparent outline-none text-sm w-56 placeholder:text-slate-400 text-slate-900" />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-white select-none">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">Low only</span>
          </label>

          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-white/90 text-emerald-800 px-4 py-2 rounded-lg font-medium hover:bg-white transition">
            <Plus className="w-4 h-4" /> Add
          </button>

          <button onClick={handleExportCsv} className="inline-flex items-center gap-2 bg-white/10 text-white px-3 py-2 rounded-lg border hover:bg-white/5 transition ml-2">
            Export CSV
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className={`grid ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"} gap-6`}>
        {isValidating && items.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="p-6 rounded-xl bg-white/5 border animate-pulse h-40" />)
        ) : filtered.paged.length === 0 ? (
          <div className="col-span-full p-8 rounded-xl bg-white border border-dashed text-center text-slate-500">No inventory found.</div>
        ) : (
          filtered.paged.map((it) => {
            const qty = it.availableQty ?? 0;
            const th = it.threshold ?? 10;
            const low = qty < th;
            return (
              <div key={it._id ?? `${it.productId}-${it.batchNo ?? "b"}`} className={`rounded-2xl p-4 shadow-md border transition hover:shadow-lg flex flex-col justify-between ${darkMode ? "bg-slate-900/70 border-slate-700 text-white" : "bg-white border-slate-100 text-slate-800"} min-h-[170px]`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold truncate">{it.product?.name ?? "—"}</h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{it.product?.brand ?? "—"}</div>

                    <div className="mt-2 flex items-center gap-2">
                      <NiceBadge>{it.product?.category ?? "General"}</NiceBadge>
                      <div className="text-xs text-slate-400 ml-2">{it.product?.unit ?? "unit"}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-semibold ${low ? "text-rose-500" : "text-emerald-600"}`}>{low ? "LOW" : "OK"}</div>
                    <div className="text-2xl font-bold">{qty}</div>
                    <div className="text-xs text-slate-500 mt-1">₹{(it.costPrice ?? 0).toFixed(0)}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <div><span className="text-slate-400">Batch:</span> {it.batchNo ?? "—"}</div>
                  <div className="text-xs text-slate-400">{it.lastUpdated ? new Date(it.lastUpdated).toLocaleDateString() : "—"}</div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(it)} className="px-3 py-1 rounded bg-emerald-50 text-emerald-700 text-sm hover:bg-emerald-100 inline-flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(it)} className="px-3 py-1 rounded bg-rose-50 text-rose-600 text-sm hover:bg-rose-100 inline-flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-600">
          Showing <span className="font-medium">{filtered.allCount === 0 ? 0 : (page - 1) * perPage + 1}</span> -
          <span className="font-medium"> {Math.min(page * perPage, filtered.allCount)}</span> of <span className="font-medium">{filtered.allCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 bg-white border rounded hover:scale-105 transition" aria-label="Prev page">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 border rounded">{page}</div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-white border rounded hover:scale-105 transition" aria-label="Next page">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && supplierId && (
        <PremiumModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Inventory" : "Add Inventory"}>
          <InventoryForm supplierId={supplierId} initial={editing ?? undefined} onClose={() => { setOpen(false); setEditing(null); }} onSaved={() => { mutate(); setOpen(false); toast.success("Saved"); }} />
        </PremiumModal>
      )}
    </div>
  );
}

/* inventory form */
function InventoryForm({ supplierId, initial, onClose, onSaved, }: { supplierId: string; initial?: InventoryItem; onClose: () => void; onSaved: () => void; }) {
  const isEdit = !!initial?._id;
  const [productId, setProductId] = useState<string>(initial?.product?._id ?? "");
  const [batchNo, setBatchNo] = useState(initial?.batchNo ?? "");
  const [warehouse, setWarehouse] = useState(initial?.warehouse ?? "");
  const [availableQty, setAvailableQty] = useState<number>(initial?.availableQty ?? 0);
  const [costPrice, setCostPrice] = useState<number>(initial?.costPrice ?? 0);
  const [threshold, setThreshold] = useState<number>(initial?.threshold ?? 10);
  const [saving, setSaving] = useState(false);

  const { data: productsData } = useSWR("/products", fetcher, { revalidateOnFocus: false });

  const productOptions: ProductRef[] = useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData as ProductRef[];
    if (Array.isArray((productsData as any).data)) return (productsData as any).data as ProductRef[];
    return [];
  }, [productsData]);

  const handleSave = async () => {
    if (!productId) return toast.error("Select product");
    setSaving(true);
    try {
      const payload = { product: productId, batchNo, warehouse, availableQty, costPrice, threshold };
      if (isEdit && initial?._id) await api.put(`/suppliers/${supplierId}/inventories/${initial._id}`, payload);
      else await api.post(`/suppliers/${supplierId}/inventories`, payload);
      onSaved();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Product</span>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="p-2 border rounded">
            <option value="">Select…</option>
            {productOptions.map((p) => (<option key={p._id} value={p._id}>{p.name} {p.brand ? `— ${p.brand}` : ""}</option>))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Batch No</span>
          <input value={batchNo} onChange={(e) => setBatchNo(e.target.value)} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Available Qty</span>
          <input type="number" value={availableQty} onChange={(e) => setAvailableQty(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Cost Price (₹)</span>
          <input type="number" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Threshold</span>
          <input type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col md:col-span-2">
          <span className="text-sm text-slate-500">Warehouse</span>
          <input value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="p-2 border rounded" />
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white">{saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}