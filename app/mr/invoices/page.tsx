"use client";

import React, { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Plus, Download, Printer, Search, FileText, Edit3, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type InvoiceItem = { description?: string; qty?: number; price?: number; amount?: number };
type Invoice = {
  _id: string;
  invoiceNo?: string;
  customer?: any;
  items?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: string;
  createdAt?: string;
  createdBy?: any;
};

export default function MRInvoicesPage() {
  const { user } = useAuth();
  const mrId = user?.id;

  // data
  const { data: invoicesResp, mutate } = useSWR(mrId ? `/invoices` : null, fetcher, { revalidateOnFocus: false });
  // normalize invoicesResp -> invoices: Invoice[]
  const invoices: Invoice[] = useMemo(() => {
    if (!invoicesResp) return [];
    // If already an array
    if (Array.isArray(invoicesResp)) return invoicesResp as Invoice[];

    // If envelope shapes
    const maybe = invoicesResp as Record<string, unknown>;
    if (Array.isArray(maybe.items)) return maybe.items as Invoice[];
    if (Array.isArray(maybe.invoices)) return maybe.invoices as Invoice[];
    if (Array.isArray(maybe.data)) return maybe.data as Invoice[];

    // If the server returned a single invoice object, wrap it
    if (typeof maybe === "object" && maybe !== null && (maybe as any)._id) return [maybe as Invoice];

    // Fallback
    return [];
  }, [invoicesResp]);

 // normalize hospitalsResp -> hospitals: any[]
  const { data: hospitalsResp } = useSWR(mrId ? `/mr/hospitals` : null, fetcher, { revalidateOnFocus: false });
  const hospitals = useMemo(() => {
    if (!hospitalsResp) return [];
    if (Array.isArray(hospitalsResp)) return hospitalsResp;

    const maybe = hospitalsResp as Record<string, unknown>;
    if (Array.isArray(maybe.hospitals)) return maybe.hospitals as any[];
    if (Array.isArray(maybe.data)) return maybe.data as any[];
    if (Array.isArray(maybe.items)) return maybe.items as any[];

    // server returned single hospital object
    if (typeof maybe === "object" && maybe !== null && (maybe as any)._id) return [maybe as any];

    return [];
  }, [hospitalsResp]);

  // UI state
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [preview, setPreview] = useState<Invoice | null>(null);

  // new invoice form
  const blankItem = { description: "", qty: 1, price: 0, amount: 0 } as InvoiceItem;
  const [invoiceForm, setInvoiceForm] = useState<{
    customerId?: string;
    items: InvoiceItem[];
    taxPct: number;
    notes?: string;
  }>({ customerId: "", items: [ { ...blankItem } ], taxPct: 0, notes: "" });

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return invoices;
    return invoices.filter((inv) => {
      if ((inv.invoiceNo ?? "").toLowerCase().includes(qq)) return true;
      if ((inv.customer?.name ?? "").toLowerCase().includes(qq)) return true;
      if ((inv.status ?? "").toLowerCase().includes(qq)) return true;
      return false;
    });
  }, [invoices, q]);

  // totals calc
  const formTotals = useMemo(() => {
    const subtotal = (invoiceForm.items || []).reduce((s, it) => s + ((Number(it.qty) || 0) * (Number(it.price) || 0)), 0);
    const tax = Math.round((subtotal * (Number(invoiceForm.taxPct) || 0)) / 100 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { subtotal, tax, total };
  }, [invoiceForm]);

  const handleItemChange = (idx: number, patch: Partial<InvoiceItem>) => {
    setInvoiceForm((s) => {
      const items = [...s.items];
      items[idx] = { ...items[idx], ...patch };
      items[idx].amount = (Number(items[idx].qty) || 0) * (Number(items[idx].price) || 0);
      return { ...s, items };
    });
  };

  const addItem = () => setInvoiceForm((s) => ({ ...s, items: [...s.items, { ...blankItem }] }));
  const removeItem = (idx: number) => setInvoiceForm((s) => ({ ...s, items: s.items.filter((_, i) => i !== idx) }));

  const handleCreate = useCallback(async () => {
    if (!invoiceForm.customerId) return alert("Select customer");
    if (!invoiceForm.items.length) return alert("Add items");
    try {
      setCreating(true);
      const payload = {
        customer: invoiceForm.customerId,
        items: invoiceForm.items.map((it) => ({ description: it.description, qty: it.qty, price: it.price })),
        taxPct: invoiceForm.taxPct,
        notes: invoiceForm.notes,
      };
      await api.post('/mr/invoices', payload);
      setCreating(false);
      setFormOpen(false);
      setInvoiceForm({ customerId: '', items: [{ ...blankItem }], taxPct: 0, notes: '' });
      mutate();
    } catch (err: any) {
      setCreating(false);
      alert(err?.response?.data?.message ?? err?.message ?? 'Create failed');
    }
  }, [invoiceForm, mutate]);

  const handleDownload = async (inv: Invoice) => {
    // simplistic: open printable view in new window (the server could provide a PDF endpoint)
    // create printable HTML
    const html = `
      <html><head><title>Invoice ${inv.invoiceNo}</title><style>body{font-family:Inter,system-ui,Arial;padding:24px;color:#0f172a} .muted{color:#64748b}</style></head>
      <body>
        <h2>Invoice ${inv.invoiceNo}</h2>
        <div class="muted">${inv.customer?.name ?? ''}</div>
        <table style="width:100%;margin-top:12px;border-collapse:collapse">
          <thead><tr><th style="text-align:left;border-bottom:1px solid #e6edf3">Item</th><th style="text-align:right;border-bottom:1px solid #e6edf3">Qty</th><th style="text-align:right;border-bottom:1px solid #e6edf3">Price</th><th style="text-align:right;border-bottom:1px solid #e6edf3">Amount</th></tr></thead>
          <tbody>
            ${inv.items?.map(it => `<tr><td>${it.description}</td><td style="text-align:right">${it.qty}</td><td style="text-align:right">${it.price}</td><td style="text-align:right">${(it.qty||0)*(it.price||0)}</td></tr>`).join('')}
          </tbody>
        </table>
        <div style="margin-top:12px">Subtotal: ${inv.subtotal ?? '0'}</div>
        <div>Tax: ${inv.tax ?? '0'}</div>
        <div style="font-weight:700;margin-top:6px">Total: ${inv.total ?? '0'}</div>
      </body></html>`;
    const newWin = window.open('', '_blank');
    if (newWin) {
      newWin.document.write(html);
      newWin.document.close();
      // try to auto print
      setTimeout(() => newWin.print(), 600);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Invoices</h1>
          <p className="text-slate-500 mt-1">Manage, create and export invoices you raised as MR.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-full px-3 py-2 border shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice #, customer or status" className="bg-transparent outline-none text-sm w-64" />
          </div>

          <button onClick={() => { setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent invoices</h2>
            <div className="text-sm text-slate-500">{filtered.length} results</div>
          </div>

          <div className="space-y-3">
            {filtered.map((inv) => (
              <div key={inv._id} className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold truncate">{inv.invoiceNo ?? String(inv._id).slice(-6)}</div>
                    <div className="text-xs text-slate-500">• {inv.customer?.name ?? '—'}</div>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{new Date(inv.createdAt ?? '').toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Total</div>
                    <div className="font-semibold">₹{inv.total ?? inv.subtotal ?? 0}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setPreview(inv)} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm inline-flex items-center gap-2"><FileText className="w-4 h-4" /> View</button>
                    <button onClick={() => handleDownload(inv)} className="px-3 py-1 rounded border text-sm inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export</button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && <div className="p-6 text-center text-slate-500">No invoices found.</div>}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold">Summary</h4>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-emerald-50 rounded p-3 text-center">
                <div className="text-xs text-slate-500">Invoices</div>
                <div className="font-semibold mt-1">{invoices?.length ?? 0}</div>
              </div>
              <div className="bg-slate-50 rounded p-3 text-center">
                <div className="text-xs text-slate-500">Pending</div>
                <div className="font-semibold mt-1">{invoices?.filter((i: any) => (i.status||'').toLowerCase() === 'pending').length ?? 0}</div>
              </div>
              <div className="bg-slate-50 rounded p-3 text-center">
                <div className="text-xs text-slate-500">Paid</div>
                <div className="font-semibold mt-1">{invoices?.filter((i: any) => (i.status||'').toLowerCase() === 'paid').length ?? 0}</div>
              </div>
              <div className="bg-slate-50 rounded p-3 text-center">
                <div className="text-xs text-slate-500">Total Value</div>
                <div className="font-semibold mt-1">₹{invoices?.reduce((s: number, it: any) => s + (it.total || it.subtotal || 0), 0) ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold">Quick actions</h4>
            <div className="mt-3 space-y-2">
              <button onClick={() => { setFormOpen(true); setInvoiceForm({ customerId: '', items: [{ ...blankItem }], taxPct: 0, notes: '' }); window.scrollTo({ top: 0 }); }} className="w-full px-4 py-2 rounded bg-emerald-600 text-white">Create invoice</button>
              <button onClick={() => { mutate(); }} className="w-full px-4 py-2 rounded border">Refresh</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Create form modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)}>
        <div className="p-4 max-w-3xl">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Create Invoice</h3>
              <div className="mt-2 text-sm text-slate-600">Fill the invoice details and save.</div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <select value={invoiceForm.customerId} onChange={(e) => setInvoiceForm((s) => ({ ...s, customerId: e.target.value }))} className="md:col-span-2 p-2 border rounded">
                  <option value="">Select hospital / customer...</option>
                  {hospitals?.map((h: any) => <option key={h._id} value={h._id}>{h.name} {h.city ? `— ${h.city}` : ''}</option>)}
                </select>

                <input value={invoiceForm.taxPct} onChange={(e) => setInvoiceForm((s) => ({ ...s, taxPct: Number(e.target.value) }))} type="number" className="p-2 border rounded" placeholder="Tax %" />
              </div>

              <div className="mt-4">
                <div className="space-y-3">
                  {invoiceForm.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input className="flex-1 p-2 border rounded" value={it.description} onChange={(e) => handleItemChange(idx, { description: e.target.value })} placeholder="Item description" />
                      <input className="w-20 p-2 border rounded" value={it.qty} onChange={(e) => handleItemChange(idx, { qty: Number(e.target.value) })} type="number" />
                      <input className="w-28 p-2 border rounded" value={it.price} onChange={(e) => handleItemChange(idx, { price: Number(e.target.value) })} type="number" />
                      <div className="w-28 text-right">₹{(Number(it.qty)||0)*(Number(it.price)||0)}</div>
                      <button onClick={() => removeItem(idx)} className="px-3 py-1 rounded border text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2">
                    <button onClick={addItem} className="px-3 py-2 rounded bg-slate-50 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add item</button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-4">
                  <div className="text-sm text-slate-500">Subtotal: ₹{formTotals.subtotal.toFixed(2)}</div>
                  <div className="text-sm text-slate-500">Tax: ₹{formTotals.tax.toFixed(2)}</div>
                  <div className="font-semibold">Total: ₹{formTotals.total.toFixed(2)}</div>
                </div>

                <div className="mt-4 flex items-center gap-3 justify-end">
                  <button onClick={() => setFormOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
                  <button onClick={handleCreate} disabled={creating} className="px-4 py-2 rounded bg-emerald-600 text-white font-semibold">{creating ? 'Creating…' : 'Create'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)}>
        {preview && (
          <div className="p-4 max-w-3xl">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Invoice {preview.invoiceNo}</h3>
                    <div className="text-sm text-slate-500">{preview.customer?.name ?? '—'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDownload(preview)} className="px-3 py-1 rounded border inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export</button>
                    <button onClick={() => window.print()} className="px-3 py-1 rounded bg-slate-50 inline-flex items-center gap-2"><Printer className="w-4 h-4" /> Print</button>
                  </div>
                </div>

                <div className="mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500"><th>Item</th><th className="text-right">Qty</th><th className="text-right">Price</th><th className="text-right">Amount</th></tr>
                    </thead>
                    <tbody>
                      {preview.items?.map((it, i) => (
                        <tr key={i} className="border-t"><td>{it.description}</td><td className="text-right">{it.qty}</td><td className="text-right">{it.price}</td><td className="text-right">{(it.qty||0)*(it.price||0)}</td></tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 flex justify-end gap-6 text-sm">
                    <div>Subtotal: ₹{preview.subtotal ?? 0}</div>
                    <div>Tax: ₹{preview.tax ?? 0}</div>
                    <div className="font-semibold">Total: ₹{preview.total ?? 0}</div>
                  </div>

                  <div className="mt-4 text-sm text-slate-600">{preview.notes}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
