// app/supplier/inventory/page.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import PremiumModal from "@/components/ui/PremiumModal";

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

function Sparkline({ data, stroke = "#10b981" }: { data: number[]; stroke?: string }) {
  if (!data || data.length === 0) return <svg width="80" height="24" />;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const w = 80; const h = 24; const pad = 2;
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block">
      <polyline fill="none" stroke={stroke} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">{children}</span>;
}

export default function SupplierInventoryPage() {
  const { user } = useAuth();
  const supplierId = user?.id ?? null;
  const [q, setQ] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(()=>{
    const s = localStorage.getItem("supplier.compact");
    if (s) setCompact(s === "1");
  },[]);
  useEffect(()=> localStorage.setItem("supplier.compact", compact ? "1" : "0"), [compact]);

  const url = supplierId ? `/suppliers/${supplierId}/inventories${lowStockOnly ? "?lowStock=true" : ""}` : null;
  const { data, mutate, isValidating } = useSWR(url, fetcher, { revalidateOnFocus: false });

  const items: InventoryItem[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any).items)) return (data as any).items;
    if (Array.isArray((data as any).data)) return (data as any).data;
    return [];
  }, [data]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter(it => {
      if (!qq) return true;
      const name = (it.product?.name ?? "").toLowerCase();
      const brand = (it.product?.brand ?? "").toLowerCase();
      const cat = (it.product?.category ?? "").toLowerCase();
      const batch = (it.batchNo ?? "").toLowerCase();
      return name.includes(qq) || brand.includes(qq) || cat.includes(qq) || batch.includes(qq);
    });
  }, [items, q]);

  const kpis = useMemo(() => {
    const totalCount = items.reduce((s, it) => s + (it.availableQty ?? 0), 0);
    const lowCount = items.reduce((s, it) => s + (((it.availableQty ?? 0) < (it.threshold ?? 10)) ? 1 : 0), 0);
    const estValue = items.reduce((s, it) => s + ((it.availableQty ?? 0) * Number(it.costPrice ?? 0)), 0);
    const spark = items.slice(0,6).map(it => it.availableQty ?? 0);
    const series = spark.length >= 2 ? spark : [Math.max(1, totalCount / Math.max(1, items.length || 1)), Math.max(1, totalCount / Math.max(1, items.length || 1))];
    return { totalCount, lowCount, estValue, series };
  }, [items]);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (it: InventoryItem) => { setEditing(it); setOpen(true); };
  const handleDelete = async (it: InventoryItem) => {
    if (!supplierId || !it._id) return;
    if (!confirm("Delete this inventory item?")) return;
    try { await api.delete(`/suppliers/${supplierId}/inventories/${it._id}`); toast.success("Deleted"); mutate(); } catch { toast.error("Delete failed"); }
  };

  const handleExportCsv = () => {
    if (!filtered || filtered.length === 0) { toast.error("No rows to export"); return; }
    const header = ["productId","name","brand","category","unit","qty","costPrice","batchNo","warehouse","lastUpdated"];
    const rows = [header.join(",")];
    for (const r of filtered) {
      const p = r.product ?? ({} as ProductRef);
      const vals = [
        p._id ?? r.productId ?? "",
        p.name ?? "",
        p.brand ?? "",
        p.category ?? "",
        p.unit ?? "",
        String(r.availableQty ?? 0),
        String(r.costPrice ?? ""),
        r.batchNo ?? "",
        r.warehouse ?? "",
        r.lastUpdated ?? "",
      ].map(c => `"${String(c).replace(/"/g, '""')}"`);
      rows.push(vals.join(","));
    }
    const blob = new Blob([rows.join("\n")], {type: "text/csv;charset=utf-8;"});
    const urlB = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = urlB; a.download = `inventory_${supplierId ?? "export"}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(urlB);
    toast.success("CSV exported");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold">Inventory</h2>
              <p className="mt-1 opacity-90">Manage stock, pricing and batches — supplier portal</p>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <div className="flex items-center gap-2">
                <div className="text-sm text-white/90">Showing</div>
                <div className="bg-white/10 px-3 py-1 rounded-full text-sm">{filtered.length} items</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCompact(v => !v)} className="bg-white/10 px-3 py-2 rounded-lg text-white hover:bg-white/20">Compact</button>
                <button onClick={handleExportCsv} className="bg-white px-3 py-2 rounded-lg text-emerald-700 hover:scale-105">Export CSV</button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* KPI cards */}
            <div className="bg-white/10 p-3 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-white/90">Total Units</div>
                <div className="text-2xl font-bold">{kpis.totalCount}</div>
              </div>
              <div><Sparkline data={kpis.series} /></div>
            </div>

            <div className="bg-white/10 p-3 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-white/90">Low Stock Items</div>
                <div className="text-2xl font-bold text-rose-200">{kpis.lowCount}</div>
              </div>
              <div><Sparkline data={kpis.series.map(x=>Math.max(0,x-2))} stroke="#f97316" /></div>
            </div>

            <div className="bg-white/10 p-3 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-white/90">Estimated Value</div>
                <div className="text-2xl font-bold">₹{Math.round(kpis.estValue).toLocaleString()}</div>
              </div>
              <div><Sparkline data={kpis.series.map(x=>x*1.2)} stroke="#06b6d4" /></div>
            </div>
          </div>

          {/* search row (large) */}
          <div className="mt-6">
            <div className="flex gap-3 items-center">
              <div className="flex-1 bg-white/10 rounded-full px-4 py-2 border border-white/20 flex items-center">
                <Search className="w-5 h-5 text-white/80 mr-3" />
                <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search product, brand, or category" className="flex-1 bg-transparent outline-none text-white placeholder-white/80" />
              </div>

              <label className="inline-flex items-center gap-2 text-white/90">
                <input type="checkbox" checked={lowStockOnly} onChange={(e)=>setLowStockOnly(e.target.checked)} className="w-4 h-4" />
                Low only
              </label>

              <button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-lg">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* small KPI tiles on right */}
        <div className="rounded-2xl p-4 bg-white shadow">
          <div className="text-sm text-slate-500">Quick Actions</div>
          <div className="mt-3 space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition">Create Purchase Order</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition">Sync Stock</button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition">Download Report</button>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className={`grid ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"} gap-6`}>
        {isValidating && items.length === 0 ? (
          Array.from({length:6}).map((_,i)=>(<div key={i} className="h-40 animate-pulse bg-white/6 rounded-lg" />))
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 rounded-xl bg-white border border-dashed text-center text-slate-500">No inventory found.</div>
        ) : (
          filtered.map(it => {
            const qty = it.availableQty ?? 0;
            const th = it.threshold ?? 10;
            const low = qty < th;
            const product = it.product ?? ({} as ProductRef);
            return (
              <div key={it._id ?? Math.random()} className="bg-white rounded-2xl p-4 shadow-sm border hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold truncate">{product.name ?? "—"}</h3>
                    <div className="text-sm text-slate-500 mt-1">{product.brand ?? "—"}</div>

                    <div className="mt-3 flex items-center gap-2">
                      <CategoryPill>{product.category ?? "General"}</CategoryPill>
                      <span className="text-xs text-slate-500 px-2 py-0.5 rounded bg-slate-50">{product.unit ?? "unit"}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-semibold ${low ? "text-rose-500" : "text-emerald-600"}`}>{low ? "LOW" : "OK"}</div>
                    <div className="text-2xl font-bold">{qty}</div>
                    <div className="text-xs text-slate-400 mt-1">₹{it.costPrice ?? "—"}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="text-slate-600">Batch: <span className="text-slate-800">{it.batchNo ?? "—"}</span></div>
                  <div className="text-slate-400">{it.lastUpdated ? new Date(it.lastUpdated).toLocaleDateString() : "—"}</div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button onClick={()=>openEdit(it)} className="px-3 py-1 rounded bg-emerald-50 text-emerald-700 inline-flex items-center gap-1"><Edit3 className="w-4 h-4" /> Edit</button>
                  <button onClick={()=>handleDelete(it)} className="px-3 py-1 rounded bg-rose-50 text-rose-600 inline-flex items-center gap-1"><Trash2 className="w-4 h-4" /> Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* modal */}
      {open && supplierId && (
        <PremiumModal open={open} onClose={()=>{setOpen(false); setEditing(null);}}>
          <InventoryForm supplierId={supplierId} initial={editing ?? undefined} onClose={()=>{setOpen(false); setEditing(null);}} onSaved={()=>{mutate(); setOpen(false); toast.success("Saved");}} />
        </PremiumModal>
      )}
    </div>
  );
}

/* InventoryForm (unchanged functionality) */
function InventoryForm({supplierId, initial, onClose, onSaved}:{supplierId:string; initial?:InventoryItem; onClose:()=>void; onSaved:()=>void}) {
  const isEdit = !!initial?._id;
  const [productId,setProductId] = useState(initial?.product?._id ?? "");
  const [batchNo,setBatchNo] = useState(initial?.batchNo ?? "");
  const [warehouse,setWarehouse] = useState(initial?.warehouse ?? "");
  const [availableQty,setAvailableQty] = useState(initial?.availableQty ?? 0);
  const [costPrice,setCostPrice] = useState(initial?.costPrice ?? 0);
  const [threshold,setThreshold] = useState(initial?.threshold ?? 10);
  const [saving,setSaving] = useState(false);

  const { data: productsData } = useSWR(`/products`, fetcher, { revalidateOnFocus: false });
  const productOptions = Array.isArray(productsData) ? (productsData as ProductRef[]) : Array.isArray((productsData as any)?.data) ? ((productsData as any).data as ProductRef[]) : [];

  async function handleSave(){
    if(!productId) { toast.error("Select product"); return; }
    setSaving(true);
    try {
      const payload = { product: productId, batchNo, warehouse, availableQty, costPrice, threshold };
      if(isEdit && initial?._id) await api.put(`/suppliers/${supplierId}/inventories/${initial._id}`, payload);
      else await api.post(`/suppliers/${supplierId}/inventories`, payload);
      onSaved();
    } catch { toast.error("Save failed"); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Product</span>
          <select value={productId} onChange={(e)=>setProductId(e.target.value)} className="p-2 border rounded">
            <option value="">Select…</option>
            {productOptions.map(p=>(<option key={p._id} value={p._id}>{p.name} {p.brand?`— ${p.brand}`:""}</option>))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Batch No</span>
          <input value={batchNo} onChange={(e)=>setBatchNo(e.target.value)} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Available Qty</span>
          <input type="number" value={availableQty} onChange={(e)=>setAvailableQty(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Cost Price (₹)</span>
          <input type="number" value={costPrice} onChange={(e)=>setCostPrice(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-500">Threshold</span>
          <input type="number" value={threshold} onChange={(e)=>setThreshold(Number(e.target.value))} className="p-2 border rounded" />
        </label>

        <label className="flex flex-col md:col-span-2">
          <span className="text-sm text-slate-500">Warehouse</span>
          <input value={warehouse} onChange={(e)=>setWarehouse(e.target.value)} className="p-2 border rounded" />
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
        <button disabled={saving} onClick={handleSave} className="px-4 py-2 rounded bg-emerald-600 text-white">{saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}