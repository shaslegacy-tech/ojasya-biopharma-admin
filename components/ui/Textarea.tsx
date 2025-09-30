import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder?: string;
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, placeholder, error, disabled, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <span className="absolute left-3 top-2.5 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <textarea
          ref={ref}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-teal-500 resize-none",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-teal-500",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-2.5 pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
