"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { AxiosError } from "axios";

interface User {
  id: string;
  email: string;
  role: "hospital" | "supplier" | "admin";
  name?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Helper: redirect based on role
  const redirectByRole = (role: User["role"]) => {
    if (role === "hospital") router.push("/dashboard");
    else if (role === "supplier") router.push("/supplier/dashboard");
    else if (role === "admin") router.push("/admin/dashboard");
  };

  // Fetch current user
  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ user: User }>("auth/me");
      setUser(res.data.user);

      if (pathname === "/") redirectByRole(res.data.user.role);
    } catch (err) {
      const error = err as AxiosError;
      console.error("Fetch user error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  // Login: just refetch /me and redirect
  const login = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ user: User }>("auth/me");
      setUser(res.data.user);
      redirectByRole(res.data.user.role);
    } catch (err) {
      const error = err as AxiosError;
      console.error("Login fetch error:", error);
      setUser(null);
      throw error; // rethrow if needed
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await api.post("auth/logout"); // optional API call
    } catch (err) {
      const error = err as AxiosError;
      console.error("Logout error:", error);
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
