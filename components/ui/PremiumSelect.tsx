// components/ui/PremiumSelect.tsx
"use client";
import React, { SelectHTMLAttributes } from "react";

interface PremiumSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

const PremiumSelect: React.FC<PremiumSelectProps> = ({ label, options, className, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="font-medium text-black">{label}</label>
      <select
        {...props}
        className={`border rounded-xl p-3 focus:ring-2 focus:ring-[#0daba9] text-black w-full ${className || ""}`}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PremiumSelect;
