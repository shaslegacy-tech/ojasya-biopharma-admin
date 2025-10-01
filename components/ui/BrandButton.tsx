'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'indigo' | 'gray' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export const BrandButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'indigo', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none';

    const variants: Record<string, string> = {
      indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
      gray: 'bg-gray-300 text-gray-800 hover:bg-gray-400',
      red: 'bg-red-600 text-white hover:bg-red-700',
    };

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
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

BrandButton.displayName = 'Button';
