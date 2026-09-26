"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatIDR, formatNumber } from "@/lib/format";
import type { LineItem } from "@/lib/calculator";

/* ============================================================
   Komponen input & tampilan yang dipakai bersama oleh kalkulator
   impor dan ekspor.

   Catatan desain: seluruh nilai input disimpan sebagai STRING di state
   pemanggil, lalu dikonversi ke angka hanya saat menghitung. Ini supaya
   pengguna tetap bisa mengosongkan field tanpa angkanya melompat jadi 0.
   ============================================================ */

/** Ubah teks input menjadi angka. Menerima koma maupun titik desimal. */
export function toNum(value: string): number {
  if (!value.trim()) return 0;
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Teks di sisi kiri input, mis. "Rp" atau "US$". */
  prefix?: string;
  /** Teks di sisi kanan input, mis. "%" atau "/ kg". */
  suffix?: string;
  hint?: ReactNode;
  placeholder?: string;
  step?: string;
  className?: string;
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  placeholder,
  step = "any",
  className,
}: NumberFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500"
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "field-input tabular-nums",
            prefix && "pl-10",
            suffix && "pr-12",
          )}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500"
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

interface SelectFieldProps<T extends string> {
  id: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  hint?: ReactNode;
  className?: string;
}

export function SelectField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  hint,
  className,
}: SelectFieldProps<T>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="field-input"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

/** Kelompok field dengan judul, supaya form panjang tetap mudah dibaca. */
export function FieldGroup({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card p-6", className)}>
      <h3 className="font-semibold text-navy-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Angka hasil utama yang ditonjolkan. */
export function ResultStat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "brand" | "up" | "down";
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-3.5",
        tone === "brand"
          ? "bg-brand-600 text-white"
          : "border border-slate-200 bg-white",
      )}
    >
      <p
        className={cn(
          "text-xs tracking-wide uppercase",
          tone === "brand" ? "text-white/80" : "text-slate-500",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-xl font-bold tabular-nums",
          tone === "brand"
            ? "text-white"
            : tone === "up"
              ? "text-[var(--color-up)]"
              : tone === "down"
                ? "text-[var(--color-down)]"
                : "text-navy-900",
        )}
      >
        {value}
      </p>
      {sub && (
        <p
          className={cn(
            "mt-0.5 text-xs",
            tone === "brand" ? "text-white/75" : "text-slate-500",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/** Tabel rincian biaya dari hasil kalkulator. */
export function BreakdownTable({ items }: { items: LineItem[] }) {
  return (
    <div className="scrollbar-slim overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <caption className="sr-only">Rincian komponen biaya</caption>
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th
              scope="col"
              className="py-2.5 pr-4 text-xs font-semibold tracking-wide text-slate-600 uppercase"
            >
              Komponen
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold tracking-wide text-slate-600 uppercase"
            >
              Cara hitung
            </th>
            <th
              scope="col"
              className="py-2.5 pl-4 text-right text-xs font-semibold tracking-wide text-slate-600 uppercase"
            >
              Jumlah
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <tr
              key={`${item.label}-${index}`}
              className={cn(item.emphasis && "bg-brand-50/60")}
            >
              <th
                scope="row"
                className={cn(
                  "py-2.5 pr-4 text-left font-normal",
                  item.emphasis
                    ? "font-semibold text-navy-900"
                    : "text-slate-700",
                )}
              >
                {item.label}
              </th>
              <td className="px-4 py-2.5 text-xs text-slate-500">
                {item.formula ?? "-"}
              </td>
              <td
                className={cn(
                  "py-2.5 pl-4 text-right tabular-nums",
                  item.emphasis
                    ? "font-bold text-navy-900"
                    : "text-navy-800",
                )}
              >
                {formatIDR(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Baris "label: nilai" sederhana untuk panel hasil. */
export function ResultRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-2",
        strong && "border-t border-slate-200 pt-2.5",
      )}
    >
      <dt className={cn("text-sm", strong ? "font-semibold text-navy-900" : "text-slate-600")}>
        {label}
      </dt>
      <dd
        className={cn(
          "text-right text-sm tabular-nums",
          strong ? "font-bold text-navy-900" : "font-medium text-navy-800",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** Format angka mata uang asing dengan kode mata uangnya. */
export function foreignAmount(value: number, code: string): string {
  return `${code} ${formatNumber(value, 2)}`;
}
