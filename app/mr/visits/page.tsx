"use client";

import React, { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Calendar, Plus, Search, X, Edit3, FileText, Save, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Link from "next/link";

// --- Fetcher
const fetcher = (url: string) => api.get(url).then((r) => r.data);

// --- Tiny stat card
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 font-semibold text-lg text-slate-900">{value}</div>
    </div>
  );
}

// --- Visit form initial
const blankForm = {
  hospitalId: "",
  subject: "",
  notes: "",
  createdAt: "",
};

export default function MRVisitsPage() {
  const { user } = useAuth();
  const mrId = user?.id;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  // fetch assigned hospitals for select (lightweight endpoint)
  const { data: hospitalsData } = useSWR(mrId ? `/mr/hospitals` : null, fetcher, { revalidateOnFocus: false });
  const hospitals: any[] = useMemo(() => hospitalsData?.hospitals ?? hospitalsData ?? [], [hospitalsData]);

  // visits list and summary
  const { data: visitsResp, mutate: mutateVisits } = useSWR(mrId ? `/mr/visit-notes/summary` : null, fetcher, { revalidateOnFocus: false });
  // visitsResp expected { total, visits }
  const visits: any[] = useMemo(() => visitsResp?.visits ?? [], [visitsResp]);
  const totalVisits = visitsResp?.total ?? 0;

  // local UI state
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<any | null>(null); // view visit modal

  // derived filtered list
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return visits;
    return visits.filter((v: any) => {
      if ((v.subject ?? "").toLowerCase().includes(qq)) return true;
      if ((v.notes ?? "").toLowerCase().includes(qq)) return true;
      if ((v.hospital?.name ?? "").toLowerCase().includes(qq)) return true;
      return false;
    });
  }, [visits, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSlice = filtered.slice((page - 1) * perPage, page * perPage);

  // handle create
  const handleSave = useCallback(async () => {
    if (!mrId) return;
    if (!form.hospitalId) return alert("Please select hospital");
    if (!form.subject && !form.notes) return alert("Please add subject or notes");

    try {
      setSaving(true);
      const payload: any = {
        hospitalId: form.hospitalId,
        subject: form.subject,
        notes: form.notes,
        createdAt: form.createdAt || new Date().toISOString(),
      };
      await api.post(`/mr/visit-notes`, payload);
      setForm(blankForm);
      mutateVisits();
      setSaving(false);
      alert("Visit saved");
    } catch (err: any) {
      setSaving(false);
      alert(err?.response?.data?.message ?? err?.message ?? "Save failed");
    }
  }, [form, mrId, mutateVisits]);

  // quick template
  const applyTemplate = (t: string) => setForm((s) => ({ ...s, notes: (s.notes ? s.notes + "\n\n" : "") + t }));

  if (!user) return <div className="p-6">Please log in to see visits</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Visit Notes</h1>
          <p className="text-slate-500 mt-1">Record and review hospital visits — fast entry, rich details, and clear history.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-full px-3 py-2 border shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search subject, notes or hospital" className="bg-transparent outline-none text-sm w-72" />
          </div>

          <button onClick={() => { setForm({ ...blankForm, createdAt: new Date().toISOString(), hospitalId: hospitals?.[0]?._id ?? "" }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-95">
            <Plus className="w-4 h-4" /> New Visit
          </button>
        </div>
      </div>

      {/* stats & form area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Stat label="This MR — Visits" value={totalVisits} />
              <Stat label="Recent (showing)" value={filtered.length} />
              <Stat label="Hospitals assigned" value={hospitals?.length ?? '—'} />
            </div>
          </div>

          {/* New visit form */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Record a Visit</h3>
                <p className="text-sm text-slate-500 mt-1">Quickly capture what you observed and save to history.</p>
              </div>

              <div className="text-sm text-slate-500">{form.createdAt ? new Date(form.createdAt).toLocaleString() : ''}</div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select value={form.hospitalId} onChange={(e) => setForm((s) => ({ ...s, hospitalId: e.target.value }))} className="md:col-span-2 p-3 border rounded">
                <option value="">Select hospital...</option>
                {hospitals?.map((h: any) => (
                  <option key={h._id} value={h._id}>{h.name} {h.city ? `— ${h.city}` : ''}</option>
                ))}
              </select>

              <input value={form.subject} onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))} placeholder="Subject (short)" className="p-3 border rounded" />

              <textarea value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} rows={6} className="md:col-span-3 mt-2 p-3 border rounded" placeholder="Notes — observations, prescriptions, follow-ups..."></textarea>

              <div className="md:col-span-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => applyTemplate('Doctor interested in sample trial; follow up next week.')} className="px-3 py-2 rounded bg-slate-50 text-sm">Template: Trial</button>
                  <button type="button" onClick={() => applyTemplate('Discussed pricing and discount slabs; awaiting approval.')} className="px-3 py-2 rounded bg-slate-50 text-sm">Template: Pricing</button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setForm(blankForm)} className="px-4 py-2 rounded border">Reset</button>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white inline-flex items-center gap-2">{saving ? 'Saving...' : <><Save className="w-4 h-4"/> Save</>}</button>
                </div>
              </div>
            </div>
          </div>

          {/* recent visits list */}
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Visits</h3>
              <div className="text-sm text-slate-500">Showing {filtered.length} — page {page} / {pages}</div>
            </div>

            <div className="space-y-3">
              {pageSlice.map((v: any) => (
                <div key={v._id} className="border rounded-lg p-3 flex items-start gap-3 hover:shadow-sm transition">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-700 font-semibold">{(v.hospital?.name ?? 'H').slice(0,2).toUpperCase()}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{v.subject ?? 'Visit'}</div>
                        <div className="text-xs text-slate-500 truncate">{v.hospital?.name ?? 'Unknown hospital'} • {new Date(v.createdAt).toLocaleString()}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => setPreview(v)} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">View</button>
                        <a href={`/mr/visits/${v._id}/edit`} className="px-3 py-1 rounded border text-sm">Edit</a>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-slate-700 line-clamp-3">{v.notes}</div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && <div className="p-6 text-center text-slate-500">No visits recorded yet.</div>}
            </div>

            {/* pagination small */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} className="px-3 py-1 rounded border"><ChevronLeft/></button>
                <div className="text-sm">Page {page} of {pages}</div>
                <button onClick={() => setPage(Math.min(pages, page + 1))} className="px-3 py-1 rounded border"><ChevronRight/></button>
              </div>

              <div className="text-sm text-slate-500">Total visits: {totalVisits}</div>
            </div>
          </div>
        </div>

        {/* right col */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold">Quick Actions</h4>
            <div className="mt-3 grid grid-cols-1 gap-3">
              <Link href="/mr/hospitals" className="block px-3 py-2 rounded bg-emerald-50 text-emerald-700">Assigned hospitals</Link>
              <a href="/mr/orders" className="block px-3 py-2 rounded bg-slate-50">My orders</a>
              <a href="/mr/profile" className="block px-3 py-2 rounded border">Profile</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow">
            <h4 className="font-semibold">Tips</h4>
            <ul className="mt-2 text-sm text-slate-600 space-y-2">
              <li>Keep subjects short and searchable.</li>
              <li>Use templates for common notes to save time.</li>
              <li>Attach follow up tasks in your CRM if needed.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)}>
        {preview && (
          <div className="p-4 max-w-2xl">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center font-semibold text-emerald-700">{(preview.hospital?.name ?? 'H').slice(0,2).toUpperCase()}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{preview.subject ?? 'Visit'}</h3>
                    <div className="text-xs text-slate-500">{preview.hospital?.name ?? 'Unknown'} • {new Date(preview.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-slate-500">By: {preview.mr?.name ?? user?.email}</div>
                </div>

                <div className="mt-3 text-sm text-slate-700 whitespace-pre-line">{preview.notes}</div>

                <div className="mt-4 flex items-center gap-2">
                  <a href={`/mr/visits/${preview._id}/edit`} className="px-3 py-2 rounded border">Edit</a>
                  <button onClick={() => { navigator.clipboard.writeText(preview.notes ?? ''); alert('Copied notes'); }} className="px-3 py-2 rounded bg-emerald-600 text-white">Copy notes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
