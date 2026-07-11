import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind class lists intelligently, resolving conflicts (e.g. "p-2 p-4" -> "p-4").
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
