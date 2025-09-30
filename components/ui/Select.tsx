import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiple?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, children, placeholder, error, disabled, leftIcon, rightIcon, multiple, ...props },
    ref
  ) => {
    return (
      <div className={cn("relative w-full")}>
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <select
          ref={ref}
          disabled={disabled}
          multiple={multiple}
          className={cn(
            "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-teal-500",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-teal-500",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          {...props}
        >
          {placeholder && !multiple && (
            <option value="" disabled selected>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
