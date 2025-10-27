"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Camera, Check, X, Lock } from "lucide-react";

/**
 * MR Profile / Settings Page
 *
 * - Uses AuthContext for current user id & basic info
 * - Calls API endpoints:
 *    GET  /users/:id
 *    PUT  /users/:id            (profile update)
 *    POST /users/:id/avatar     (avatar upload)  <-- optional on backend
 *    POST /users/:id/change-password (password change) <-- optional
 *
 * If avatar endpoint isn't available backend will still attempt to send avatar as part of PUT.
 */

type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  dlNumber?: string;
  gstNumber?: string;
  image?: string; // url
};

export default function MRProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [avatarUploading, setAvatarUploading] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  // local editable form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    dlNumber: "",
    gstNumber: "",
    email: "",
  });

  // avatar file preview (data URL)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // password change
  const [pwdState, setPwdState] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    // redirect to login if not present
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function fetchProfile(userId: string) {
    setLoading(true);
    try {
      const res = await api.get<{ data?: UserProfile; user?: UserProfile }>(`/users/${userId}`);
      // backend shape may vary: { data: {...} } or { user: {...} } or raw
      const payload = (res.data && (res.data.data ?? res.data.user ?? res.data)) as unknown;
      const p = (Array.isArray(payload) ? payload[0] : payload) as UserProfile;
      const normalized: UserProfile = {
        id: userId,
        name: p?.name ?? user?.name ?? "",
        email: p?.email ?? user?.email ?? "",
        phone: p?.phone ?? "",
        address: p?.address ?? "",
        city: p?.city ?? "",
        dlNumber: p?.dlNumber ?? "",
        gstNumber: p?.gstNumber ?? "",
        image: p?.image ?? (p as any)?.avatar ?? null,
      };

      setProfile(normalized);
      setForm({
        name: normalized.name ?? "",
        phone: normalized.phone ?? "",
        address: normalized.address ?? "",
        city: normalized.city ?? "",
        dlNumber: normalized.dlNumber ?? "",
        gstNumber: normalized.gstNumber ?? "",
        email: normalized.email ?? "",
      });
      setAvatarPreview(normalized.image ?? null);
    } catch (err: unknown) {
      console.error("Fetch profile error:", err);
      toast.error("Failed to fetch profile. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  // handle file selection & preview
  function onSelectAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result ?? ""));
    };
    reader.readAsDataURL(f);
  }

  // upload avatar (attempt dedicated endpoint first, fallback to sending in profile PUT)
  async function uploadAvatar(userId: string, file: File) {
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      // try dedicated endpoint
      try {
        const resp = await api.post(`/users/${userId}/avatar`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // backend may return new image URL at resp.data.url or resp.data.image
        const newUrl = (resp.data && (resp.data.url ?? resp.data.image ?? resp.data.path)) as string | undefined;
        if (newUrl) {
          setAvatarPreview(newUrl);
          setProfile((p) => (p ? { ...p, image: newUrl } : p));
          toast.success("Avatar uploaded");
          return newUrl;
        }
      } catch (dedicatedErr) {
        // ignore and try fallback below
        console.warn("Dedicated avatar upload failed, will try fallback:", dedicatedErr);
      }

      // fallback: upload as base64 in profile PUT (some backends accept avatarBase64)
      const reader = await new Promise<string | null>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result ?? null));
        r.onerror = (err) => reject(err);
        r.readAsDataURL(file);
      });

      if (!reader) throw new Error("Failed to read file");

      // attempt PUT to update profile with avatarBase64 if supported
      const putResp = await api.put(`/users/${userId}`, { avatarBase64: reader });
      const newUrl = (putResp.data && (putResp.data.url ?? putResp.data.image)) as string | undefined;
      if (newUrl) {
        setAvatarPreview(newUrl);
        setProfile((p) => (p ? { ...p, image: newUrl } : p));
      }

      toast.success("Avatar saved (fallback)");
      return newUrl;
    } catch (err) {
      console.error("Avatar upload err:", err);
      toast.error("Avatar upload failed");
      return null;
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSaveProfile() {
    if (!user?.id) return toast.error("No user");
    setSaving(true);
    try {
      // if there's a new avatar file, upload first so backend returns image url
      let avatarUrl: string | null = null;
      if (avatarFile) {
        avatarUrl = (await uploadAvatar(user.id, avatarFile)) ?? null;
      }

      // build payload
      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        dlNumber: form.dlNumber,
        gstNumber: form.gstNumber,
        ...(avatarUrl ? { image: avatarUrl } : {}),
      };

      const resp = await api.put(`/users/${user.id}`, payload);
      // optimistic sync
      const updated = (resp.data && (resp.data.data ?? resp.data.user ?? resp.data)) as unknown;
      toast.success("Profile updated");
      // update local profile
      setProfile((p) => ({ ...(p ?? {}), ...payload }));
      // optionally refresh auth state if backend changed name/email
    } catch (err) {
      console.error("Save profile err:", err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!user?.id) return toast.error("No user");
    if (!pwdState.current || !pwdState.newPwd) return toast.error("Fill both fields");
    if (pwdState.newPwd !== pwdState.confirm) return toast.error("New password and confirm do not match");
    setPwdSaving(true);
    try {
      await api.post(`/users/${user.id}/change-password`, {
        currentPassword: pwdState.current,
        newPassword: pwdState.newPwd,
      });
      toast.success("Password updated");
      setPwdState({ current: "", newPwd: "", confirm: "" });
    } catch (err) {
      console.error("Change password err:", err);
      toast.error("Password change failed");
    } finally {
      setPwdSaving(false);
    }
  }

  if (loading || authLoading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-slate-500">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-2xl p-1 shadow-xl">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="w-full md:w-60 flex-shrink-0">
              <div className="relative group">
                <div className="w-44 h-44 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 overflow-hidden flex items-center justify-center border border-slate-100">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 text-center p-4">
                      <div className="text-3xl font-semibold">{(profile.name || "").split(" ").map(s => s[0]).join("").slice(0,2) || "MR"}</div>
                      <div className="text-xs mt-1">Medical Representative</div>
                    </div>
                  )}
                </div>

                <label
                  htmlFor="avatar"
                  className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full border cursor-pointer inline-flex items-center gap-2 shadow-sm hover:scale-105 transition"
                >
                  <Camera className="w-4 h-4 text-slate-700" />
                  <span className="text-xs text-slate-700">Change</span>
                </label>

                <input id="avatar" type="file" accept="image/*" onChange={onSelectAvatar} className="sr-only" />
              </div>

              <div className="mt-3 text-sm text-slate-500">
                Pro tip: Use a clear headshot — square images work best.
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">{profile.name || "MR"}</h2>
                  <div className="text-sm text-slate-500">{profile.email}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving || avatarUploading}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    <Check className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
                  </button>

                  <button
                    onClick={() => {
                      // revert unsaved changes
                      setForm({
                        name: profile.name ?? "",
                        phone: profile.phone ?? "",
                        address: profile.address ?? "",
                        city: profile.city ?? "",
                        dlNumber: profile.dlNumber ?? "",
                        gstNumber: profile.gstNumber ?? "",
                        email: profile.email ?? "",
                      });
                      setAvatarFile(null);
                      setAvatarPreview(profile.image ?? null);
                      toast("Reverted");
                    }}
                    className="inline-flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow-sm"
                  >
                    <X className="w-4 h-4" /> Revert
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Full name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">Email</label>
                  <input
                    value={form.email}
                    readOnly
                    className="w-full mt-1 p-3 border rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                    placeholder="Email"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="+91 98xxxx"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">City</label>
                  <input
                    value={form.city}
                    onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="City"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500">Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                    rows={3}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="Address"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">Drug License</label>
                  <input
                    value={form.dlNumber}
                    onChange={(e) => setForm((s) => ({ ...s, dlNumber: e.target.value }))}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="DL number"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">GST Number</label>
                  <input
                    value={form.gstNumber}
                    onChange={(e) => setForm((s) => ({ ...s, gstNumber: e.target.value }))}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="GSTIN"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password section */}
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold">Security</h4>
                <p className="text-sm text-slate-500">Change password for your account.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-xs text-slate-500">Current password</label>
                <input
                  type="password"
                  value={pwdState.current}
                  onChange={(e) => setPwdState((s) => ({ ...s, current: e.target.value }))}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                  placeholder="Current password"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">New password</label>
                <input
                  type="password"
                  value={pwdState.newPwd}
                  onChange={(e) => setPwdState((s) => ({ ...s, newPwd: e.target.value }))}
                  className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                  placeholder="New password"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Confirm</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={pwdState.confirm}
                    onChange={(e) => setPwdState((s) => ({ ...s, confirm: e.target.value }))}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                    placeholder="Confirm new password"
                  />
                  <button
                    onClick={handleChangePassword}
                    disabled={pwdSaving}
                    className="inline-flex items-center gap-2 bg-white border px-3 py-2 rounded-lg"
                  >
                    <Lock className="w-4 h-4" /> {pwdSaving ? "Saving…" : "Change"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer small */}
          <div className="mt-6 text-sm text-slate-500 flex items-center justify-between">
            <div>Profile last synced: <span className="font-medium">{profile?.id ? "Synced" : "—"}</span></div>
            <div>Need help? <a className="text-emerald-600 underline cursor-pointer" onClick={() => toast("Contact support at ops@ojasya.test")}>Contact support</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}