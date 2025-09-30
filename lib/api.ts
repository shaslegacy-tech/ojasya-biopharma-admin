// lib/api.ts

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ important to send cookies
});

// Request interceptor: automatically attach auth token if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken"); // adjust if you store token differently
      if (token) {
        config.headers!["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // handle 401, 403 or other global errors
      if (error.response.status === 401) {
        console.error("Unauthorized! Logging out...");
        // optional: trigger logout from AuthContext here
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
