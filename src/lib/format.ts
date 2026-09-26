import type { Currency, Unit } from "@/lib/types";
import { UNIT_SUFFIX } from "@/lib/types";

/**
 * Semua formatter memakai locale "id-ID" dan timezone Asia/Jakarta secara
 * eksplisit. Ini penting supaya hasil render di server dan di browser identik,
 * sehingga tidak memicu hydration mismatch di Next.js.
 */
const TZ = "Asia/Jakarta";

const CURRENCY_FRACTION: Record<Currency, number> = {
  USD: 2,
  EUR: 2,
  IDR: 0,
  JPY: 0,
  CNY: 2,
};

/** Format uang, mis. formatMoney(6.8, "USD") -> "US$6,80" */
export function formatMoney(
  value: number,
  currency: Currency,
  options?: { maximumFractionDigits?: number },
): string {
  const digits =
    options?.maximumFractionDigits ?? CURRENCY_FRACTION[currency] ?? 2;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Format rupiah tanpa desimal, mis. 15750000 -> "Rp15.750.000" */
export function formatIDR(value: number): string {
  return formatMoney(Math.round(value), "IDR");
}

/** Format angka biasa dengan pemisah ribuan. */
export function formatNumber(
  value: number,
  maximumFractionDigits = 2,
): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits,
  }).format(value);
}

/** Ringkas angka besar: 1.250.000 -> "1,25 jt" */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${formatNumber(value / 1_000_000_000, 2)} M`;
  if (abs >= 1_000_000) return `${formatNumber(value / 1_000_000, 2)} jt`;
  if (abs >= 1_000) return `${formatNumber(value / 1_000, 1)} rb`;
  return formatNumber(value);
}

/** Format persen dengan tanda, mis. 1.23 -> "+1,23%" */
export function formatPercent(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, digits)}%`;
}

/** Gabungkan kuantitas dengan satuannya, mis. "18.000 kg" */
export function formatQuantity(value: number, unit: Unit): string {
  return `${formatNumber(value)} ${UNIT_SUFFIX[unit]}`;
}

/** Tanggal panjang: "24 September 2026" */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(date);
}

/** Tanggal pendek: "24 Sep 2026" */
export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  }).format(date);
}

/** Jam saja: "14:05:33" - dipakai di halaman harga. */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).format(date);
}

/**
 * Jarak waktu relatif dari sekarang, mis. "3 hari lalu".
 * Hasilnya bergantung pada waktu saat dipanggil, jadi HANYA boleh dipakai
 * di client (lihat komponen <TimeAgo />).
 */
export function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2_592_000) return rtf.format(Math.round(diffSec / 86_400), "day");
  if (abs < 31_536_000)
    return rtf.format(Math.round(diffSec / 2_592_000), "month");
  return rtf.format(Math.round(diffSec / 31_536_000), "year");
}

/**
 * Sisa hari menuju sebuah tanggal (deadline).
 * Mengembalikan angka negatif bila sudah lewat.
 */
export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.ceil((target - Date.now()) / 86_400_000);
}
