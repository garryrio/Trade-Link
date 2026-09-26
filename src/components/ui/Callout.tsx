import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CalloutTone = "info" | "warning" | "success" | "danger";

const tones: Record<
  CalloutTone,
  { wrapper: string; icon: string; iconPath: ReactNode }
> = {
  info: {
    wrapper: "border-brand-200 bg-brand-50 text-brand-900",
    icon: "text-brand-600",
    iconPath: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
  },
  warning: {
    wrapper: "border-amber-300 bg-amber-50 text-amber-900",
    icon: "text-amber-600",
    iconPath: (
      <>
        <path d="M10.3 4.3 2.6 17.6A1.6 1.6 0 0 0 4 20h16a1.6 1.6 0 0 0 1.4-2.4L13.7 4.3a1.6 1.6 0 0 0-2.8 0z" />
        <path d="M12 9v4M12 16.5h.01" />
      </>
    ),
  },
  success: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    iconPath: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.2 2.2 4.8-5" />
      </>
    ),
  },
  danger: {
    wrapper: "border-red-200 bg-red-50 text-red-900",
    icon: "text-red-600",
    iconPath: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </>
    ),
  },
};

interface CalloutProps {
  children: ReactNode;
  tone?: CalloutTone;
  title?: string;
  className?: string;
}

export function Callout({
  children,
  tone = "info",
  title,
  className,
}: CalloutProps) {
  const t = tones[tone];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed",
        t.wrapper,
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("mt-0.5 h-5 w-5 shrink-0", t.icon)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {t.iconPath}
      </svg>
      <div className="min-w-0">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

/**
 * Peringatan standar bahwa data di aplikasi ini masih simulasi.
 * Dipakai di beberapa halaman agar pengguna tidak salah paham.
 */
export function SimulationNotice({ className }: { className?: string }) {
  return (
    <Callout tone="warning" title="Data simulasi" className={className}>
      Angka dan profil perusahaan di halaman ini adalah contoh untuk keperluan
      prototipe, bukan data pasar sungguhan. Jangan dipakai sebagai dasar
      keputusan bisnis.
    </Callout>
  );
}
