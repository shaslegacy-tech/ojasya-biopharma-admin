// src/lib/offlineNotes.ts
import api from "@/lib/api";
const LOCAL_KEY = "ojasya_offline_notes_v1";

export type LocalNote = { localId: string; hospitalId: string; subject?: string; notes: string; createdAt?: string };

export const saveLocalNote = (note: LocalNote) => {
  const arr = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  arr.push(note);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
};

export const getLocalNotes = (): LocalNote[] => {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
};

export const clearLocalNotes = () => localStorage.removeItem(LOCAL_KEY);

export const syncLocalNotes = async () => {
  const notes = getLocalNotes();
  if (!notes.length) return { results: [] };
  const res = await api.post("/mr/visit-notes/sync", { notes });
  // if success, clear and return results
  clearLocalNotes();
  return res.data;
};

// auto-sync when back online
export const registerAutoSync = () => {
  if (typeof window === "undefined") return;
  window.addEventListener("online", async () => {
    try { await syncLocalNotes(); console.log("Offline MR notes synced"); } catch (e) { console.error("sync failed", e); }
  });
};