// components/ui/CreatePOModal.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { X, Plus, Trash2 } from "lucide-react";

type Product = { _id: string; name?: string; brand?: string; mrp?: number };
type Client = { _id: string; name?: string; city?: string };

export default function CreatePOModal({
  open,
  onClose,
  supplierId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  supplierId: string;
  onCreated?: () => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [clientId, setClientId] = useState<string>("");
  const [rows, setRows] = useState<{ productId?: string; qty: number; price?: number }[]>([
    { productId: undefined, qty: 1, price: undefined },
  ]);

  useEffect(() => {
    if (!open) return;
    // fetch clients (hospitals) and products
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([api.get("/hospitals?limit=200"), api.get("/products?limit=500")]);
        const cData = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.data ?? cRes.data?.hospitals ?? []);
        const pData = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.data ?? pRes.data?.products ?? []);
        setClients(cData);
        setProducts(pData);
      } catch (err) {
        console.error("Load PO data", err);
      }
    })();
  }, [open]);

  const addRow = () => setRows((r) => [...r, { qty: 1 }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<typeof rows[0]>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const canSubmit = useMemo(() => {
    if (!supplierId) return false;
    if (!clientId) return false;
    if (!rows.length) return false;
    return rows.some((r) => r.productId && r.qty > 0);
  }, [supplierId, clientId, rows]);

  const handleSubmit = async () => {
    if (!canSubmit) return toast.error("Please choose client and at least one product/qty");
    setLoading(true);
    try {
      // Build order-like payload: we use /orders with source: 'PO' and placedBy = supplier (supplier creates PO)
      const items = rows
        .filter((r) => r.productId && r.qty > 0)
        .map((r) => ({ product: r.productId, qty: r.qty, price: r.price ?? undefined }));
      const payload = {
        customer: clientId,
        placedBy: supplierId,
        source: "PO",
        items,
        // totalAmount optional — server can calculate
      };
      await api.post(`/orders`, payload);
      toast.success("Purchase order created");
      onCreated?.();
      onClose();
    } catch (err: any) {
      console.error("Create PO error", err);
      toast.error(err?.response?.data?.message ?? "Failed to create PO");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onClose()} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <div>
            <h3 className="text-lg font-semibold">Create Purchase Order</h3>
            <div className="text-xs text-slate-500">Quick PO to a hospital/client</div>
          </div>
          <button className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => onClose()}>
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Client / Hospital</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.city ? `— ${c.city}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Expected date</label>
              <input type="date" className="w-full p-2 border rounded" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Products</div>
              <button type="button" onClick={addRow} className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded bg-emerald-600 text-white">
                <Plus className="w-4 h-4" /> Add product
              </button>
            </div>

            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <select
                      value={r.productId ?? ""}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const found = products.find((p) => p._id === pid);
                        updateRow(i, { productId: pid, price: found?.mrp ?? undefined });
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Choose product…</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} {p.brand ? `— ${p.brand}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min={0}
                      value={r.qty}
                      onChange={(e) => updateRow(i, { qty: Math.max(0, Number(e.target.value || 0)) })}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      min={0}
                      value={r.price ?? ""}
                      onChange={(e) => updateRow(i, { price: e.target.value === "" ? undefined : Number(e.target.value) })}
                      placeholder="price (optional)"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    <button onClick={() => removeRow(i)} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => onClose()} className="px-4 py-2 rounded border">Cancel</button>
            <button onClick={handleSubmit} disabled={!canSubmit || loading} className="px-4 py-2 rounded bg-emerald-600 text-white">
              {loading ? "Creating…" : "Create PO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}