// components/ui/Modal.tsx
"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export default function PremiumModal({ open, onClose, children, title, size = "md" }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      // trap scroll
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClass =
    size === "sm" ? "max-w-xl" : size === "md" ? "max-w-2xl" : size === "lg" ? "max-w-4xl" : "max-w-6xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cyan/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${widthClass} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border dark:border-slate-800 overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-slate-800">
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-600 dark:text-slate-200" />
          </button>
        </div>

        <div className="p-5 text-slate-700 dark:text-slate-200">{children}</div>
      </div>
    </div>
  );
}