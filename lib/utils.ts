// lib/utils.ts
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names safely for Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

/**
 * Debounce helper — delays a function call until after wait ms have elapsed.
 */
export function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format a date as "DD MMM YYYY, hh:mm A"
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate a random pastel gradient background class (for avatars, etc.)
 */
export function randomGradient(): string {
  const gradients = [
    "from-cyan-400 to-emerald-400",
    "from-teal-400 to-lime-400",
    "from-blue-400 to-indigo-400",
    "from-sky-400 to-green-400",
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

export function hashToGradient(userId: string) {
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = (h << 5) - h + userId.charCodeAt(i);
    h |= 0;
  }
  const palette = [
     "from-cyan-400 to-emerald-400",
    "from-teal-400 to-lime-400",
    "from-blue-400 to-indigo-400",
    "from-sky-400 to-green-400",
  ];
  return palette[Math.abs(h) % palette.length];
}