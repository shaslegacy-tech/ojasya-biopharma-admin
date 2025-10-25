// src/components/mr/VisitNoteForm.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Cloud, CloudOff, Check, Clock, Save, Bold, List, CheckSquare, Eye } from "lucide-react";
import api from "@/lib/api";
import { saveLocalNote, syncLocalNotes } from "@/lib/offlineNotes";
import { debounce } from "@/lib/utils";
import toast from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  hospitalId: string;
  onSaved?: () => void;
};

type LocalNote = {
  hospitalId: string;
  subject?: string;
  notes: string;
  createdAt: string;
  localId: string;
};

export default function VisitNoteForm({ hospitalId, onSaved }: Props) {
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [showPreview, setShowPreview] = useState(false);

  const charLimit = 2000;
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  // Debounced local autosave: saves to local storage queue while typing
  const debouncedLocalSave = useRef(
    debounce(((payload: LocalNote) => {
      try {
        saveLocalNote(payload);
        setStatus("saved");
        trackEvent("visitnote.autosave", { hospitalId: payload.hospitalId });
        toast.success("Autosaved locally");
      } catch (e) {
        console.error("Autosave failed", e);
        setStatus("error");
        toast.error("Autosave failed");
      }
    }) as unknown as (...args: unknown[]) => void, 1200)
  ).current;

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // When typing, autosave locally
  useEffect(() => {
    if (!subject && !notes) return;
    setStatus("saving");
    const payload: LocalNote = { hospitalId, subject, notes, createdAt: new Date().toISOString(), localId: String(Date.now()) };
    debouncedLocalSave(payload);
  }, [subject, notes, debouncedLocalSave, hospitalId]);

  const clearForm = () => {
    setSubject("");
    setNotes("");
  };

  // Insert formatting helper
  const insertAtSelection = (before: string, after: string = "") => {
    const el = notesRef.current;
    if (!el) return;
    const start = el.selectionStart ?? notes.length;
    const end = el.selectionEnd ?? notes.length;
    const selected = notes.slice(start, end);
    const newText = notes.slice(0, start) + before + selected + after + notes.slice(end);
    setNotes(newText);
    // place cursor after inserted text
    requestAnimationFrame(() => {
      const pos = start + before.length + selected.length + after.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const handleSave = async () => {
    if (!subject && !notes) { toast("Please enter subject or notes before saving"); return; }

    const payload: LocalNote = { hospitalId, subject, notes, createdAt: new Date().toISOString(), localId: String(Date.now()) };

    // If offline, save locally immediately
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        saveLocalNote(payload);
        setStatus("saved");
        clearForm();
        onSaved?.();
        toast("You are offline — note saved locally and will sync when online.");
        trackEvent("visitnote.save_offline", { hospitalId });
      } catch (e) {
        console.error("Local save failed", e);
        setStatus("error");
        toast.error("Failed to save locally.");
      }
      return;
    }

    setLoading(true);
    setStatus("saving");

    try {
      await api.post("/mr/visit-notes", payload);
      // attempt to sync queued notes as well
      try { await syncLocalNotes(); trackEvent("visitnote.sync_queue_success", { hospitalId }); } catch (e) { console.warn("syncLocalNotes failed:", e); trackEvent("visitnote.sync_queue_failed", { hospitalId, error: String(e) }); }

      setStatus("saved");
      clearForm();
      onSaved?.();
      toast.success("Visit note saved successfully");
      trackEvent("visitnote.save_success", { hospitalId });
    } catch (err: unknown) {
      console.error("Save failed", err);
      // fallback to local save and inform the user
      try { saveLocalNote(payload); toast("Unable to reach server — note saved locally and will sync later."); trackEvent("visitnote.save_failed_fallback_local", { hospitalId }); } catch (e) { console.error("Local fallback failed", e); toast.error("Unable to save note."); }
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2H15" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="7" width="18" height="14" rx="2" stroke="#065f46" strokeWidth="1.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div className="text-sm text-slate-600">Visit Note</div>
            <div className="text-lg font-semibold text-slate-900">Add observations & next actions</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {online ? (
              <span className="inline-flex items-center gap-1 text-emerald-600"><Cloud className="w-4 h-4" /> Online</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-600"><CloudOff className="w-4 h-4" /> Offline</span>
            )}

            <span className="inline-flex items-center gap-1 text-slate-500">{status === 'saving' ? <Clock className="w-4 h-4" /> : (status === 'saved' ? <Check className="w-4 h-4 text-emerald-600" /> : null)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowPreview(v => !v)} title="Toggle preview" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"><Eye className="w-4 h-4" /> Preview</button>
            <button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:scale-[1.02] transition disabled:opacity-60">
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (e.g., Ward rounds, Pharmacy check)"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900"
        />

        <div>
          {/* formatting toolbar */}
          <div className="flex items-center gap-2 mb-2">
            <button type="button" onClick={() => insertAtSelection("**", "**")} title="Bold" className="p-2 rounded-md hover:bg-slate-100"><Bold className="w-4 h-4" /></button>
            <button type="button" onClick={() => insertAtSelection("- ")} title="Bullet" className="p-2 rounded-md hover:bg-slate-100"><List className="w-4 h-4" /></button>
            <button type="button" onClick={() => insertAtSelection("- [ ] ")} title="Checklist" className="p-2 rounded-md hover:bg-slate-100"><CheckSquare className="w-4 h-4" /></button>
            <div className="ml-auto text-xs text-slate-500">{Math.min(notes.length, charLimit)}/{charLimit} chars</div>
          </div>

          <textarea
            ref={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your visit notes here. Be concise and list next actions clearly."
            className="w-full min-h-[220px] px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 resize-vertical"
            maxLength={charLimit}
          />

          {showPreview && (
            <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="prose prose-sm max-w-none text-slate-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {notes || "_Nothing to preview_"}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <div>{notes.split('\n').filter(Boolean).length} paragraphs • {Math.min(notes.length, charLimit)}/{charLimit} chars</div>
            <div>
              <button onClick={() => { setNotes((s) => (s + "\n\n- Next action:\n- Responsible:\n- ETA:")); notesRef.current?.focus(); }} className="text-slate-600 hover:text-slate-800 text-xs">Insert template</button>
            </div>
          </div>
        </div>

        {/* small helper row */}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div>Autosaves locally while you type. When online, press Save to push to server.</div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setSubject(""); setNotes(""); }} className="text-slate-600 hover:text-slate-900">Clear</button>
            <button onClick={async () => { setStatus('saving'); try { await syncLocalNotes(); setStatus('saved'); toast.success('Sync complete'); trackEvent('visitnote.sync_manual_success', { hospitalId }); } catch (e) { setStatus('error'); toast.error('Sync failed'); trackEvent('visitnote.sync_manual_failed', { hospitalId, error: String(e) }); } }} className="text-slate-600 hover:text-slate-900">Sync Queue</button>
          </div>
        </div>
      </div>
    </div>
  );
}