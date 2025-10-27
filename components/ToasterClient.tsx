"use client";
import React from "react";
import { Toaster } from "react-hot-toast";

export default function ToasterClient() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        // Default options
        duration: 3500,
        style: {
          borderRadius: "12px",
          padding: "10px 14px",
          background: "#0f172a", // slate-900 look
          color: "#fff",
          boxShadow: "0 6px 24px rgba(15,23,42,0.24)",
        },
        success: {
          icon: "✅",
        },
        error: {
          icon: "❌",
          duration: 4500,
        },
      }}
    />
  );
}