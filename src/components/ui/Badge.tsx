import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "brand"
  | "navy"
  | "green"
  | "amber"
  | "red"
  | "slate"
  | "violet";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  navy: "bg-navy-50 text-navy-700 border-navy-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  /** Tampilkan titik kecil di depan teks. */
  dot?: boolean;
}

export function Badge({
  children,
  tone = "brand",
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
      )}
      {children}
    </span>
  );
}
