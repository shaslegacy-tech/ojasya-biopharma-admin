"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { AxiosError } from "axios";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Call login endpoint via Axios global instance
      await api.post("auth/login", { email, password });

      // Let AuthContext handle fetching /me and redirecting
      await login();
    } catch (err) {
      // Type-safe error handling
      const error = err as AxiosError<{ message: string }>;
      console.error("Login error:", error);

      alert(error.response?.data?.message || "Login failed, please try again.");
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
