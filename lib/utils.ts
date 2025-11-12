import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, length?: number): string {
  const l = length || 3;
  return address.slice(0, l) + "..." + address.slice(-l);
}