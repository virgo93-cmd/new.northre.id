import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan className Tailwind dengan aman tanpa konflik class duplikat
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka ke mata uang Rupiah standar
 * Contoh: 150000 -> "Rp 150.000"
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (numericAmount === null || numericAmount === undefined || isNaN(numericAmount)) {
    return "Rp 0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

/**
 * Format string tanggal ke format standar Indonesia
 * Contoh: "2026-08-27T16:00:00Z" -> "27 Agustus 2026"
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}