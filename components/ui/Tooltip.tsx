// components/ui/Tooltip.tsx
"use client";
import React, { ReactNode, useState } from "react";

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className || ""}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-gray-900 text-white text-sm p-2 rounded-lg shadow-lg z-50 whitespace-normal text-center">
          {content}
        </div>
      )}
    </div>
  );
};
