"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import useSWR from "swr";
import Modal from "../ui/Modal";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type Product = { _id: string; name?: string; brand?: string; price: number; unit?: string; image?: string };

// debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 180) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait) as unknown as number;
  };
}

export default function OrderForm({ hospitalId, onPlaced }: { hospitalId: string; onPlaced?: () => void }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data, mutate, isValidating } = useSWR("/products", (url: string) => api.get(url).then((r) => r.data));

  // normalize shapes (supports array, {data:[]}, {products:[]})
  const raw = data as unknown;
  let rawList: unknown[] = [];
  if (Array.isArray(raw)) rawList = raw;
  else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.products)) rawList = obj.products as unknown[];
    else if (Array.isArray(obj.data)) rawList = obj.data as unknown[];
  }
  const products: Product[] = rawList.map((x) => {
    const p = x as Record<string, unknown>;
    const id = (p._id as string | undefined) ?? (p.id as string | undefined) ?? String(Math.random()).slice(2);
    const name = (p.name as string | undefined) ?? "Unnamed product";
    const brand = (p.brand as string | undefined) ?? "";
    const priceVal = p.price as unknown;
    const price = typeof priceVal === "number" ? priceVal : Number(priceVal ?? 0);
    const unit = (p.unit as string | undefined) ?? "";
    const imagesVal = p.images as unknown;
    let image: string | undefined = undefined;
    if (Array.isArray(imagesVal) && imagesVal.length > 0) {
      const first = (imagesVal as unknown[])[0];
      if (typeof first === "string") image = first;
    } else if (typeof p.image === "string") {
      image = p.image as string;
    }
    return { _id: id, name, brand, price, unit, image } as Product;
  });

  // debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const d = debounce((q: string) => setDebouncedQuery(q), 160);
    d(query.trim());
  }, [query]);
  const q = (debouncedQuery || "").toLowerCase();

  const filtered = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (!q) return products;
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      const unit = (p.unit || "").toLowerCase();
      return name.includes(q) || brand.includes(q) || unit.includes(q);
    });
  }, [products, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const [selected, setSelected] = useState<Record<string, number>>({});
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (products.length) {
      setSelected((prev) => {
        const copy = { ...prev };
        products.slice(0, 50).forEach((p) => {
          if (!(p._id in copy)) copy[p._id] = 0;
        });
        return copy;
      });
    }
  }, [products]);

  const items = useMemo(
    () =>
      Object.entries(selected)
        .map(([productId, qty]) => {
          const p = products.find((x) => x._id === productId);
          if (!p || qty <= 0) return null;
          return { productId, quantity: qty, price: Number(p.price || 0), name: p.name || "Unnamed product" };
        })
        .filter((it): it is { productId: string; quantity: number; price: number; name: string } => !!it),
    [selected, products]
  );
  const total = items.reduce((s, it) => s + Number(it.quantity) * Number(it.price), 0);

  // typed notify helper
  type WindowWithToast = Window & { toast?: (m: string) => void };
  const notify = (m: string) => {
    try {
      if (typeof window !== "undefined") {
        const w = window as unknown as WindowWithToast;
        if (typeof w.toast === "function") {
          w.toast(m);
          return;
        }
      }
    } catch {
      // ignore
    }
    // fallback
    // eslint-disable-next-line no-alert
    alert(m);
  };

  const handlePlace = async () => {
    if (items.length === 0) {
      notify("Please select at least one item.");
      return;
    }
    setPreviewOpen(true);
  };

  const doPlace = async () => {
    try {
      await api.post("/orders", { hospitalId, products: items, totalPrice: total });
      notify("Order placed successfully");
      setSelected({});
      setPreviewOpen(false);
      onPlaced?.();
      mutate();
    } catch (err: unknown) {
      const maybe = err as { response?: { data?: { message?: string } }; message?: string } | undefined;
      const message = maybe?.response?.data?.message || maybe?.message || "Order failed";
      notify(String(message));
    }
  };

  const highlight = (text = "") => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <span>
        {before}
        <span className="bg-amber-100 text-amber-900 font-semibold px-1 rounded">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-b from-white/70 via-slate-50/60 to-white/70 border border-slate-100 shadow-xl">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Create Order</h2>
          <p className="text-sm text-slate-500">Pick products for the hospital and place orders quickly.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-slate-100">
            <Search className="w-4 h-4 text-slate-400 mr-3" />
            <input
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, brand or unit"
              className="w-72 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="text-sm text-slate-600">Page {page}/{totalPages}</div>
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isValidating && products.length === 0 && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/70 border border-slate-100 shadow-sm animate-pulse" />
        ))}

        {!isValidating && paged.length === 0 && (
          <div className="col-span-full p-8 rounded-xl bg-white border border-dashed border-slate-200 text-center">
            <div className="text-lg font-medium text-slate-700">No products found</div>
            <div className="text-sm text-slate-500 mt-1">Try clearing the search or try different keywords.</div>
          </div>
        )}

        {paged.map((p) => (
          <article key={p._id} className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 border border-slate-100">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name || "product"} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 text-xs">No image</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900 truncate">{highlight(p.name || "Unnamed product")}</h3>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">₹{Number(p.price || 0)}</div>
                    <div className="inline-block mt-2 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{p.unit || "unit"}</div>
                  </div>
                </div>

                <p className="text-sm text-slate-500 mt-2 truncate">{p.brand || "Unknown brand"}</p>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    aria-label={`Quantity for ${p.name || p._id}`}
                    type="number"
                    min={0}
                    value={selected[p._id] ?? 0}
                    onChange={(e) => setSelected((prev) => ({ ...prev, [p._id]: Math.max(0, Number(e.target.value)) }))}
                    className="w-28 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                  <div className="ml-auto text-sm text-slate-600">Subtotal <span className="font-semibold">₹{((selected[p._id] ?? 0) * Number(p.price || 0)).toFixed(0)}</span></div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* footer */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(Math.max(1, page - 1))} className="p-2 rounded-lg bg-white border shadow-sm hover:scale-105 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm text-slate-600">Page {page} of {totalPages}</div>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="p-2 rounded-lg bg-white border shadow-sm hover:scale-105 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">Total <span className="text-emerald-600">₹{total.toFixed(0)}</span></div>
          <button onClick={handlePlace} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow">Preview & Place</button>
        </div>
      </div>

      {/* preview modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <h3 className="text-lg font-medium mb-2">Order Preview</h3>
        <div className="space-y-2 max-h-64 overflow-auto">
          {items.map((it) => (
            <div key={it.productId} className="flex justify-between">
              <div className="text-sm">{it.name} × {it.quantity}</div>
              <div className="text-sm font-semibold">₹{it.quantity * it.price}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="font-semibold">Total ₹{total.toFixed(0)}</div>
          <div>
            <button onClick={() => setPreviewOpen(false)} className="mr-2 px-3 py-1 border rounded">Cancel</button>
            <button onClick={doPlace} className="px-3 py-1 bg-emerald-600 text-white rounded">Confirm Place</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}