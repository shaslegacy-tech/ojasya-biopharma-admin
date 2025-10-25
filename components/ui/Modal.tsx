// src/components/ui/Modal.tsx
"use client";
import React from "react";

export default function Modal({ open, onClose, children }: { open: boolean, onClose: ()=>void, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded max-w-2xl w-full p-4 z-10">{children}</div>
    </div>
  );
}