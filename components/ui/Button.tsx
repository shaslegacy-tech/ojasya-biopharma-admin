// components/ui/button.tsx
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<string, string> = {
      primary:
        "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 focus:ring-teal-500",
      secondary:
        "bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-600",
      outline:
        "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
