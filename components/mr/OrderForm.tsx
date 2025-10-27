// components/mr/OrderForm.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Search, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import Modal from "../ui/Modal";

/* ----------------------------- Types ----------------------------- */

interface ProductRaw {
  _id?: string;
  id?: string;
  name?: string;
  brand?: string;
  mrp?: number | string;
  tradePrice?: number | string;
  unit?: string;
  category?: string;
  images?: string[] | unknown;
  image?: string;
  createdBy?: string | { _id?: string };
  [k: string]: unknown;
}

interface InventoryRaw {
  _id?: string;
  product?: string | { _id?: string } | unknown;
  supplier?: string | { _id?: string } | unknown;
  availableQty?: number | string; // corresponds to Inventory.availableQty
  costPrice?: number | string; // corresponds to Inventory.costPrice
  [k: string]: unknown;
}

interface StockRaw {
  _id?: string;
  product?: string | { _id?: string } ;
  supplier?: string | { _id?: string };
  quantity?: number | string; // corresponds to Stock.quantity
  [k: string]: unknown;
}

type Product = {
  _id: string;
  name: string;
  brand?: string;
  category?: string;
  image?: string;
  displayPrice: number; // final price shown: inventory costPrice > product.tradePrice > product.mrp
  availableStock?: number | null; // from inventory.availableQty or stock.quantity
  supplierName?: string;
};

/* ----------------------------- Helpers --------------------------- */

const money = (n = 0) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 160) {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait) as unknown as number;
  };
}

const PlaceholderImage: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="72" height="72" rx="10" fill="#f8fafc" />
      <path d="M18 34h36v10H18z" fill="#eef2f7" />
      <path d="M22 28h28v4H22z" fill="#e6edf3" />
    </svg>
  </div>
);

/* --------------------------- Component --------------------------- */

export default function OrderForm({ hospitalId, onPlaced }: { hospitalId?: string; onPlaced?: () => void }) {
  const perPage = 3;
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // fetch products, inventories and stocks
  const { data: prodData, isValidating: prodLoading, mutate: mutateProducts } = useSWR<any>("/products", (url: string) => api.get(url).then((r) => r.data));
  const { data: invData, isValidating: invLoading, mutate: mutateInv } = useSWR<any>("/inventories", (url: string) => api.get(url).then((r) => r.data), { revalidateOnFocus: false });
  const { data: stocksData, isValidating: stocksLoading, mutate: mutateStocks } = useSWR<any>("/stocks", (url: string) => api.get(url).then((r) => r.data), { revalidateOnFocus: false });

  // normalize product list
  const rawProducts: ProductRaw[] = useMemo(() => {
    if (!prodData) return [];
    if (Array.isArray(prodData)) return prodData as ProductRaw[];
    const obj = prodData as Record<string, any>;
    if (Array.isArray(obj.products)) return obj.products as ProductRaw[];
    if (Array.isArray(obj.data)) return obj.data as ProductRaw[];
    return [];
  }, [prodData]);

  // normalize inventories (Inventory model)
  const rawInventories: InventoryRaw[] = useMemo(() => {
    if (!invData) return [];
    if (Array.isArray(invData)) return invData as InventoryRaw[];
    const obj = invData as Record<string, any>;
    if (Array.isArray(obj.data)) return obj.data as InventoryRaw[];
    if (Array.isArray(obj.inventories)) return obj.inventories as InventoryRaw[];
    return [];
  }, [invData]);

  // normalize stocks (Stock model)
  const rawStocks: StockRaw[] = useMemo(() => {
    if (!stocksData) return [];
    if (Array.isArray(stocksData)) return stocksData as StockRaw[];
    const obj = stocksData as Record<string, any>;
    if (Array.isArray(obj.data)) return obj.data as StockRaw[];
    if (Array.isArray(obj.stocks)) return obj.stocks as StockRaw[];
    return [];
  }, [stocksData]);

  // build maps: inventoryMap (productId -> inventory) and stockMap (productId -> stock)
  const inventoryMap = useMemo(() => {
    const m = new Map<string, InventoryRaw>();
    for (const inv of rawInventories) {
      const pid = typeof inv.product === "string" ? inv.product : inv.product && typeof inv.product === "object" ? String((inv.product as any)._id ?? "") : "";
      if (!pid) continue;
      const cur = m.get(pid);
      const price = Number(inv.costPrice ?? 0) || 0;
      // prefer inventory with costPrice > 0 or higher costPrice
      if (!cur) m.set(pid, inv);
      else {
        const curPrice = Number(cur.costPrice ?? 0) || 0;
        if (price > curPrice) m.set(pid, inv);
      }
    }
    return m;
  }, [rawInventories]);

  const stockMap = useMemo(() => {
  const m = new Map<string, StockRaw>();

  for (const s of rawStocks) {
    // Determine product id robustly
    let pid = "";
    if (!s) continue;

    // product could be a string id or an object like { _id: "..." } or { product: {...} }
    if (typeof s.product === "string") {
      pid = s.product;
    } else if (s.product && typeof s.product === "object") {
      // try common id keys
      pid = String((s.product as { _id?: string })._id ?? (s.product as any).id ?? "");
    }

    if (!pid) continue;

    // parse quantity as number (safe)
    const qty = Number(s.quantity ?? 0) || 0;

    const existing = m.get(pid);
    if (!existing) {
      m.set(pid, s);
      continue;
    }

    // Prefer stock entry with higher quantity (simple heuristic)
    const existingQty = Number(existing.quantity ?? 0) || 0;
    if (qty > existingQty) {
      m.set(pid, s);
    }
  }

  return m;
}, [rawStocks]);

  // merge into Product[]: prefer inventory costPrice, fallback to tradePrice then mrp
  const products: Product[] = useMemo(() => {
    return rawProducts.map((p) => {
      const id = String(p._id ?? p.id ?? "");
      const inv = inventoryMap.get(id);
      const stock = stockMap.get(id);
      const mrp = Number(p.mrp ?? p.tradePrice ?? p.tradePrice ?? 0) || 0;
      const trade = Number(p.tradePrice ?? 0) || 0;
      const invPrice = Number(inv?.costPrice ?? 0) || 0;
      const displayPrice = invPrice > 0 ? invPrice : trade > 0 ? trade : mrp;
      const images = Array.isArray(p.images) ? (p.images as any[]).map(String) : [];
      const image = typeof p.image === "string" ? p.image : images.length ? images[0] : undefined;
      const availableStock = inv ? (Number(inv.availableQty ?? 0) || null) : stock ? (Number(stock.quantity ?? 0) || null) : null;

      return {
        _id: id || (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function" ? (crypto as any).randomUUID() : String(Math.random()).slice(2)),
        name: String(p.name ?? "Unnamed product"),
        brand: p.brand ? String(p.brand) : undefined,
        category: typeof p.category === "string" ? p.category : undefined,
        image,
        displayPrice,
        availableStock,
        supplierName: inv && (inv as any).supplier ? String((inv as any).supplier) : undefined,
      } as Product;
    });
  }, [rawProducts, inventoryMap, stockMap]);

  /* ---------------------------- search ------------------------------- */
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const d = debounce((s: string) => setDebouncedQuery(s), 200);
    d(query.trim());
  }, [query]);
  const q = (debouncedQuery || "").toLowerCase();

  const filtered = useMemo(() => {
    if (!products) return [];
    if (!q) return products;
    return products.filter((p) => [p.name, p.brand ?? "", p.unit ?? ""].some((s) => s && s.toLowerCase().includes(q)));
  }, [products, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  /* --------------------------- cart state --------------------------- */
  const [cart, setCart] = useState<Record<string, number>>({});
  useEffect(() => {
    if (products.length === 0) return;
    setCart((prev) => {
      const copy = { ...prev };
      products.forEach((p) => {
        if (!(p._id in copy)) copy[p._id] = 0;
      });
      return copy;
    });
  }, [products]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, qty]) => {
        if (!qty || qty <= 0) return null;
        const p = products.find((x) => x._id === productId);
        if (!p) return null;
        return {
          productId,
          qty,
          price: p.displayPrice ?? 0,
          name: p.name,
          image: p.image,
        };
      })
      .filter(Boolean) as Array<{ productId: string; qty: number; price: number; name: string; image?: string }>;
  }, [cart, products]);

  const subtotal = useMemo(() => cartItems.reduce((s, it) => s + it.qty * it.price, 0), [cartItems]);
  const total = subtotal;

  /* ------------------------ cart handlers --------------------------- */
  const addOne = (id: string) => setCart((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
  const removeOne = (id: string) => setCart((s) => ({ ...s, [id]: Math.max(0, (s[id] ?? 0) - 1) }));
  const setQty = (id: string, val: number) => setCart((s) => ({ ...s, [id]: Math.max(0, Math.floor(val)) }));
  const removeFromCart = (id: string) => setCart((s) => ({ ...s, [id]: 0 }));

  /* ------------------------ place order flow ------------------------ */
  const [placing, setPlacing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const placeOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Please add at least one item to the cart.");
      return;
    }
    setConfirmOpen(true);
  };

  const doConfirmPlace = async () => {
    setConfirmOpen(false);
    setPlacing(true);
    const tid = toast.loading("Placing order...");
    try {
      const payload = {
        customer: hospitalId,            // required by spec & model
        // placedBy: don't set from client; server will set from cookie user
        items: cartItems.map((it) => ({
          productId: it.productId,        // server maps 'product' -> ObjectId in model
          quantity: it.qty,
          price: it.price,
        })),
        // optional fields:
        source: "MR_PORTAL",
        prescriptionFileUrl: undefined,
      };
      await api.post("/orders", payload);
      toast.dismiss(tid);
      toast.success("Order placed");
      setCart({});
      mutateProducts();
      mutateInv();
      mutateStocks();
      onPlaced?.();
    } catch (err: any) {
      toast.dismiss(tid);
      const message = err?.response?.data?.message ?? err?.message ?? "Order failed";
      toast.error(String(message));
    } finally {
      setPlacing(false);
    }
  };

  /* --------------------------- ProductCard -------------------------- */
  const ProductCard: React.FC<{ p: Product }> = ({ p }) => {
    const qty = cart[p._id] ?? 0;
    const subtotalLine = qty * (p.displayPrice ?? 0);
    return (
      <article className="flex gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
        <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <PlaceholderImage />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm text-slate-500 mb-1 truncate">{p.brand ?? ""}</div>
              <h3 className="font-semibold text-slate-900 text-lg truncate">{p.name}</h3>
            </div>

            <div className="text-right ml-2 flex-shrink-0">
              {p.displayPrice > 0 ? (
                <div className="text-emerald-600 font-bold">₹{money(p.displayPrice)}</div>
              ) : (
                <div className="text-sm text-slate-400">—</div>
              )}
              <div className="text-xs mt-1">
                <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium text-xs">{p.category ?? "General"}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-2 truncate">{p.supplierName ? `from ${p.supplierName}` : ""}</p>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => removeOne(p._id)} className="p-1 border rounded hover:bg-slate-50" aria-label="decrease">
              <Minus className="w-4 h-4" />
            </button>

            <input
              aria-label={`Quantity for ${p.name}`}
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(p._id, Number(e.target.value))}
              className="w-24 max-w-[120px] px-3 py-2 border rounded-lg text-sm outline-none"
            />

            <button onClick={() => addOne(p._id)} className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700" aria-label="increase">
              <Plus className="w-4 h-4" />
            </button>

            <div className="ml-auto text-sm text-slate-600 whitespace-nowrap">Subtotal <span className="font-semibold">{p.displayPrice > 0 ? `₹${money(subtotalLine)}` : "—"}</span></div>
          </div>
        </div>
      </article>
    );
  };

  /* ----------------------------- Render ---------------------------- */

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Products column */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Create Order</h2>
              <p className="text-sm text-slate-500 max-w-xl">Search and add products — supplier inventory price is used when available.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="text-sm text-slate-500 whitespace-nowrap">Page <span className="font-semibold">{page}</span>/<span className="text-slate-400">{totalPages}</span></div>
            </div>
          </div>

           <div className="flex items-center bg-slate-50 mb-4 px-3 py-2 rounded-full border border-slate-100 w-full md:w-[520px]">
                <Search className="w-4 h-4 text-slate-400 mr-3" />
                <input
                  placeholder="Search product name, brand, or unit..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

          <div className="grid gap-4">
            {prodLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-50 rounded-lg animate-pulse" />
            ))}

            {!prodLoading && paged.length === 0 && (
              <div className="p-6 text-center text-slate-500 border border-dashed rounded-lg">No products found.</div>
            )}

            {paged.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}

          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <div>Page {page} of {totalPages}</div>
            <div className="space-x-2">
              <button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page <= 1} className="px-3 py-1 border rounded bg-white">Prev</button>
              <button onClick={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded bg-white">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart sidebar */}
      <aside className="lg:col-span-4">
        <div className="sticky top-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Cart</h3>
              <div className="text-sm text-slate-500">{cartItems.length} item(s)</div>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-10">Your cart is empty. Add items to begin.</div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-auto divide-y divide-slate-100 pr-2">
                  {cartItems.map((it) => (
                    <div key={it.productId} className="py-2 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {it.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                        ) : (
                          <PlaceholderImage className="w-12 h-12" />
                        )}
                      </div>

                      <div className="flex-1 text-sm truncate">
                        <div className="font-medium truncate">{it.name}</div>
                        <div className="text-xs text-slate-500">x{it.qty}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold">₹{money(it.price * it.qty)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t pt-4 space-y-3 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">₹{money(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span className="font-semibold">₹0</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className="font-semibold">₹0</span></div>

                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-emerald-600 font-extrabold">₹{money(total)}</span>
                  </div>

                  <button onClick={placeOrder} disabled={placing} className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold shadow">
                    {placing ? (<span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Placing...</span>) : "Preview & Place Order"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 border shadow-sm text-sm text-slate-600">
            <div className="font-medium mb-2">Tips</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Supplier inventory price shown when available</li>
              <li>Stock reflects supplier Inventory.availableQty or Stock.quantity</li>
              <li>Use cart to adjust quantities & review totals</li>
            </ul>
          </div>
        </div>
      </aside>

      {/* confirm modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h3 className="text-lg font-semibold">Confirm Order</h3>
        <p className="text-sm text-slate-600 mt-2">You're about to place an order with {cartItems.length} item(s).</p>

        <div className="mt-4 space-y-2 max-h-48 overflow-auto">
          {cartItems.map((it) => (
            <div key={it.productId} className="flex justify-between text-sm">
              <div className="truncate">{it.name} × {it.qty}</div>
              <div className="font-medium">₹{money(it.qty * it.price)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="font-semibold">Total</div>
          <div className="text-xl font-bold text-emerald-600">₹{money(total)}</div>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={() => setConfirmOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={doConfirmPlace} className="px-3 py-1 bg-emerald-600 text-white rounded">Place order</button>
        </div>
      </Modal>
    </div>
  );
}