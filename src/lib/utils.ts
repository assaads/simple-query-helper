import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names and merges Tailwind CSS classes correctly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Format a date string consistently
 */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format money values consistently
 */
export function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Truncate text to a certain length with ellipsis
 */
export function truncate(str: string, length: number) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * Generate a random string
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if running in browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Type-safe debounce function
 */
export function debounce<TFunction extends (...args: unknown[]) => unknown>(
  func: TFunction,
  wait: number
): (...args: Parameters<TFunction>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<TFunction>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
