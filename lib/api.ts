// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // important to send HttpOnly cookies
});

// Request interceptor: optionally attach header when using token-based flows.
// NOTE: if backend uses HttpOnly cookie, you DO NOT need to set Authorization here.
api.interceptors.request.use(
  (config) => {
    // Leave config as-is if cookie auth is used
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap error payload consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response) {
      // forward structured payload if present
      return Promise.reject(error.response);
    }
    return Promise.reject(error);
  }
);

export default api;