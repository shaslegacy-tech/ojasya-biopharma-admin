// components/ui/PremiumInput.tsx
"use client";
import React, { InputHTMLAttributes } from "react";

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

const PremiumInput: React.FC<PremiumInputProps> = ({ label, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-black font-medium">{label}</label>}
      <input
        {...props}
        className={`border rounded-xl p-3 focus:ring-2 focus:ring-[#0daba9] text-black ${className || ""}`}
      />
    </div>
  );
};

export default PremiumInput;
