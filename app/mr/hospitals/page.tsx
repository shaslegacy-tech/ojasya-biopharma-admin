"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Phone, Mail, ExternalLink, Info, Search, Grid, List } from "lucide-react";
import Modal from "@/components/ui/Modal";

// Fetcher
const fetcher = (url: string) => api.get(url).then((r) => r.data);

// Small card component
function HospitalCard({ h, onOpen }: { h: any; onOpen: (h: any) => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border p-4 hover:shadow-2xl transition flex flex-col overflow-hidden min-h-[140px]">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center border flex-shrink-0">
          <div className="text-sm font-bold text-emerald-700">{(h.name || "—").slice(0,2).toUpperCase()}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg font-semibold truncate">{h.name ?? "Unnamed Hospital"}</div>
              <div className="text-xs text-slate-500 mt-1 truncate">{h.city ? `${h.city}${h.state ? ", " + h.state : ""}` : (h.address ?? "—")}</div>
            </div>
            <div className="text-right text-sm flex-shrink-0 ml-2">
              <div className="text-slate-400">Assigned</div>
              <div className="font-medium text-emerald-700">{h.assignedSince ? new Date(h.assignedSince).toLocaleDateString() : "—"}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
            <div className="inline-flex items-center gap-2 truncate"><MapPin className="w-3 h-3" /> <span className="truncate max-w-[220px]">{h.address ? (h.address.length > 80 ? h.address.slice(0,80)+"..." : h.address) : '—'}</span></div>
            <div className="inline-flex items-center gap-2"><Phone className="w-3 h-3" /> <span className="truncate">{h.phone ?? '—'}</span></div>
            <div className="inline-flex items-center gap-2"><Mail className="w-3 h-3" /> <span className="truncate">{h.email ?? '—'}</span></div>
          </div>

        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500 truncate">DL: {h.dlNumber ?? '—'}</div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => onOpen(h)} className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm flex items-center gap-2"><Info className="w-4 h-4" /> Details</button>
          <a href={`/mr/hospitals/${h._id}`} className="px-3 py-1 rounded-md border text-sm inline-flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Open</a>
        </div>
      </div>
    </div>
  );
}

export default function MRAssignedHospitalsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  const { data, error, isValidating, mutate } = useSWR(userId ? `/mr/hospitals` : null, fetcher, { revalidateOnFocus: false });
  // optionally fetch summary for count
  const { data: summary } = useSWR(userId ? `/mr/hospitals?summary=true` : null, fetcher, { revalidateOnFocus: false });

  const raw = data?.hospitals ?? data ?? [];
  const assignedCount = summary?.assignedCount ?? (Array.isArray(raw) ? raw.length : (summary?.count ?? 0));

  const hospitals = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? raw?.hospitals ?? []);
    if (!Array.isArray(arr)) return [];
    const ql = q.trim().toLowerCase();
    const filtered = arr.filter((h: any) => {
      if (!ql) return true;
      if ((h.name ?? '').toLowerCase().includes(ql)) return true;
      if ((h.city ?? '').toLowerCase().includes(ql)) return true;
      if ((h.contactPerson ?? '').toLowerCase().includes(ql)) return true;
      if ((h.email ?? '').toLowerCase().includes(ql)) return true;
      return false;
    });
    // sort by name then city
    filtered.sort((a: any, b: any) => (a.name ?? '').localeCompare(b.name ?? ''));
    return filtered;
  }, [raw, q]);

  const openDetails = (h: any) => setSelected(h);
  const closeDetails = () => setSelected(null);

  if (!user) return <div className="p-6">Please login to see assigned hospitals</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load assigned hospitals</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl p-6 shadow-2xl mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Assigned Hospitals</h1>
            <p className="mt-1 text-sm opacity-90">All hospitals assigned to you. Use search or switch view to manage visits, orders and details.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-white/90 text-right">
              <div className="text-xs">Assigned</div>
              <div className="text-lg font-bold">{isNaN(Number(assignedCount)) ? '—' : assignedCount}</div>
            </div>

            <div className="bg-white/10 px-3 py-2 rounded-full flex items-center gap-2">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode==='grid' ? 'bg-white/20' : ''}`} title="Grid"><Grid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode==='list' ? 'bg-white/20' : ''}`} title="List"><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center bg-white rounded-full px-3 py-2 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hospital, city or contact" className="bg-transparent outline-none w-full text-sm text-black placeholder-slate-400" />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => mutate()} className="px-4 py-2 rounded-lg bg-white text-emerald-700 font-semibold">Refresh</button>
          </div>
        </div>
      </div>

      <div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((h: any) => (
              <HospitalCard key={h._id} h={h} onOpen={openDetails} />
            ))}
          </div>
        ) : (
<div className="space-y-4">
  {hospitals.map((h: any) => (
    <div
      key={h._id}
      className="relative bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-2xl transition overflow-hidden flex flex-col md:flex-row gap-4 p-4 items-stretch"
    >
      {/* left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-400" />

      <div className="flex items-center gap-4 md:gap-6 md:flex-shrink-0">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
          {(h.name || '--').slice(0,2).toUpperCase()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-slate-900 leading-tight truncate">{h.name}</div>
            <div className="text-sm text-slate-500 mt-1 truncate">{h.address ? (h.address.length > 80 ? h.address.slice(0,80) + '...' : h.address) : (h.city ?? '—')}</div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 text-xs bg-slate-50 rounded-full px-3 py-1 text-slate-600">{h.city ?? '—'}</span>
              {h.contactPerson && <span className="inline-flex items-center gap-2 text-xs bg-slate-50 rounded-full px-3 py-1 text-slate-600">{h.contactPerson}</span>}
              {h.email && <span className="inline-flex items-center gap-2 text-xs bg-emerald-50 rounded-full px-3 py-1 text-emerald-700">{h.email}</span>}
            </div>
          </div>

          <div className="text-right md:text-right flex-shrink-0">
            <div className="text-xs text-slate-400">Assigned</div>
            <div className="font-semibold text-emerald-700">{h.assignedSince ? new Date(h.assignedSince).toLocaleDateString() : '—'}</div>
            <div className="text-xs text-slate-400 mt-2">{h.lastOrderDate ? `Last order: ${new Date(h.lastOrderDate).toLocaleDateString()}` : ''}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          <div className="md:col-span-2">
            <div className="text-sm text-slate-600">Highlights</div>
            <div className="mt-2 text-sm text-slate-700">{h.notes ?? 'No notes available. Click Details to view more.'}</div>
          </div>

          <div className="flex items-center justify-end md:justify-start gap-3 md:col-span-1">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 rounded p-2 text-center">
                <div className="text-slate-500">Orders</div>
                <div className="font-semibold">{h.ordersCount ?? h.orderCount ?? '—'}</div>
              </div>
              <div className="bg-slate-50 rounded p-2 text-center">
                <div className="text-slate-500">Visits</div>
                <div className="font-semibold">{h.visitsCount ?? h.visitCount ?? '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:flex md:flex-col md:items-end md:justify-between md:gap-4 md:ml-4">
        <div className="flex items-center gap-2 justify-end">
          <a href={`/mr/hospitals/${h._id}`} className="px-3 py-1 rounded-md border text-sm">Open</a>
          <button onClick={() => openDetails(h)} className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm">Details</button>
        </div>

        <div className="mt-2 md:mt-0 text-right text-xs text-slate-500">ID: <span className="text-slate-700">{String(h._id).slice(-6)}</span></div>
      </div>
    </div>
  ))}
</div>
        )}

        {hospitals.length === 0 && <div className="mt-6 p-6 text-center text-slate-500 bg-white rounded-2xl">No assigned hospitals found.</div>}
      </div>

      <Modal open={!!selected} onClose={closeDetails}>
        {selected && (
          <div className="p-0 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 flex-shrink-0">
                  <div className="font-bold text-2xl">{(selected.name||'--').slice(0,2).toUpperCase()}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-extrabold truncate">{selected.name}</h2>
                  <div className="text-sm opacity-90 mt-1 truncate">{selected.address ?? '—'}</div>

                  <div className="mt-3 flex items-center gap-3 text-sm text-white/90">
                    <div className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {selected.city ?? '—'}</div>
                    <div className="inline-flex items-center gap-2"><Phone className="w-4 h-4" /> {selected.phone ?? '—'}</div>
                    <div className="inline-flex items-center gap-2"><Mail className="w-4 h-4" /> {selected.email ?? '—'}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={`/mr/hospitals/${selected._id}/orders`}
                      className="px-4 py-2 rounded-lg bg-white text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition"
                    >
                      Orders
                    </a>
                    <a
                      href={`/mr/hospitals/${selected._id}/visits/new`}
                      className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white text-sm hover:bg-white/20 transition"
                    >
                      Add Visit
                    </a>
                    <a
                      href={`/admin/hospitals/${selected._id}`}
                      className="px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white text-sm hover:bg-white/20 transition"
                    >
                      Open Admin
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600">Contact Person</div>
                    <div className="mt-1 font-medium text-slate-900">{selected.contactPerson ?? '—'}</div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                      <div><strong>Phone</strong><div className="mt-1">{selected.phone ?? '—'}</div></div>
                      <div><strong>Email</strong><div className="mt-1">{selected.email ?? '—'}</div></div>
                      <div><strong>Address</strong><div className="mt-1 text-slate-600">{selected.address ?? '—'}</div></div>
                      <div><strong>City / State</strong><div className="mt-1">{(selected.city ?? '—') + (selected.state ? ', ' + selected.state : '')}</div></div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold">Notes</div>
                      <div className="mt-2 text-slate-600">{selected.notes ?? 'No notes available.'}</div>
                    </div>
                  </div>
                </div>

                <aside className="md:col-span-1">
                  <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
                    <div className="text-sm text-slate-500">Quick Stats</div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-emerald-50 rounded p-3 text-center">
                        <div className="text-xs text-slate-500">Assigned Since</div>
                        <div className="font-semibold mt-1">{selected.assignedSince ? new Date(selected.assignedSince).toLocaleDateString() : '—'}</div>
                      </div>
                      <div className="bg-slate-50 rounded p-3 text-center">
                        <div className="text-xs text-slate-500">Orders</div>
                        <div className="font-semibold mt-1">{selected.ordersCount ?? selected.orderCount ?? '—'}</div>
                      </div>
                      <div className="bg-slate-50 rounded p-3 text-center">
                        <div className="text-xs text-slate-500">Visits</div>
                        <div className="font-semibold mt-1">{selected.visitsCount ?? selected.visitCount ?? '—'}</div>
                      </div>
                      <div className="bg-slate-50 rounded p-3 text-center">
                        <div className="text-xs text-slate-500">Supplier</div>
                        <div className="font-semibold mt-1">{selected.supplierDisplay ?? selected.assignedSupplier ?? '—'}</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <a href={`/admin/hospitals/${selected._id}`} className="block w-full text-center px-4 py-2 rounded-lg border">Open in Admin</a>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-500">ID: <span className="text-slate-700">{selected._id}</span></div>
                </aside>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
