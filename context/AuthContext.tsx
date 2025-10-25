"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { AxiosError, isAxiosError } from "axios";

interface User {
  id: string;
  email: string;
  role?: "hospital" | "supplier" | "admin" | "mr";
  name?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper: redirect based on role
  // Helper: redirect based on role
  const redirectByRole = (role: User["role"]) => {
    if (role === "hospital") router.push("/dashboard");
    else if (role === "supplier") router.push("/supplier/dashboard");
    else if (role === "admin") router.push("/admin/dashboard");
    else if (role === "mr") router.push("/mr"); // <- add MR
    else router.push("/");
  };

  // Fetch current user
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ user: User }>("auth/me");
      setUser(res.data.user);
      console.log("first", res.data.user)
      if (pathname === "/") redirectByRole(res.data.user.role);
    } catch (err) {
      const error = err as AxiosError;
      console.error("Fetch user error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

 // Replace inside AuthProvider: fetchUser & login functions
useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me");
      // res.data might be { data: user } or { user } or user directly
      const raw = res.data;
      console.debug("[Auth] /auth/me raw response:", raw);

      // extract user from common shapes
      const serverUser = (raw && (raw.data || raw.user)) ? (raw.data || raw.user) : raw;

      // Defensive: if serverUser has nested 'user' again, unwrap
      const u = (serverUser && (serverUser.user)) ? serverUser.user : serverUser;

      // Normalize role
      if (u && u.role && typeof u.role === "string") {
        const roleStr = (u.role as string).toLowerCase().trim();
        const allowedRoles = ["hospital", "supplier", "admin", "mr"] as const;
        (u as User).role = allowedRoles.includes(roleStr as User["role"]) ? (roleStr as User["role"]) : undefined;
      }

      setUser(u ?? null);
      console.debug("[Auth] fetchUser resolved user:", u);
      // If user on root path, redirect by role
      if (u && pathname === "/") {
        if (u.role === "mr") router.push("/mr");
        else if (u.role === "hospital") router.push("/dashboard");
        else if (u.role === "supplier") router.push("/supplier/dashboard");
        else if (u.role === "admin") router.push("/admin/dashboard");
      }
    } catch (err) {
      const status = (isAxiosError(err) ? err.response?.status : undefined) ?? "no-status";
      console.warn("[Auth] fetchUser failed", status, err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  })();
}, []); // only on mount

// Login helper
const login = async (): Promise<User | null> => {
  setLoading(true);
  try {
    // The /auth/login POST should have already been called by caller (login page).
    // Here we just call /auth/me to get the user object. Keep logs for debugging.
    const res = await api.get("/auth/me");
    const raw = res.data;
    console.debug("[Auth] login() /auth/me raw response:", raw);
    const serverUser = (raw && (raw.data || raw.user)) ? (raw.data || raw.user) : raw;
    // ensure u is typed as User | null so we don't rely on `any`
    const u = (serverUser && (serverUser.user)) ? (serverUser.user as User) : (serverUser as User | null);

    if (!u) {
      throw new Error("No user returned from /auth/me");
    }

    // Normalize role string safely; keep role undefined when missing so later checks can use (u.role ?? "")
    if (u.role && typeof u.role === "string") {
      u.role = u.role.toLowerCase().trim() as User["role"];
    } else {
      // if role missing leave as undefined so consumers can fallback with (u.role ?? "")
      u.role = undefined;
    }

    setUser(u);
    console.debug("[Auth] login() resolved user:", u);

    // Redirect by normalized role
    const roleNorm = (u.role ?? "").toString();
    if (roleNorm === "mr") router.push("/mr");
    else if (roleNorm === "hospital") router.push("/dashboard");
    else if (roleNorm === "supplier") router.push("/supplier/dashboard");
    else if (roleNorm === "admin") router.push("/admin/dashboard");
    else {
      // Defensive fallback: if cookie exists but role missing, try MR fallback
      try {
        const cookiePresent = typeof document !== "undefined" && document.cookie && document.cookie.includes("token=");
        console.debug("[Auth] cookiePresent:", cookiePresent);
        if (cookiePresent) {
          // If cookie present and role unknown, attempt to push to MR as heuristic (won't break)
          console.warn("[Auth] role missing but token exists — navigating to /mr as fallback");
          router.push("/mr");
        }
      } catch (e) {
        // ignore
      }
    }

    return u;
  } catch (err) {
    console.error("[Auth] login() error:", err);
    setUser(null);
    throw err;
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    setLoading(true);
    try {
      // backend route should clear cookie (res.clearCookie)
      await api.post("auth/logout");
    } catch (err) {
      // swallow: still clear client state
    } finally {
      setUser(null);
      setLoading(false);
      router.push("/auth/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
