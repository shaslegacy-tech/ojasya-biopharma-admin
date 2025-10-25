// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation"; // <-- use this hook

export default function Login() {
  const { login } = useAuth();
  const router = useRouter(); // <-- hook usage
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // inside app/auth/login/page.tsx
const handleLogin = async () => {
  setLoading(true);
  try {
    const resp = await api.post("auth/login", { email, password });
    console.debug("[Login] POST /auth/login response:", resp.status, resp.headers, resp.data);

    try {
      const loggedUser = await login();
      console.debug("[Login] login() returned:", loggedUser);

      const roleNorm = (loggedUser?.role ?? "").toString().toLowerCase().trim();
      if (roleNorm === "mr") {
        router.push("/mr");
        return;
      }
      if (roleNorm === "hospital") { router.push("/dashboard"); return; }
      if (roleNorm === "supplier") { router.push("/supplier/dashboard"); return; }
      if (roleNorm === "admin") { router.push("/admin/dashboard"); return; }

      // If no role, try direct /auth/me fetch to inspect server shape
      try {
        const meResp = await api.get("/auth/me");
        console.debug("[Login] extra /auth/me fetch:", meResp.status, meResp.data);
        const raw = meResp.data;
        const srv = (raw && (raw.data || raw.user)) ? (raw.data || raw.user) : raw;
        console.debug("[Login] extracted me:", srv);
        // If server says role=mr in any casing, navigate
        const maybeRole = (srv?.role ?? srv?.data?.role ?? srv?.user?.role) ?? "";
        if (typeof maybeRole === "string" && maybeRole.toLowerCase().includes("mr")) {
          router.push("/mr");
          return;
        }
      } catch (e) {
        console.warn("[Login] extra /auth/me fetch failed", e);
      }

      // default fallback
      router.push("/");
    } catch (e) {
      console.warn("[Login] login() failed after POST:", e);
      // attempt one more /auth/me read for debugging
      try {
        const extra = await api.get("/auth/me");
        console.debug("[Login] /auth/me after failed login():", extra.status, extra.data);
      } catch (ee) {
        console.warn("[Login] second /auth/me failed:", ee);
      }
      alert("Login succeeded but fetching user failed — check console logs.");
    }
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("[Login] POST error:", error?.response?.data ?? error);
    alert(error?.response?.data?.message || "Login failed, please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-teal-600 to-cyan-600">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Ojasya Biopharma Login
        </h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-2.5 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}