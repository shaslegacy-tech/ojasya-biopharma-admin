"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api"; // Axios instance with withCredentials: true
import { Button } from "@/components/ui/Button";
import { AxiosError } from "axios";

export default function RegisterPage() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"hospital" | "supplier" | "admin">("hospital");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // ✅ Validation before sending request
    if (!email || !password || !role) {
      alert("Email, password, and role are required");
      return;
    }
    setLoading(true);
    try {
      // ✅ Prepare payload with defaults
      const payload = {
        name: name || email.split("@")[0],
        email,
        password,
        role,
      };

      // ✅ Send register request
      await api.post("auth/register", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // ✅ Call login to fetch /me and set user
      await login();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || "Registration failed");
      console.error("Register error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 via-green-600 to-cyan-700">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <input
          type="text"
          placeholder="Name (optional)"
          className="w-full border p-3 rounded mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-6 focus:ring-2 focus:ring-teal-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Role Selection */}
       <select
          className="w-full border p-3 rounded mb-6 focus:ring-2 focus:ring-teal-500 outline-none"
          value={role}
          onChange={(e) =>
            setRole(e.target.value as "hospital" | "supplier" | "admin")
          }
        >
          <option value="hospital">Hospital</option>
          <option value="supplier">Supplier</option>
          <option value="admin">Admin</option>
        </select>

        <Button disabled={loading} onClick={handleRegister} className="w-full">
          {loading ? "Registering..." : "Register"}
        </Button>
      </div>
    </div>
  );
}
