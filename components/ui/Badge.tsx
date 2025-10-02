// components/ui/Badge.tsx
"use client";
import React from "react";

interface BadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  processing: "bg-blue-100 text-blue-800",
};

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const colorClass = STATUS_COLORS[status.toLowerCase()] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`px-3 py-1 rounded-full font-semibold text-sm ${colorClass} hover:scale-105 transition-transform`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default Badge;
