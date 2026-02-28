import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format minor units (integer) → human-readable currency string */
export function formatMoney(amountMinor: number, currency: string): string {
  const major = amountMinor / 100;
  const locale =
    currency === "INR"
      ? "en-IN"
      : currency === "EUR"
        ? "de-DE"
        : currency === "GBP"
          ? "en-GB"
          : currency === "JPY"
            ? "ja-JP"
            : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(major);
}

/** Abbreviate large numbers: 1500000 → "15.0K" (in major units) */
export function formatCompact(amountMinor: number): string {
  const major = amountMinor / 100;
  if (Math.abs(major) >= 1_000_000) return `${(major / 1_000_000).toFixed(1)}M`;
  if (Math.abs(major) >= 1_000) return `${(major / 1_000).toFixed(1)}K`;
  return major.toFixed(0);
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
